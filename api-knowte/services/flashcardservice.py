import json

import ollama
from fastapi import HTTPException, status

from config import settings
from models.flashcardmodel import FlashcardDeck, FlashcardItem as FlashcardItemModel
from schemas.flashcardschema import FlashcardItem, GenerateFlashcardsResponse
from services.documentservice import get_document_service

MAX_SOURCE_TEXT_CHARS = 12_000


class FlashcardService:
    def __init__(self) -> None:
        self._model = settings.ollama_model
        self._client = ollama.Client(host=settings.ollama_base_url)

    def generate_flashcards(
        self,
        document_id: str,
        prompt: str,
        count: int = 12,
    ) -> GenerateFlashcardsResponse:
        source_text = get_document_service().get_extracted_text(document_id).strip()
        if not source_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document has no extracted text to generate flashcards from.",
            )

        system_prompt = (
            "You are Knowte AI. Create concise study flashcards from the source text. "
            "Return JSON only with this exact structure: "
            '{"flashcards":[{"question":"...","answer":"..."}]}. '
            "Do not include markdown or any extra keys."
        )
        user_prompt = (
            f"Instructions: {prompt}\n"
            f"Create exactly {count} flashcards.\n"
            "Question should be clear and answer should be direct.\n\n"
            f"Source text:\n{source_text[:MAX_SOURCE_TEXT_CHARS]}"
        )

        try:
            response = self._client.chat(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        except ollama.ResponseError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ollama error: {exc.error}",
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cannot reach Ollama: {exc}",
            ) from exc

        payload = self._extract_json(response.message.content)
        raw_flashcards = payload.get("flashcards")
        if not isinstance(raw_flashcards, list):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Model response did not contain a valid flashcards array.",
            )

        flashcards: list[FlashcardItemModel] = []
        for item in raw_flashcards:
            if not isinstance(item, dict):
                continue
            question = str(item.get("question", "")).strip()
            answer = str(item.get("answer", "")).strip()
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

    def _extract_json(self, raw: str) -> dict:
        text = (raw or "").strip()
        if not text:
            return {}

        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start == -1 or end <= start:
                return {}
            try:
                parsed = json.loads(text[start : end + 1])
                return parsed if isinstance(parsed, dict) else {}
            except json.JSONDecodeError:
                return {}


_flashcard_service = FlashcardService()


def get_flashcard_service() -> FlashcardService:
    return _flashcard_service
