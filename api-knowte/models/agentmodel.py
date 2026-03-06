from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4


@dataclass(slots=True)
class ChatMessage:
    # role: "user" = person asking, "assistant" = AI reply, "system" = hidden instructions
    role: str
    # content: the actual text of the message
    content: str
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class Conversation:
    # id: unique conversation ID, reuse it to continue the same conversation
    id: str = field(default_factory=lambda: str(uuid4()))
    # user_id: the owner of this conversation
    user_id: str = ""
    # messages: full chat history for this conversation
    messages: list[ChatMessage] = field(default_factory=list)
    # model: which Ollama model to use (default: phi3)
    system_prompt: str = ""
    model: str = "phi3"
    created_at: datetime = field(default_factory=datetime.utcnow)
