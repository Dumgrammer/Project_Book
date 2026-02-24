from fastapi import APIRouter, Depends, UploadFile, File

from schemas.documentschema import (
    DocumentQuestionRequest,
    DocumentQuestionResponse,
    DocumentUploadResponse,
)
from services.documentservice import DocumentService, get_document_service

router = APIRouter(prefix="/document", tags=["document"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
def upload_document(
    file: UploadFile = File(...),
    doc_service: DocumentService = Depends(get_document_service),
) -> DocumentUploadResponse:
    """Upload a PDF file.
    Convert each page to image for Donut.
    """
    return doc_service.upload_document(file)


@router.post("/{document_id}/ask", response_model=DocumentQuestionResponse)
def ask_document(
    document_id: str,
    payload: DocumentQuestionRequest,
    doc_service: DocumentService = Depends(get_document_service),
) -> DocumentQuestionResponse:
    """Magtanong tungkol sa isang page ng na-upload na document."""
    return doc_service.ask_question(document_id, payload.question, payload.page)


@router.get("/{document_id}/text")
def get_document_text(
    document_id: str,
    doc_service: DocumentService = Depends(get_document_service),
) -> dict[str, str]:
    """Kunin ang extracted plain text — pwede ipasa sa phi3 agent."""
    text = doc_service.get_extracted_text(document_id)
    return {"document_id": document_id, "text": text}
