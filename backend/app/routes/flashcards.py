import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import FlashcardRequest, FlashcardResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["flashcards"])
logger = logging.getLogger(__name__)

@router.post("/flashcards", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    """
    Generate study flashcards (Question/Front and Answer/Back) from indexed PDFs.
    """
    try:
        result = rag_service.generate_flashcards(
            file_id=request.file_id,
            file_ids=request.file_ids,
            num_cards=request.num_cards or 5,
            topic=request.topic,
            model_name=request.model or "tinyllama"
        )
        return FlashcardResponse(
            title=result["title"],
            cards=result["cards"]
        )
    except Exception as e:
        logger.error(f"Flashcards route error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")
