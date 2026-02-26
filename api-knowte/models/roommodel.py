from dataclasses import dataclass, field
from uuid import uuid4
from datetime import datetime


@dataclass(slots=True)
class Room:
    id: str = field(default_factory=lambda: str(uuid4()))
    r_name: str = ""
    r_tags: list[str] = field(default_factory=list)
    r_description: str = ""
    r_is_private: bool = False
    r_max_members: int = 8
    r_owner_id: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
