import base64
import hashlib
import hmac
import importlib
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from types import ModuleType
from typing import TypedDict, cast

from fastapi import HTTPException, status

from config import settings
from models.authmodel import AuthUser, TokenPayload
from schemas.auhtschema import RegisterRequest, TokenResponse


class AccessTokenClaims(TypedDict):
    sub: str
    email: str
    exp: int


class AuthService:
    def __init__(self) -> None:
        self._secret_key = settings.auth_secret_key
        self._token_ttl_seconds = settings.auth_token_ttl_seconds

    def register_user(self, payload: RegisterRequest) -> AuthUser:
        email = payload.email.lower()
        firebase_uid = self._register_user_in_firebase(
            email=email,
            password=payload.password,
            full_name=payload.full_name,
        )
        return self._get_firebase_user_by_uid(firebase_uid)

    def authenticate_email_password(self, email: str, password: str) -> AuthUser:
        api_key = settings.firebase_web_api_key
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="FIREBASE_WEB_API_KEY is required for /auth/login.",
            )

        endpoint = (
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
            f"?key={api_key}"
        )
        request_body = json.dumps(
            {
                "email": email.lower(),
                "password": password,
                "returnSecureToken": True,
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            endpoint,
            data=request_body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            error_detail = "Invalid email or password."
            try:
                error_payload = json.loads(exc.read().decode("utf-8"))
                firebase_message = (
                    error_payload.get("error", {}).get("message")
                    if isinstance(error_payload, dict)
                    else None
                )
                if isinstance(firebase_message, str) and firebase_message:
                    error_detail = f"Firebase sign-in failed: {firebase_message}"
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_detail,
            ) from exc
        except urllib.error.URLError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to reach Firebase sign-in endpoint: {exc}",
            ) from exc

        firebase_uid = response_payload.get("localId")
        if not isinstance(firebase_uid, str) or not firebase_uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase sign-in response did not include a valid user id.",
            )

        return self._get_firebase_user_by_uid(firebase_uid)

    def authenticate_firebase_id_token(self, id_token: str) -> AuthUser:
        firebase_admin, firebase_auth = self._load_firebase_modules()
        if firebase_admin is None or firebase_auth is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="firebase-admin is not installed.",
            )

        self._ensure_firebase_initialized(firebase_admin)

        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as exc:  # noqa: BLE001 - keep detail for easier debugging
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase id_token: {exc}",
            ) from exc

        if not isinstance(decoded, dict):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token payload.",
            )

        email = str(decoded.get("email", "")).lower()
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Firebase token does not include an email claim.",
            )
        firebase_uid = decoded.get("uid") or decoded.get("sub")
        if not isinstance(firebase_uid, str) or not firebase_uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase token does not include a valid uid claim.",
            )

        return self._get_firebase_user_by_uid(firebase_uid)

    def _register_user_in_firebase(self, email: str, password: str, full_name: str | None) -> str:
        firebase_admin, firebase_auth = self._load_firebase_modules()
        if firebase_admin is None or firebase_auth is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="firebase-admin is not installed.",
            )

        self._ensure_firebase_initialized(firebase_admin)

        try:
            created_user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=full_name,
            )
        except Exception as exc:  # noqa: BLE001 - map SDK errors into API errors
            if exc.__class__.__name__ in {"EmailAlreadyExistsError", "AlreadyExistsError"}:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User already exists in Firebase.",
                ) from exc

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create Firebase user: {exc}",
            ) from exc

        uid = getattr(created_user, "uid", None)
        if not isinstance(uid, str) or not uid:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Firebase returned an invalid user uid.",
            )

        return uid

    def create_access_token(self, user: AuthUser) -> TokenResponse:
        expires_at = int(time.time()) + self._token_ttl_seconds
        token = self._encode_token(
            AccessTokenClaims(sub=user.id, email=user.email, exp=expires_at)
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=self._token_ttl_seconds,
        )

    def get_current_user(self, token: str) -> AuthUser:
        payload = self._decode_token(token)
        token_payload = TokenPayload(
            sub=str(payload["sub"]),
            email=str(payload["email"]),
            exp=int(payload["exp"]),
        )
        user = self._get_firebase_user_by_uid(token_payload.sub)
        if user.email.lower() != token_payload.email.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token claims do not match Firebase user data.",
            )
        return user

    def _encode_token(self, payload: AccessTokenClaims) -> str:
        payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
        signature = hmac.new(
            self._secret_key.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
        return f"{payload_b64}.{signature_b64}"

    def _decode_token(self, token: str) -> AccessTokenClaims:
        parts = token.split(".")
        if len(parts) != 2:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format.",
            )

        payload_b64, signature_b64 = parts
        expected_signature = hmac.new(
            self._secret_key.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        actual_signature = self._b64decode(signature_b64)

        if not hmac.compare_digest(expected_signature, actual_signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature.",
            )

        payload_bytes = self._b64decode(payload_b64)
        decoded_payload = json.loads(payload_bytes.decode("utf-8"))
        if not isinstance(decoded_payload, dict):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )

        sub = decoded_payload.get("sub")
        email = decoded_payload.get("email")
        exp = decoded_payload.get("exp")
        if not isinstance(sub, str) or not isinstance(email, str) or not isinstance(exp, int):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload is missing required claims.",
            )

        payload = AccessTokenClaims(sub=sub, email=email, exp=exp)
        if payload["exp"] < int(time.time()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired.",
            )

        return payload

    @staticmethod
    def _b64decode(value: str) -> bytes:
        padding = "=" * (-len(value) % 4)
        return base64.urlsafe_b64decode(value + padding)

    @staticmethod
    def _load_firebase_modules() -> tuple[ModuleType | None, ModuleType | None]:
        try:
            firebase_admin = cast(ModuleType, importlib.import_module("firebase_admin"))
            firebase_auth = cast(ModuleType, importlib.import_module("firebase_admin.auth"))
            return firebase_admin, firebase_auth
        except ImportError:
            return None, None

    def _get_firebase_user_by_uid(self, uid: str) -> AuthUser:
        firebase_admin, firebase_auth = self._load_firebase_modules()
        if firebase_admin is None or firebase_auth is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="firebase-admin is not installed.",
            )

        self._ensure_firebase_initialized(firebase_admin)

        try:
            firebase_user = firebase_auth.get_user(uid)
        except Exception as exc:  # noqa: BLE001 - keep Firebase error text for debugging
            if exc.__class__.__name__ in {"UserNotFoundError", "NotFoundError"}:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Firebase user not found.",
                ) from exc
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load Firebase user: {exc}",
            ) from exc

        user_email = getattr(firebase_user, "email", None)
        if not isinstance(user_email, str) or not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Firebase user does not contain a valid email.",
            )

        is_disabled = bool(getattr(firebase_user, "disabled", False))
        if is_disabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive.",
            )

        return AuthUser(
            id=str(getattr(firebase_user, "uid", uid)),
            email=user_email.lower(),
            hashed_password="",
            is_active=True,
            full_name=getattr(firebase_user, "display_name", None),
        )

    def _ensure_firebase_initialized(self, firebase_admin: ModuleType) -> None:
        firebase_apps = getattr(firebase_admin, "_apps", None)
        if firebase_apps:
            return

        credentials_path = settings.firebase_credentials_path
        project_id = settings.firebase_project_id

        try:
            if credentials_path:
                credentials_file = Path(credentials_path)
                if not credentials_file.is_absolute():
                    project_root = Path(__file__).resolve().parent.parent
                    credentials_file = (project_root / credentials_file).resolve()
                if not credentials_file.exists():
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=(
                            "Firebase credentials file not found at "
                            f"'{credentials_file.as_posix()}'."
                        ),
                    )

                credentials_module = importlib.import_module("firebase_admin.credentials")
                certificate_factory = getattr(credentials_module, "Certificate")
                credential = certificate_factory(str(credentials_file))

                if project_id:
                    firebase_admin.initialize_app(credential, {"projectId": project_id})
                    return

                firebase_admin.initialize_app(credential)
                return

            if project_id:
                firebase_admin.initialize_app(options={"projectId": project_id})
                return

            firebase_admin.initialize_app()
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001 - expose startup problem for debugging
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize Firebase Admin SDK: {exc}",
            ) from exc


_auth_service = AuthService()


def get_auth_service() -> AuthService:
    return _auth_service
