from fastapi import APIRouter, Depends

router = APIRouter(prefix="/agent", tags=["agent"])

# @router.post("/chat")