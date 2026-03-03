from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=300)
    options: list[str] = Field(min_length=4, max_length=4)
    answer: str = Field(min_length=1, max_length=200)
    explanation: str | None = Field(default=None, max_length=400)


class GenerateQuizRequest(BaseModel):
    document_id: str = Field(min_length=1)
    prompt: str = Field(min_length=1, max_length=4096)
    count: int = Field(default=10, ge=3, le=20)


class GenerateQuizResponse(BaseModel):
    document_id: str
    prompt: str
    questions: list[QuizQuestion]
    model: str
