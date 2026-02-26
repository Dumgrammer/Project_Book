from functools import lru_cache
import importlib
from pathlib import Path
from types import ModuleType

from fastapi import HTTPException, status

from config import settings


def _load_firebase_admin_module() -> ModuleType:
    try:
        return importlib.import_module("firebase_admin")
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="firebase-admin is not installed.",
        ) from exc


@lru_cache(maxsize=1)
def get_firestore_client() -> object:
    firebase_admin = _load_firebase_admin_module()
    firestore_module = importlib.import_module("firebase_admin.firestore")
    _ensure_firebase_initialized(firebase_admin)
    return firestore_module.client()


def _ensure_firebase_initialized(firebase_admin: ModuleType) -> None:
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
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Firebase Admin SDK: {exc}",
        ) from exc
