from fastapi import APIRouter, Depends

from schemas.flashcardschema import GenerateFlashcardsRequest, GenerateFlashcardsResponse
from services.flashcardservice import FlashcardService, get_flashcard_service

router = APIRouter(prefix="/flashcard", tags=["flashcard"])


@router.post("/generate", response_model=GenerateFlashcardsResponse)
def generate_flashcards(
    payload: GenerateFlashcardsRequest,
    flashcard_service: FlashcardService = Depends(get_flashcard_service),
) -> GenerateFlashcardsResponse:
    return flashcard_service.generate_flashcards(
        document_id=payload.document_id,
        prompt=payload.prompt,
        count=payload.count,
    )
    print(payload)
