import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import ollama
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from firebase_admin import firestore

from core.firebase_client import get_firestore_client

from config import settings
from models.agentmodel import ChatMessage, Conversation
from schemas.agentschema import ChatRequest, ChatResponse, ConversationHistoryItem, ConversationHistoryResponse, ConversationMessagesResponse

# Default instructions sa AI — pwede mo palitan depende sa use case wink wink
# Ito yung "system prompt" na utos kung paano mag-reply ang AI
DEFAULT_SYSTEM_PROMPT = (
    "You are Knowte AI, a helpful study assistant. "
    "Answer questions clearly and concisely. "
    "When explaining concepts, use examples when helpful.",
    "STRICTLY! follow the instructions and do not add any extra information if not asked. "
)
MAX_CONVERSATIONS = 200
MAX_MESSAGES_PER_CONVERSATION = 50
CONVERSATION_TTL_SECONDS = 60 * 60 * 24  # 24 hours

AGENTS_COLLECTION = "agents"

class AgentService:
    def __init__(self) -> None:
        # Kinukuha yung model name at URL sa config/settings (.env)
        self._model = settings.ollama_model
        # Ollama client na connected sa local Ollama server/ cloud ewan depende sayo sah
        self._client = ollama.Client(host=settings.ollama_base_url)
        # In-memory storage ng mga conversations — mawawala pag nag-restart ang server
        #NOTE will change this to a database storage later
        self._conversations: dict[str, Conversation] = {}

    def chat(self, request: ChatRequest) -> ChatResponse:
        self._cleanup_expired_conversations()
        #Check if it has an existing convo
        conversation = self._get_or_create_conversation(request)
        # I-save yung message ng user sa conversation history
        self._append_user_message(conversation, request.message)

        # Buuin yung listahan ng messages na ipapadala sa Ollama (system + history + current)
        messages = self._build_messages(conversation, request.system_prompt)

        try:
            # Resend lahat ng message
            response = self._client.chat(model=self._model, messages=messages)
        except ollama.ResponseError as exc:
            # Ollama innate error
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ollama error: {exc.error}",
            ) from exc
        except Exception as exc:
            # Server error
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cannot reach Ollama: {exc}",
            ) from exc

        # Get the reply text from the response
        reply = response.message.content
        # Save the AI reply to the conversation history for the next question
        conversation.messages.append(ChatMessage(role="assistant", content=reply))
        self._trim_messages(conversation)

        return ChatResponse(
            conversation_id=conversation.id,
            reply=reply,
            model=self._model,
        )

    def chat_stream(self, request: ChatRequest) -> StreamingResponse:
        self._cleanup_expired_conversations()
        # Real-time streaming for frontend
        conversation = self._get_or_create_conversation(request)
        self._append_user_message(conversation, request.message)

        messages = self._build_messages(conversation, request.system_prompt)

        # SSE (Server-Sent Events) — frontend receives data chunks as the AI generates
        return StreamingResponse(
            self._stream(conversation, messages),
            media_type="text/event-stream",
        )

    def _get_or_create_conversation(self, request: ChatRequest) -> Conversation:
        client = get_firestore_client()

        # Check if conversation already exists in Firestore
        if request.conversation_id:
            try:
                doc = client.collection(AGENTS_COLLECTION).document(request.conversation_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    # Verify the conversation belongs to this user
                    if data.get("user_id") != request.user_id:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="This conversation does not belong to you.",
                        )
                    # Conversation exists in Firestore, reuse from in-memory cache
                    if request.conversation_id in self._conversations:
                        return self._conversations[request.conversation_id]
                    conv = Conversation(
                        id=request.conversation_id,
                        user_id=request.user_id,
                        model=self._model,
                    )
                    for msg in request.history:
                        conv.messages.append(ChatMessage(role=msg.role, content=msg.content))
                    self._trim_messages(conv)
                    self._conversations[conv.id] = conv
                    return conv
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error fetching conversation: {exc}",
                ) from exc

        # Create a new conversation
        conversation_id = str(uuid4())
        now = datetime.now(timezone.utc)

        try:
            row = {
                "conversation_id": conversation_id,
                "user_id": request.user_id,
                "created_at": now,
                "updated_at": now,
                "agent_data": request.model_dump(),
            }
            client.collection(AGENTS_COLLECTION).document(conversation_id).set(row)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating conversation: {exc}",
            ) from exc

        conv = Conversation(
            id=conversation_id,
            user_id=request.user_id,
            model=self._model,
        )
        for msg in request.history:
            conv.messages.append(ChatMessage(role=msg.role, content=msg.content))

        self._trim_messages(conv)
        self._evict_if_needed()
        self._conversations[conv.id] = conv
        return conv

    def get_user_conversations(self, user_id: str) -> ConversationHistoryResponse:
        """Fetch all conversations belonging to a user from Firestore."""
        client = get_firestore_client()
        try:
            docs = (
                client.collection(AGENTS_COLLECTION)
                .where("user_id", "==", user_id)
                .order_by("updated_at", direction=firestore.Query.DESCENDING)
                .stream()
            )
            items = []
            for doc in docs:
                data = doc.to_dict()
                items.append(ConversationHistoryItem(
                    conversation_id=data["conversation_id"],
                    created_at=str(data.get("created_at", "")),
                    updated_at=str(data.get("updated_at", "")),
                ))
            return ConversationHistoryResponse(conversations=items)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching conversations: {exc}",
            ) from exc

    def get_conversation_messages(self, user_id: str, conversation_id: str) -> ConversationMessagesResponse:
        """Fetch messages for a specific conversation, verifying ownership."""
        client = get_firestore_client()
        try:
            doc = client.collection(AGENTS_COLLECTION).document(conversation_id).get()
            if not doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found.",
                )
            data = doc.to_dict()
            if data.get("user_id") != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This conversation does not belong to you.",
                )
            agent_data = data.get("agent_data", {})
            history = agent_data.get("history", [])
            # Also include messages from in-memory cache if available
            if conversation_id in self._conversations:
                conv = self._conversations[conversation_id]
                messages = [{"role": m.role, "content": m.content} for m in conv.messages]
            else:
                messages = history
            return ConversationMessagesResponse(
                conversation_id=conversation_id,
                messages=messages,
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching messages: {exc}",
            ) from exc

    def _append_user_message(self, conversation: Conversation, content: str) -> None:
        conversation.messages.append(ChatMessage(role="user", content=content))
        self._trim_messages(conversation)

    def _build_messages(
        self, conversation: Conversation, system_prompt: str | None
    ) -> list[dict[str, str]]:
        # Always starts with system prompt — the first instruction to the AI
        prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
        messages: list[dict[str, str]] = [{"role": "system", "content": prompt}]
        # Next all history messages (user and assistant previous messages)
        for msg in conversation.messages:
            messages.append({"role": msg.role, "content": msg.content})
        return messages

    def _stream(self, conversation: Conversation, messages: list[dict[str, str]]):
        full_reply = ""

        try:
            # stream=True — Ollama sends response in chunks
            stream = self._client.chat(
                model=self._model,
                messages=messages,
                stream=True,
            )

            for chunk in stream:
                # Each chunk has a piece of text (delta) and whether it's done (done)
                delta = chunk.message.content
                done = chunk.done
                full_reply += delta

                # Format as SSE for frontend to receive
                sse_data = json.dumps({
                    "conversation_id": conversation.id,
                    "delta": delta,
                    "done": done,
                })
                yield f"data: {sse_data}\n\n"

                if done:
                    break

        except Exception as exc:
            # If there is an error while streaming, send the error as the final chunk
            error_chunk = json.dumps({
                "conversation_id": conversation.id,
                "delta": f"Error: {exc}",
                "done": True,
            })
            yield f"data: {error_chunk}\n\n"
            return

        # After streaming is done, save the full reply to the conversation history
        conversation.messages.append(ChatMessage(role="assistant", content=full_reply))
        self._trim_messages(conversation)

    def _trim_messages(self, conversation: Conversation) -> None:
        if len(conversation.messages) > MAX_MESSAGES_PER_CONVERSATION:
            conversation.messages = conversation.messages[-MAX_MESSAGES_PER_CONVERSATION:]

    def _evict_if_needed(self) -> None:
        while len(self._conversations) >= MAX_CONVERSATIONS:
            oldest_id = next(iter(self._conversations))
            self._conversations.pop(oldest_id, None)

    def _cleanup_expired_conversations(self) -> None:
        now = datetime.utcnow()
        expired_ids = [
            conv_id
            for conv_id, conv in self._conversations.items()
            if (now - conv.created_at) > timedelta(seconds=CONVERSATION_TTL_SECONDS)
        ]
        for conv_id in expired_ids:
            self._conversations.pop(conv_id, None)


# One instance of AgentService — used for all requests (singleton pattern)
_agent_service = AgentService()


# Dependency injection for FastAPI — used in routes via Depends()
def get_agent_service() -> AgentService:
    return _agent_service
