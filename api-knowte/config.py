import os
from dataclasses import dataclass
from pathlib import Path


def _parse_int(value: str | None, default: int) -> int:
    if value is None:
        return default

    try:
        return int(value)
    except ValueError:
        return default


def _parse_csv(value: str | None) -> list[str]:
    if value is None:
        return ["*"]

    parsed = [item.strip() for item in value.split(",") if item.strip()]
    if not parsed:
        return ["*"]

    return parsed


def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str
    app_env: str
    app_host: str
    app_port: int
    cors_origins: list[str]
    auth_secret_key: str
    auth_salt: str
    auth_token_ttl_seconds: int
    firebase_credentials_path: str | None
    firebase_project_id: str | None
    firebase_web_api_key: str | None
    supabase_url: str | None
    supabase_key: str | None
    supabase_service_role_key: str | None
    ollama_base_url: str
    ollama_model: str


def load_settings() -> Settings:
    _load_env_file()
    return Settings(
        app_name=os.getenv("APP_NAME", "Knowte API"),
        app_env=os.getenv("APP_ENV", "development"),
        app_host=os.getenv("APP_HOST", "127.0.0.1"),
        app_port=_parse_int(os.getenv("APP_PORT"), 8000),
        cors_origins=_parse_csv(os.getenv("CORS_ORIGINS")),
        auth_secret_key=os.getenv("AUTH_SECRET_KEY", "dev-secret-change-me"),
        auth_salt=os.getenv("AUTH_SALT", "dev-salt-change-me"),
        auth_token_ttl_seconds=_parse_int(os.getenv("AUTH_TOKEN_TTL_SECONDS"), 3600),
        firebase_credentials_path=os.getenv("FIREBASE_CREDENTIALS_PATH"),
        firebase_project_id=os.getenv("FIREBASE_PROJECT_ID"),
        firebase_web_api_key=os.getenv("FIREBASE_WEB_API_KEY"),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "phi3"),
    )


settings = load_settings()
