from datetime import datetime, timezone
from uuid import UUID
from uuid import uuid4

from fastapi import HTTPException, status
from firebase_admin import firestore

from core.firebase_client import get_firestore_client
from schemas.roomschema import (
	CreateRoomRequest,
	RoomListResponse,
	RoomResponse,
	UpdateRoomRequest,
)

ROOMS_COLLECTION = "rooms"


class RoomService:
	def create_room(self, payload: CreateRoomRequest, owner_id: str) -> RoomResponse:
		client = get_firestore_client()
		try:
			room_id = str(uuid4())
			now = datetime.now(timezone.utc)
			room_data = payload.model_dump()
			row = {
				"id": room_id,
				"r_owner_id": owner_id,
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

			rows = [doc.to_dict() for doc in query.stream()]
			items_rows = rows[:limit]
			next_cursor = None
			if len(rows) > limit and items_rows:
				next_cursor = self._ensure_utc(items_rows[-1]["created_at"])

			return RoomListResponse(
				items=[RoomResponse.model_validate(row) for row in items_rows],
				next_cursor=next_cursor,
			)
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase list failed: {exc}",
			) from exc

	def get_room(self, room_id: UUID) -> RoomResponse:
		client = get_firestore_client()
		try:
			snapshot = client.collection(ROOMS_COLLECTION).document(str(room_id)).get()
			if not snapshot.exists:
				raise HTTPException(
					status_code=status.HTTP_404_NOT_FOUND,
					detail="Room not found.",
				)
			row = snapshot.to_dict() or {}
			return RoomResponse.model_validate(row)
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
			row = doc_ref.get().to_dict() or {}
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
			return True
		except HTTPException:
			raise
		except Exception as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=f"Firebase delete failed: {exc}",
			) from exc

	@staticmethod
	def _ensure_utc(value: datetime) -> datetime:
		if value.tzinfo is None:
			return value.replace(tzinfo=timezone.utc)
		return value


_room_service = RoomService()


def get_room_service() -> RoomService:
	return _room_service
