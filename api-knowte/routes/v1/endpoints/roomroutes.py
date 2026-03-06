from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, File, WebSocket, WebSocketDisconnect, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError

from models.authmodel import AuthUser
from schemas.roomschema import (
	CreateRoomRequest,
	DeleteRoomResponse,
	JoinRoomByCodeRequest,
	JoinRoomResponse,
	RoomAIChatResponse,
	RoomFetchResponse,
	RoomChatListResponse,
	RoomChatMessageResponse,
	SendRoomAIChatMessageRequest,
	SendRoomChatMessageRequest,
	RoomListResponse,
	RoomResponse,
	UpdateRoomRequest,
)
from services.authservice import AuthService, get_auth_service
from services.roomservice import RoomService, get_room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


class RoomChatConnectionManager:
	def __init__(self) -> None:
		self._connections: dict[str, set[WebSocket]] = {}

	async def connect(self, room_id: UUID, websocket: WebSocket) -> None:
		await websocket.accept()
		room_key = str(room_id)
		if room_key not in self._connections:
			self._connections[room_key] = set()
		self._connections[room_key].add(websocket)

	def disconnect(self, room_id: UUID, websocket: WebSocket) -> None:
		room_key = str(room_id)
		connections = self._connections.get(room_key)
		if not connections:
			return
		connections.discard(websocket)
		if not connections:
			self._connections.pop(room_key, None)

	async def broadcast(self, room_id: UUID, payload: dict[str, object]) -> None:
		room_key = str(room_id)
		connections = list(self._connections.get(room_key, set()))
		for connection in connections:
			await connection.send_json(payload)


chat_connection_manager = RoomChatConnectionManager()


def get_current_user(
	token: str = Depends(oauth2_scheme),
	auth_service: AuthService = Depends(get_auth_service),
) -> AuthUser:
	return auth_service.get_current_user(token)


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
	payload: CreateRoomRequest,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomResponse:
	return room_service.create_room(payload, owner_id=current_user.id)


@router.get("", response_model=RoomListResponse)
def list_rooms(
	limit: int = Query(default=20, ge=1, le=100),
	cursor: datetime | None = Query(default=None),
	owner_id: str | None = Query(default=None, min_length=1, max_length=150),
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomListResponse:
	return room_service.list_rooms(user_id=current_user.id, limit=limit, cursor=cursor, owner_id=owner_id)


@router.get("/{room_id}", response_model=RoomFetchResponse)
def get_room(
	room_id: UUID,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomFetchResponse:
	return room_service.get_room(room_id, current_user.id)


@router.patch("/{room_id}", response_model=RoomResponse)
def update_room(
	room_id: UUID,
	payload: UpdateRoomRequest,
	room_service: RoomService = Depends(get_room_service),
) -> RoomResponse:
	return room_service.update_room(room_id, payload)


@router.delete("/{room_id}", response_model=DeleteRoomResponse)
def delete_room(
	room_id: UUID,
	room_service: RoomService = Depends(get_room_service),
) -> DeleteRoomResponse:
	deleted = room_service.delete_room(room_id)
	return DeleteRoomResponse(id=room_id, deleted=deleted)


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
def join_room(
	room_id: UUID,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> JoinRoomResponse:
	return room_service.join_room(room_id, current_user.id)


@router.post("/join", response_model=JoinRoomResponse)
def join_room_by_code(
	payload: JoinRoomByCodeRequest,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> JoinRoomResponse:
	return room_service.join_room_by_code(payload, current_user.id)


@router.post("/{room_id}/join-requests/{target_user_id}/approve", response_model=JoinRoomResponse)
def approve_join_request(
	room_id: UUID,
	target_user_id: str,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> JoinRoomResponse:
	return room_service.approve_join_request(room_id, approver_id=current_user.id, user_id=target_user_id)


@router.get("/{room_id}/chat", response_model=RoomChatListResponse)
def list_room_chat(
	room_id: UUID,
	limit: int = Query(default=50, ge=1, le=200),
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomChatListResponse:
	return room_service.list_chat_messages(room_id, current_user.id, limit=limit)


@router.post("/{room_id}/chat", response_model=RoomChatMessageResponse)
def send_room_chat_message(
	room_id: UUID,
	payload: SendRoomChatMessageRequest,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomChatMessageResponse:
	return room_service.add_chat_message(room_id, current_user.id, payload)


@router.post("/{room_id}/chat/ai", response_model=RoomAIChatResponse)
async def send_room_ai_chat_message(
	room_id: UUID,
	payload: SendRoomAIChatMessageRequest,
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomAIChatResponse:
	response = room_service.add_ai_chat_message(room_id, current_user.id, payload)
	await chat_connection_manager.broadcast(
		room_id,
		{
			"type": "chat_message",
			"data": response.user_message.model_dump(mode="json"),
		},
	)
	await chat_connection_manager.broadcast(
		room_id,
		{
			"type": "chat_message",
			"data": response.ai_message.model_dump(mode="json"),
		},
	)
	return response


@router.post("/{room_id}/chat/upload", response_model=RoomChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def upload_room_chat_file(
	room_id: UUID,
	file: UploadFile = File(...),
	message: str = Form(default=""),
	current_user: AuthUser = Depends(get_current_user),
	room_service: RoomService = Depends(get_room_service),
) -> RoomChatMessageResponse:
	response = room_service.upload_chat_file(room_id, current_user.id, file, message)
	await chat_connection_manager.broadcast(
		room_id,
		{
			"type": "chat_message",
			"data": response.model_dump(mode="json"),
		},
	)
	return response


@router.websocket("/{room_id}/chat/stream")
async def stream_room_chat(
	websocket: WebSocket,
	room_id: UUID,
	room_service: RoomService = Depends(get_room_service),
	auth_service: AuthService = Depends(get_auth_service),
) -> None:
	token = websocket.query_params.get("token")
	if not token:
		await websocket.close(code=1008, reason="Missing access token.")
		return

	try:
		current_user = auth_service.get_current_user(token)
	except HTTPException:
		await websocket.close(code=1008, reason="Invalid access token.")
		return

	if not room_service.is_room_member(room_id, current_user.id):
		await websocket.close(code=1008, reason="Join room first.")
		return

	await chat_connection_manager.connect(room_id, websocket)
	try:
		while True:
			incoming = await websocket.receive_json()
			try:
				payload = SendRoomChatMessageRequest.model_validate(incoming)
			except ValidationError:
				await websocket.send_json({"type": "error", "detail": "Invalid message payload."})
				continue

			message = room_service.add_chat_message(room_id, current_user.id, payload)
			await chat_connection_manager.broadcast(
				room_id,
				{
					"type": "chat_message",
					"data": message.model_dump(mode="json"),
				},
			)
	except WebSocketDisconnect:
		pass
	finally:
		chat_connection_manager.disconnect(room_id, websocket)
