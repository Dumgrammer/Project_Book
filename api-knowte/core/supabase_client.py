from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client

from config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_key
    if not settings.supabase_url or not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY) "
                "must be configured."
            ),
        )

    try:
        return create_client(settings.supabase_url, key)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Supabase client: {exc}",
        ) from exc
