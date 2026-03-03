from fastapi import APIRouter, Depends

from schemas.quizschema import GenerateQuizRequest, GenerateQuizResponse
from services.quizservice import QuizService, get_quiz_service

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=GenerateQuizResponse)
def generate_quiz(
    payload: GenerateQuizRequest,
    quiz_service: QuizService = Depends(get_quiz_service),
) -> GenerateQuizResponse:
    return quiz_service.generate_quiz(
        document_id=payload.document_id,
        prompt=payload.prompt,
        count=payload.count,
    )
