from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import uuid4


@dataclass(slots=True)
class AuthUser:
    id: str = field(default_factory=lambda: str(uuid4()))
    email: str = ""
    hashed_password: str = ""
    is_active: bool = True
    full_name: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class TokenPayload:
    sub: str
    email: str
    exp: int
