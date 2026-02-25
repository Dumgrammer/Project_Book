from pydantic import BaseModel, Field

class RoomCreateRequest(BaseModel):
    r_name: str = Field(mind_lenght=1, max_lenght=150)
    r_tags: list[str] = Field(default_factory=list)
    r_description: str = Field(default="")
    r_is_private: bool = Field(default=False)
    r_max_members: int = Field(default=8)
    r_owner_id: str = Field(min_length=1, max_length=150)
