import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Question Answering endpoint using LangChain + ChromaDB + Ollama (TinyLlama).
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        history_dicts = [h.dict() for h in request.history] if request.history else []
        result = rag_service.answer_question(
            question=request.question,
            file_ids=request.file_ids,
            history=history_dicts,
            model_name=request.model or "tinyllama",
            k=request.k or 3
        )

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            model_used=result["model_used"]
        )
    except Exception as e:
        logger.error(f"Chat route error: {e}")
        raise HTTPException(status_code=500, detail=f"Error handling chat query: {str(e)}")
