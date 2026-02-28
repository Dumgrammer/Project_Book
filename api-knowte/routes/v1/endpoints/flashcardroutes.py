from fastapi import APIRouter, Depends

from schemas.flashcardschema import GenerateFlashcardsRequest, GenerateFlashcardsResponse
from services.flashcardservice import FlashcardService, get_flashcard_service

router = APIRouter(prefix="/flashcard", tags=["flashcard"])


@router.post("/generate", response_model=GenerateFlashcardsResponse)
def generate_flashcards(
    payload: GenerateFlashcardsRequest,
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
) -> GenerateFlashcardsResponse:
    """
    Generate study flashcards from an uploaded document.

    Flow:
    1. Validate request (`document_id`, `prompt`, `count`)
    2. Load extracted text from `DocumentService`
    3. Ask Ollama model to return strict JSON flashcards
    4. Return normalized deck payload
    """
    return flashcard_service.generate_flashcards(
        document_id=payload.document_id,
        prompt=payload.prompt,
        count=payload.count,
    )
