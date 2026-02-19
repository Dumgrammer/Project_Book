from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from models.authmodel import AuthUser
from schemas.auhtschema import (
    AuthResponse,
    LoginRequest,
    OAuthLoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from services.authservice import AuthService, get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    user = auth_service.register_user(payload)
    token = auth_service.create_access_token(user)
    return _build_auth_response(user, token)


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    user = auth_service.authenticate_email_password(payload.email, payload.password)
    token = auth_service.create_access_token(user)
    return _build_auth_response(user, token)


@router.post("/token", response_model=TokenResponse)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    user = auth_service.authenticate_email_password(form_data.username, form_data.password)
    return auth_service.create_access_token(user)


@router.post("/oauth2/firebase", response_model=AuthResponse)
def oauth2_firebase(
    payload: OAuthLoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    user = auth_service.authenticate_firebase_id_token(payload.id_token)
    token = auth_service.create_access_token(user)
    return _build_auth_response(user, token)


@router.get("/me", response_model=UserResponse)
def me(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    user = auth_service.get_current_user(token)
    return UserResponse.model_validate(user)


def _build_auth_response(user: AuthUser, token: TokenResponse) -> AuthResponse:
    return AuthResponse(user=UserResponse.model_validate(user), token=token)
