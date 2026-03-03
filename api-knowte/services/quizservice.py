import json
import re
from random import shuffle

import ollama
from fastapi import HTTPException, status

from config import settings
from models.quizmodel import QuizItem as QuizItemModel
from models.quizmodel import QuizSet
from schemas.quizschema import GenerateQuizResponse, QuizQuestion
from services.documentservice import get_document_service

QUIZ_MODEL = "phi3"

class QuizService:
    def __init__(self) -> None:
        configured_model = (settings.ollama_model or "").strip()
        self._model = QUIZ_MODEL if configured_model.lower() == "qwen3.5:4b" else (configured_model or QUIZ_MODEL)
        self._client = ollama.Client(host=settings.ollama_base_url)

    def generate_quiz(
        self,
        document_id: str,
        prompt: str,
        count: int = 10,
    ) -> GenerateQuizResponse:
        source_text = get_document_service().get_extracted_text(document_id)
        if not source_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document has no extracted text to generate quiz from.",
            )

        raw_items = self._generate_with_ollama(
            source_text=source_text,
            prompt=prompt,
            count=count,
        )

        questions = self._normalize_items(raw_items=raw_items, count=count)
        if not questions:
            questions = self._fallback_items(source_text=source_text, count=count)

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="No valid quiz questions were generated.",
            )

        quiz = QuizSet(
            document_id=document_id,
            prompt=prompt,
            questions=questions,
            model=self._model,
        )
        return GenerateQuizResponse(
            document_id=quiz.document_id,
            prompt=quiz.prompt,
            questions=[
                QuizQuestion(
                    question=q.question,
                    options=q.options,
                    answer=q.answer,
                    explanation=q.explanation,
                )
                for q in quiz.questions
            ],
            model=quiz.model,
        )

    def _normalize_items(self, raw_items: list[dict], count: int) -> list[QuizItemModel]:
        questions: list[QuizItemModel] = []
        for item in raw_items:
            if not isinstance(item, dict):
                continue

            question = str(item.get("question", "")).strip()
            answer_raw = item.get("answer", "")
            explanation_raw = item.get("explanation")
            explanation = str(explanation_raw).strip() if explanation_raw is not None else None

            options_raw = item.get("options")
            if not isinstance(options_raw, list):
                options_raw = item.get("choices")
            if not isinstance(options_raw, list):
                options_raw = item.get("questions")

            options: list[str] = []
            if isinstance(options_raw, list):
                for opt in options_raw:
                    value = str(opt).strip()
                    if value:
                        options.append(value)

            deduped_options: list[str] = []
            seen: set[str] = set()
            for option in options:
                key = option.lower()
                if key in seen:
                    continue
                seen.add(key)
                deduped_options.append(option[:200])

            answer = self._resolve_answer(answer_raw=answer_raw, options=deduped_options)
            if not answer and isinstance(answer_raw, str):
                answer = answer_raw.strip()

            if answer and answer not in deduped_options:
                deduped_options.append(answer)

            deduped_options = self._ensure_four_options(deduped_options, answer)

            if not question or not answer or len(deduped_options) != 4 or answer not in deduped_options:
                continue

            questions.append(
                QuizItemModel(
                    question=question[:300],
                    options=deduped_options,
                    answer=answer[:200],
                    explanation=explanation[:400] if explanation else None,
                )
            )
            if len(questions) >= count:
                break
        return questions

    def _resolve_answer(self, answer_raw, options: list[str]) -> str:
        if isinstance(answer_raw, int):
            if 0 <= answer_raw < len(options):
                return options[answer_raw]
            return ""

        answer = str(answer_raw or "").strip()
        if not answer:
            return ""

        if answer in options:
            return answer

        upper = answer.upper()
        if len(upper) == 1 and upper in "ABCD":
            index = ord(upper) - ord("A")
            if 0 <= index < len(options):
                return options[index]

        if answer.isdigit():
            index = int(answer) - 1
            if 0 <= index < len(options):
                return options[index]

        return answer

    def _ensure_four_options(self, options: list[str], answer: str) -> list[str]:
        normalized = options[:]
        if answer and answer not in normalized:
            normalized.append(answer)

        if len(normalized) > 4:
            if answer in normalized:
                wrong = [o for o in normalized if o != answer][:3]
                normalized = wrong + [answer]
            else:
                normalized = normalized[:4]

        filler_words = [
            "All of the above",
            "None of the above",
            "Only A and B",
            "Cannot be determined",
        ]
        for filler in filler_words:
            if len(normalized) >= 4:
                break
            if filler.lower() in {o.lower() for o in normalized}:
                continue
            normalized.append(filler)

        if answer and answer not in normalized and normalized:
            normalized[-1] = answer

        if len(normalized) == 4:
            shuffle(normalized)
        return normalized[:4]

    def _fallback_items(self, source_text: str, count: int) -> list[QuizItemModel]:
        cleaned = re.sub(r"\s+", " ", source_text).strip()
        if not cleaned:
            return []

        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", cleaned) if s.strip()]
        candidates = [s for s in sentences if 45 <= len(s) <= 220]

        fallback: list[QuizItemModel] = []
        for sentence in candidates:
            words = re.findall(r"[A-Za-z][A-Za-z0-9\-]{4,}", sentence)
            if len(words) < 4:
                continue

            answer = max(words, key=len)
            prompt = re.sub(rf"\b{re.escape(answer)}\b", "_____", sentence, count=1)
            if prompt == sentence:
                continue

            distractors = []
            for word in words:
                value = word.strip()
                if value.lower() == answer.lower() or value.lower() in {d.lower() for d in distractors}:
                    continue
                distractors.append(value)
                if len(distractors) >= 3:
                    break

            if len(distractors) < 3:
                continue

            options = distractors[:3] + [answer]
            shuffle(options)

            fallback.append(
                QuizItemModel(
                    question=f"Fill in the blank: {prompt}"[:300],
                    options=options,
                    answer=answer[:200],
                    explanation=None,
                )
            )
            if len(fallback) >= count:
                break
        return fallback

    def _generate_with_ollama(self, source_text: str, prompt: str, count: int) -> list[dict]:
        system_prompt = (
            "You are a quiz generator. "
            "Return only valid JSON with this exact shape: "
            "{\"questions\": [{\"question\": string, \"questions\": [string, string, string, string], \"answer\": string}]}. "
            "Rules: exactly 4 choices per item under \"questions\", exactly 1 correct answer under \"answer\", and answer must match one of those choices. "
            "No markdown, no prose outside JSON."
        )
        user_prompt = (
            f"Instruction: {prompt}\n"
            f"Count: {count}\n"
            "Make it feel like a real multiple-choice quiz with plausible distractors.\n"
            "Create a quiz only from this source text:\n"
            f"{source_text[:12000]}"
        )

        try:
            response = self._client.chat(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                format="json",
                options={"temperature": 0.2},
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

        content = response.message.content if response and response.message else ""
        parsed = self._extract_json_payload(content)

        if isinstance(parsed, dict) and isinstance(parsed.get("questions"), list):
            return parsed["questions"]
        if isinstance(parsed, dict) and "question" in parsed:
            return [parsed]
        if isinstance(parsed, list):
            return parsed
        return []

    def _extract_json_payload(self, content: str):
        cleaned = (content or "").strip()
        if not cleaned:
            return None

        fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, flags=re.DOTALL | re.IGNORECASE)
        candidate = fence_match.group(1).strip() if fence_match else cleaned

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

        start = candidate.find("{")
        end = candidate.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(candidate[start : end + 1])
            except json.JSONDecodeError:
                return None

        return None


_quiz_service = QuizService()


def get_quiz_service() -> QuizService:
    return _quiz_service
