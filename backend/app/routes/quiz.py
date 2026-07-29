import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import QuizRequest, QuizResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["quiz"])
logger = logging.getLogger(__name__)

@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate multiple choice practice questions (MCQs) from indexed PDFs.
    """
    try:
        result = rag_service.generate_quiz(
            file_id=request.file_id,
            file_ids=request.file_ids,
            num_questions=request.num_questions or 5,
            topic=request.topic,
            model_name=request.model or "tinyllama"
        )
        return QuizResponse(
            title=result["title"],
            questions=result["questions"]
        )
    except Exception as e:
        logger.error(f"Quiz route error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
