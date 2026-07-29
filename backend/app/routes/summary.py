import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import SummaryRequest, SummaryResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["summary"])
logger = logging.getLogger(__name__)

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate structured study summary and key points from indexed PDFs.
    """
    try:
        result = rag_service.generate_summary(
            file_id=request.file_id,
            file_ids=request.file_ids,
            summary_type=request.summary_type or "comprehensive",
            model_name=request.model or "tinyllama"
        )
        return SummaryResponse(
            title=result["title"],
            summary=result["summary"],
            key_points=result["key_points"]
        )
    except Exception as e:
        logger.error(f"Summary route error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
