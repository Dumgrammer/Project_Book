from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import uuid4
from pydantic import Field

@dataclass(slots=True)
class AuthUser:
    id: str = field(default_factory=lambda: str(uuid4()))
    email: str = ""
    hashed_password: str = ""
    is_active: bool = True
    f_name: str = Field(min_length=2, max_length=150)
    m_name: str = Field(default="")
    l_name: str = Field(min_length=2, max_length=150)
    sex: str = Field(pattern="^(male|female|other)$")
    birth_date: datetime = Field(default=datetime.utcnow())
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class TokenPayload:
    sub: str
    email: str
    exp: int
