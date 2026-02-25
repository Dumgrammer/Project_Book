from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import date

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    f_name: str = Field(min_length=2, max_length=150)
    m_name: str | None = None
    l_name: str = Field(min_length=2, max_length=150)
    sex: str = Field(pattern="^(male|female|other)$")
    birth_date: date = Field(le=date.today())



class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128) 


class OAuthLoginRequest(BaseModel):
    id_token: str = Field(min_length=16)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    f_name: str = Field(min_length=2, max_length=150)
    m_name: str | None = None
    l_name: str = Field(min_length=2, max_length=150)
    sex: str = Field(pattern="^(male|female|other)$")
    birth_date: date = Field(le=date.today())

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse
