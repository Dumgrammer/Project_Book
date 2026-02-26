from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.security import OAuth2PasswordBearer

from models.authmodel import AuthUser
from schemas.roomschema import (
	CreateRoomRequest,
	DeleteRoomResponse,
	RoomListResponse,
	RoomResponse,
	UpdateRoomRequest,
)
from services.authservice import AuthService, get_auth_service
from services.roomservice import RoomService, get_room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


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
	room_service: RoomService = Depends(get_room_service),
) -> RoomListResponse:
	return room_service.list_rooms(limit=limit, cursor=cursor, owner_id=owner_id)


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
	room_id: UUID,
	room_service: RoomService = Depends(get_room_service),
) -> RoomResponse:
	return room_service.get_room(room_id)


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
