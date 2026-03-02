from fastapi import HTTPException, status

from models.flashcardmodel import FlashcardDeck, FlashcardItem as FlashcardItemModel
from schemas.flashcardschema import FlashcardItem, GenerateFlashcardsResponse
from services.documentservice import MODEL_NAME, get_document_service


class FlashcardService:
    """
    Generates flashcards from document data via transformer-backed DocumentService.

    Design goals:
    - Reuse the already-loaded transformer pipeline from DocumentService.
    - Normalize output before returning to API clients.
    """

    def __init__(self) -> None:
        self._model = MODEL_NAME

    def generate_flashcards(
        self,
        document_id: str,
        prompt: str,
        count: int = 12,
    ) -> GenerateFlashcardsResponse:
        """
        Create a flashcard deck from an uploaded document.

        Raises:
        - 400 if source document has no extracted text
        - 502 if no usable flashcards can be produced
        """
        try:
            raw_flashcards = get_document_service().generate_flashcards(
                document_id=document_id,
                prompt=prompt,
                count=count,
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Flashcard generation failed: {exc}",
            ) from exc

        flashcards: list[FlashcardItemModel] = []
        for item in raw_flashcards:
            if isinstance(item, tuple) and len(item) == 2:
                question_raw, answer_raw = item
            elif isinstance(item, dict):
                question_raw = item.get("question", "")
                answer_raw = item.get("answer", "")
            else:
                continue

            question = str(question_raw).strip()
            answer = str(answer_raw).strip()
            if not question or not answer:
                continue
            flashcards.append(FlashcardItemModel(question=question[:200], answer=answer[:300]))
            if len(flashcards) >= count:
                break

        if not flashcards:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="No valid flashcards were generated.",
            )

        deck = FlashcardDeck(
            document_id=document_id,
            prompt=prompt,
            flashcards=flashcards,
            model=self._model,
        )
        return GenerateFlashcardsResponse(
            document_id=deck.document_id,
            prompt=deck.prompt,
            flashcards=[FlashcardItem(question=fc.question, answer=fc.answer) for fc in deck.flashcards],
            model=deck.model,
        )


_flashcard_service = FlashcardService()


def get_flashcard_service() -> FlashcardService:
    return _flashcard_service
