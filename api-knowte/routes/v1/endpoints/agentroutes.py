from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from schemas.agentschema import ChatRequest, ChatResponse
from services.agentservice import AgentService, get_agent_service

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    agent: AgentService = Depends(get_agent_service),
) -> ChatResponse:
    return agent.chat(payload)


@router.post("/chat/stream")
def chat_stream(
    payload: ChatRequest,
    agent: AgentService = Depends(get_agent_service),
) -> StreamingResponse:
    return agent.chat_stream(payload)
