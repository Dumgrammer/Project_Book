from pydantic import BaseModel, Field


class FlashcardItem(BaseModel):
    question: str = Field(min_length=1, max_length=200)
    answer: str = Field(min_length=1, max_length=300)


class GenerateFlashcardsRequest(BaseModel):
    document_id: str = Field(min_length=1)
    prompt: str = Field(min_length=1, max_length=4096)
    count: int = Field(default=12, ge=3, le=30)


class GenerateFlashcardsResponse(BaseModel):
    document_id: str
    prompt: str
    flashcards: list[FlashcardItem]
    model: str
