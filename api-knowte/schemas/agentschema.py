from pydantic import BaseModel

class ChatRequest(BaseModel):
    file_path: str