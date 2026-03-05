from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from schemas.agentschema import ChatRequest, ChatResponse, ConversationHistoryResponse, ConversationMessagesResponse
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


@router.get("/conversations/{user_id}", response_model=ConversationHistoryResponse)
def get_conversations(
    user_id: str,
    agent: AgentService = Depends(get_agent_service),
) -> ConversationHistoryResponse:
    return agent.get_user_conversations(user_id)


@router.get("/conversations/{user_id}/{conversation_id}", response_model=ConversationMessagesResponse)
def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    agent: AgentService = Depends(get_agent_service),
) -> ConversationMessagesResponse:
    return agent.get_conversation_messages(user_id, conversation_id)
