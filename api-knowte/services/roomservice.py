from datetime import datetime, timezone
from threading import Lock
from uuid import UUID
from uuid import uuid4
import secrets
import string

from fastapi import HTTPException, status
from firebase_admin import firestore

from core.firebase_client import get_firestore_client
from schemas.roomschema import (
	CreateRoomRequest,
	JoinRoomByCodeRequest,
	JoinRoomResponse,
	RoomFetchResponse,
	RoomChatMessageResponse,
	RoomChatListResponse,
	RoomListResponse,
	RoomResponse,
	SendRoomChatMessageRequest,
	UpdateRoomRequest,
)

ROOMS_COLLECTION = "rooms"


class RoomService:
	def __init__(self) -> None:
		self._room_chat_messages: dict[str, list[dict[str, object]]] = {}
		self._memory_lock = Lock()

	def create_room(self, payload: CreateRoomRequest, owner_id: str) -> RoomResponse:
		client = get_firestore_client()
		try:
			room_id = str(uuid4())
			r_code = self._generate_unique_room_code(client)
			now = datetime.now(timezone.utc)
			room_data = payload.model_dump()
			row = {
				"id": room_id,
				"r_code": r_code,
				"r_owner_id": owner_id,
				"r_members": [owner_id],
				"created_at": now,
				"updated_at": now,
				**room_data,
			}
			client.collection(ROOMS_COLLECTION).document(room_id).set(row)
			return RoomResponse.model_validate(row)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase create failed: {exc}",
			) from exc

	def list_rooms(
		self,
		user_id: str,
		limit: int = 20,
		cursor: datetime | None = None,
		owner_id: str | None = None,
	) -> RoomListResponse:
		client = get_firestore_client()
		try:
			query = client.collection(ROOMS_COLLECTION)
			if cursor is not None:
				query = query.where("created_at", "<", self._ensure_utc(cursor))
			if owner_id:
				query = query.where("r_owner_id", "==", owner_id)
			query = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit + 1)

			rows = [self._normalize_room_row(doc.to_dict() or {}, room_id=doc.id) for doc in query.stream()]
			rows = [row for row in rows if self._can_view_room(row, user_id)]
			items_rows = rows[:limit]
			next_cursor = None
			if len(rows) > limit and items_rows:
				next_cursor = self._ensure_utc(items_rows[-1]["created_at"])

			return RoomListResponse(
				items=[RoomFetchResponse.model_validate(row) for row in items_rows],
				next_cursor=next_cursor,
			)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase list failed: {exc}",
			) from exc

	def get_room(self, room_id: UUID, user_id: str) -> RoomFetchResponse:
		client = get_firestore_client()
		try:
			snapshot = client.collection(ROOMS_COLLECTION).document(str(room_id)).get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)
			row = self._normalize_room_row(snapshot.to_dict() or {}, room_id=str(room_id))
			if not self._can_view_room(row, user_id):
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)
			return RoomFetchResponse.model_validate(row)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase read failed: {exc}",
			) from exc

	def update_room(self, room_id: UUID, payload: UpdateRoomRequest) -> RoomResponse:
		updates = payload.model_dump(exclude_none=True)
		if not updates:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="No fields provided for update.",
			)

		updates["updated_at"] = datetime.now(timezone.utc)

		client = get_firestore_client()
		try:
			doc_ref = client.collection(ROOMS_COLLECTION).document(str(room_id))
			snapshot = doc_ref.get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)
			doc_ref.update(updates)
			row = self._normalize_room_row(doc_ref.get().to_dict() or {}, room_id=str(room_id))
			return RoomResponse.model_validate(row)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase update failed: {exc}",
			) from exc

	def delete_room(self, room_id: UUID) -> bool:
		client = get_firestore_client()
		try:
			doc_ref = client.collection(ROOMS_COLLECTION).document(str(room_id))
			snapshot = doc_ref.get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)

			doc_ref.delete()
			with self._memory_lock:
				self._room_chat_messages.pop(str(room_id), None)
			return True
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase delete failed: {exc}",
			) from exc

	def join_room(self, room_id: UUID, user_id: str) -> JoinRoomResponse:
		now = datetime.now(timezone.utc)
		client = get_firestore_client()
		try:
			doc_ref = client.collection(ROOMS_COLLECTION).document(str(room_id))
			snapshot = doc_ref.get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)

			row = self._normalize_room_row(snapshot.to_dict() or {}, room_id=str(room_id))
			members = row.get("r_members") or []
			if user_id in members:
				return JoinRoomResponse(
					status="already_member",
					room_id=room_id,
					user_id=user_id,
					joined_at=now,
				)

			if bool(row.get("r_is_private", False)):
				pending_members = row.get("r_pending_member_ids") or []
				if user_id not in pending_members:
					doc_ref.update(
						{
							"r_pending_member_ids": firestore.ArrayUnion([user_id]),
							"updated_at": now,
						}
					)

				return JoinRoomResponse(
					status="pending_approval",
					room_id=room_id,
					user_id=user_id,
					requested_at=now,
					approval_required=True,
				)

			doc_ref.update(
				{
					"r_members": firestore.ArrayUnion([user_id]),
					"updated_at": now,
				}
			)

			return JoinRoomResponse(
				status="joined",
				room_id=room_id,
				user_id=user_id,
				joined_at=now,
			)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase join failed: {exc}",
			) from exc

	def join_room_by_code(self, payload: JoinRoomByCodeRequest, user_id: str) -> JoinRoomResponse:
		client = get_firestore_client()
		code = payload.r_code.strip().upper()
		try:
			query = (
				client.collection(ROOMS_COLLECTION)
				.where("r_code", "==", code)
				.limit(1)
			)
			docs = list(query.stream())
			if not docs:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)

			room_id = docs[0].id
			return self.join_room(UUID(room_id), user_id)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase join-by-code failed: {exc}",
			) from exc

	def approve_join_request(self, room_id: UUID, approver_id: str, user_id: str) -> JoinRoomResponse:
		approved_at = datetime.now(timezone.utc)
		client = get_firestore_client()
		try:
			doc_ref = client.collection(ROOMS_COLLECTION).document(str(room_id))
			snapshot = doc_ref.get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)

			row = self._normalize_room_row(snapshot.to_dict() or {}, room_id=str(room_id))
			if not self._can_manage_room_members(row, approver_id):
				raise HTTPException(
					status_code=status.HTTP_403_FORBIDDEN,
					detail="Only room owner or co-admin can approve join requests.",
				)

			members = row.get("r_members") or []
			if user_id in members:
				return JoinRoomResponse(
					status="already_member",
					room_id=room_id,
					user_id=user_id,
					joined_at=approved_at,
				)

			pending_members = row.get("r_pending_member_ids") or []
			if user_id not in pending_members:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Join request not found.",
				)

			doc_ref.update(
				{
					"r_pending_member_ids": firestore.ArrayRemove([user_id]),
					"r_members": firestore.ArrayUnion([user_id]),
					"updated_at": approved_at,
				}
			)

			return JoinRoomResponse(
				status="joined",
				room_id=room_id,
				user_id=user_id,
				joined_at=approved_at,
			)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase approve failed: {exc}",
			) from exc

	def is_room_member(self, room_id: UUID, user_id: str) -> bool:
		row = self._get_room_row(room_id)
		members = row.get("r_members") or []
		return isinstance(members, list) and user_id in members

	def add_chat_message(
		self,
		room_id: UUID,
		user_id: str,
		payload: SendRoomChatMessageRequest,
	) -> RoomChatMessageResponse:
		self._ensure_room_exists(room_id)
		if not self.is_room_member(room_id, user_id):
			raise HTTPException(
				status_code=status.HTTP_403_FORBIDDEN,
				detail="Join the room before sending messages.",
			)

		message = {
			"id": str(uuid4()),
			"room_id": str(room_id),
			"user_id": user_id,
			"message": payload.message,
			"created_at": datetime.now(timezone.utc),
		}

		with self._memory_lock:
			room_messages = self._room_chat_messages.setdefault(str(room_id), [])
			room_messages.append(message)

		return RoomChatMessageResponse.model_validate(message)

	def list_chat_messages(self, room_id: UUID, user_id: str, limit: int = 50) -> RoomChatListResponse:
		self._ensure_room_exists(room_id)
		if not self.is_room_member(room_id, user_id):
			raise HTTPException(
				status_code=status.HTTP_403_FORBIDDEN,
				detail="Join the room before viewing messages.",
			)

		with self._memory_lock:
			room_messages = self._room_chat_messages.get(str(room_id), [])
			items_rows = room_messages[-limit:]

		return RoomChatListResponse(
			items=[RoomChatMessageResponse.model_validate(row) for row in items_rows]
		)

	def _ensure_room_exists(self, room_id: UUID) -> None:
		self._get_room_row(room_id)

	def _get_room_row(self, room_id: UUID) -> dict[str, object]:
		client = get_firestore_client()
		try:
			snapshot = client.collection(ROOMS_COLLECTION).document(str(room_id)).get()
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase read failed: {exc}",
			) from exc

		if not snapshot.exists:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Room not found.",
			)

		return self._normalize_room_row(snapshot.to_dict() or {}, room_id=str(room_id))

	def _generate_unique_room_code(self, client, length: int = 6) -> str:
		alphabet = string.ascii_uppercase + string.digits
		for _ in range(10):
			code = "".join(secrets.choice(alphabet) for _ in range(length))
			existing = (
				client.collection(ROOMS_COLLECTION)
				.where("r_code", "==", code)
				.limit(1)
			)
			if not list(existing.stream()):
				return code

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Failed to generate unique room code.",
		)

	def _normalize_room_row(self, row: dict[str, object], room_id: str | None = None) -> dict[str, object]:
		normalized = dict(row)

		resolved_id = room_id or str(normalized.get("id", ""))
		if resolved_id and "id" not in normalized:
			normalized["id"] = resolved_id

		owner_id = str(normalized.get("r_owner_id", "")).strip()
		members_raw = normalized.get("r_members")
		co_admins_raw = normalized.get("r_co_admin_ids")
		pending_members_raw = normalized.get("r_pending_member_ids")
		members: list[str]
		co_admins: list[str]
		pending_members: list[str]
		if isinstance(members_raw, list):
			members = [str(member) for member in members_raw if str(member).strip()]
		else:
			members = []

		if isinstance(co_admins_raw, list):
			co_admins = [str(admin_id) for admin_id in co_admins_raw if str(admin_id).strip()]
		else:
			co_admins = []

		if isinstance(pending_members_raw, list):
			pending_members = [str(member) for member in pending_members_raw if str(member).strip()]
		else:
			pending_members = []

		if owner_id and owner_id not in members:
			members.append(owner_id)

		members = list(dict.fromkeys(members))
		co_admins = [admin_id for admin_id in dict.fromkeys(co_admins) if admin_id != owner_id]
		pending_members = [member_id for member_id in dict.fromkeys(pending_members) if member_id not in members]

		normalized["r_members"] = members
		normalized["r_co_admin_ids"] = co_admins
		normalized["r_pending_member_ids"] = pending_members

		room_code = normalized.get("r_code")
		if not isinstance(room_code, str) or not room_code.strip():
			normalized["r_code"] = self._derive_room_code(resolved_id)

		return normalized

	@staticmethod
	def _can_manage_room_members(row: dict[str, object], user_id: str) -> bool:
		owner_id = str(row.get("r_owner_id", "")).strip()
		co_admins = row.get("r_co_admin_ids") or []
		if user_id == owner_id:
			return True
		return isinstance(co_admins, list) and user_id in co_admins

	@staticmethod
	def _can_view_room(row: dict[str, object], user_id: str) -> bool:
		if not bool(row.get("r_is_private", False)):
			return True

		members = row.get("r_members") or []
		return isinstance(members, list) and user_id in members

	@staticmethod
	def _derive_room_code(room_id: str) -> str:
		if not room_id:
			return "ROOM00"
		collapsed = room_id.replace("-", "").upper()
		if len(collapsed) >= 6:
			return collapsed[:6]
		return (collapsed + "ROOM00")[:6]

	@staticmethod
	def _ensure_utc(value: datetime) -> datetime:
		if value.tzinfo is None:
			return value.replace(tzinfo=timezone.utc)
		return value


_room_service = RoomService()


def get_room_service() -> RoomService:
	return _room_service
