from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    # Returned after uploading a document
    document_id: str
    filename: str
    page_count: int


class DocumentQuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1024)
    page: int = Field(default=1, ge=1)


class DocumentQuestionResponse(BaseModel):
    document_id: str
    question: str
    answer: str
    confidence: float
    model: str
