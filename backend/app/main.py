import os
import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Add backend directory to sys.path so 'app' package resolves cleanly regardless of current working directory
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, chat, summary, quiz, flashcards
from app.models.schemas import HealthResponse
from app.services.rag_service import rag_service
from app.services.embedding_service import get_embedding_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Student Study Assistant backend...")
    # Pre-warm embedding model
    try:
        get_embedding_model()
        logger.info("HuggingFace embedding model pre-warmed successfully.")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")

    # Check if DBMS.pdf exists in qa_agent and copy/index it if ChromaDB is empty
    try:
        chroma_res = rag_service.db.get()
        if len(chroma_res.get("ids", [])) == 0:
            existing_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), "qa_agent", "DBMS.pdf")
            if os.path.exists(existing_pdf):
                logger.info(f"Auto-indexing sample document '{existing_pdf}' into ChromaDB...")
                with open(existing_pdf, "rb") as f:
                    content = f.read()
                from app.services.pdf_service import process_pdf_upload
                _, _, chunks = process_pdf_upload(content, "DBMS.pdf")
                rag_service.add_documents(chunks)
                logger.info("Sample DBMS.pdf indexed successfully.")
    except Exception as e:
        logger.warning(f"Startup document indexing check skipped: {e}")

    yield
    logger.info("Shutting down Student Study Assistant backend...")

app = FastAPI(
    title="Student Study Assistant RAG API",
    description="Production RAG Backend powered by LangChain, ChromaDB, HuggingFace Embeddings, and Ollama TinyLlama",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(summary.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring system connectivity.
    """
    ollama_ok = rag_service.check_ollama_status()
    try:
        chroma_res = rag_service.db.get()
        doc_count = len(chroma_res.get("ids", []))
    except Exception:
        doc_count = 0

    return HealthResponse(
        status="healthy",
        ollama_connected=ollama_ok,
        embedding_model_loaded=True,
        total_documents=doc_count
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
