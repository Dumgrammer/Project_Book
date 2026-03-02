from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class RoomResponse(BaseModel):
    id: UUID
    r_code: str
    r_name: str
    r_tags: list[str]
    r_description: str
    r_is_private: bool
    r_max_members: int
    r_owner_id: str
    r_members: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateRoomRequest(BaseModel):
    r_name: str = Field(min_length=1, max_length=150)
    r_tags: list[str] = Field(default_factory=list)
    r_description: str = Field(default="")
    r_is_private: bool = Field(default=False)
    r_max_members: int = Field(default=8, ge=1, le=100)


class UpdateRoomRequest(BaseModel):
    r_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    r_tags: Optional[list[str]] = None
    r_description: Optional[str] = None
    r_is_private: Optional[bool] = None
    r_max_members: Optional[int] = Field(default=None, ge=1, le=100)

    model_config = ConfigDict(extra="forbid")


class RoomListResponse(BaseModel):
    items: list[RoomResponse]
    next_cursor: Optional[datetime] = None


class DeleteRoomResponse(BaseModel):
    id: UUID
    deleted: bool


class JoinRoomResponse(BaseModel):
    room_id: UUID
    user_id: str
    joined_at: datetime


class JoinRoomByCodeRequest(BaseModel):
    r_code: str = Field(min_length=4, max_length=32)


class RoomChatMessageResponse(BaseModel):
    id: UUID
    room_id: UUID
    user_id: str
    message: str
    created_at: datetime


class SendRoomChatMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class RoomChatListResponse(BaseModel):
    items: list[RoomChatMessageResponse]
