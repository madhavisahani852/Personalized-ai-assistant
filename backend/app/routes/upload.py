import os
import time
import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config.settings import UPLOADS_DIR
from app.services.pdf_service import process_pdf_upload
from app.services.rag_service import rag_service
from app.models.schemas import PDFUploadResponse, DocumentListResponse, PDFDocumentInfo

router = APIRouter(prefix="/api", tags=["upload"])
logger = logging.getLogger(__name__)

# In-memory document registry for quick lookup
DOCUMENTS_REGISTRY: List[PDFDocumentInfo] = []

def sync_documents_registry():
    """
    Scans UPLOADS_DIR and builds DocumentListResponse based on saved files.
    """
    global DOCUMENTS_REGISTRY
    existing_docs = []
    if not os.path.exists(UPLOADS_DIR):
        return existing_docs

    for filename in os.listdir(UPLOADS_DIR):
        if filename.endswith(".pdf"):
            full_path = os.path.join(UPLOADS_DIR, filename)
            stat = os.stat(full_path)
            
            # File format: {file_id}_{original_filename}
            parts = filename.split("_", 1)
            file_id = parts[0] if len(parts) > 1 else filename
            orig_name = parts[1] if len(parts) > 1 else filename

            # Query vector store chunk count
            try:
                chroma_results = rag_service.db.get(where={"file_id": file_id})
                chunk_count = len(chroma_results.get("ids", []))
            except Exception:
                chunk_count = 0

            upload_time = time.strftime('%Y-%m-%d %H:%M', time.localtime(stat.st_mtime))

            existing_docs.append(
                PDFDocumentInfo(
                    file_id=file_id,
                    filename=orig_name,
                    file_size=stat.st_size,
                    upload_time=upload_time,
                    chunk_count=chunk_count
                )
            )

    DOCUMENTS_REGISTRY = existing_docs
    return DOCUMENTS_REGISTRY

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload and process a PDF document.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are supported.")

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        file_id, saved_path, chunks = process_pdf_upload(content, file.filename)
        
        # Add to Chroma vector database
        rag_service.add_documents(chunks)

        doc_info = PDFDocumentInfo(
            file_id=file_id,
            filename=file.filename,
            file_size=len(content),
            upload_time=time.strftime('%Y-%m-%d %H:%M'),
            chunk_count=len(chunks)
        )

        sync_documents_registry()

        return PDFUploadResponse(
            message="PDF uploaded and indexed successfully into ChromaDB.",
            document=doc_info
        )
    except Exception as e:
        logger.error(f"Failed to process PDF upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """
    List all uploaded PDF documents.
    """
    docs = sync_documents_registry()
    return DocumentListResponse(documents=docs)

@router.delete("/documents/{file_id}")
async def delete_document(file_id: str):
    """
    Delete document file and remove all vector embeddings from ChromaDB.
    """
    try:
        # Delete vectors from ChromaDB
        rag_service.delete_document(file_id)

        # Delete physical file from UPLOADS_DIR
        for filename in os.listdir(UPLOADS_DIR):
            if filename.startswith(file_id):
                file_path = os.path.join(UPLOADS_DIR, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)

        sync_documents_registry()
        return {"message": f"Document {file_id} deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting document {file_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
