from pydantic import BaseModel, Field


class MessageItem(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    # user_id: identifies who owns this conversation
    user_id: str = Field(min_length=1)
    # message: what the user is asking right now
    message: str = Field(min_length=1, max_length=4096)
    # conversation_id: reuse to continue a conversation, or omit to start a new one
    conversation_id: str | None = None
    # history: previous messages (role + content) for context when starting from scratch
    history: list[MessageItem] = Field(default_factory=list)
    # system_prompt: hidden instructions that shape the AI's behavior (not visible to the user)
    system_prompt: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    model: str


class StreamChunk(BaseModel):
    conversation_id: str
    delta: str
    done: bool


class ConversationHistoryItem(BaseModel):
    conversation_id: str
    created_at: str
    updated_at: str
    first_content: str | None = None


class ConversationHistoryResponse(BaseModel):
    conversations: list[ConversationHistoryItem]


class ConversationMessagesResponse(BaseModel):
    conversation_id: str
    messages: list[MessageItem]
