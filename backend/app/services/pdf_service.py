import os
import uuid
import logging
from typing import List, Tuple
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.config.settings import UPLOADS_DIR, CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger(__name__)

def load_pdf(pdf_path: str) -> List[Document]:
    """
    Load PDF using PyPDFLoader (Preserved from existing load_pdf.py).
    """
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    return docs

def split_documents(docs: List[Document], chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[Document]:
    """
    Split documents using RecursiveCharacterTextSplitter (Preserved from existing split.py).
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunks = splitter.split_documents(docs)
    return chunks

def process_pdf_upload(file_content: bytes, filename: str) -> Tuple[str, str, List[Document]]:
    """
    Save uploaded PDF file, extract pages, attach metadata, and split into chunks.
    Returns (file_id, saved_path, chunked_documents).
    """
    file_id = str(uuid.uuid4())
    sanitized_filename = filename.replace(" ", "_")
    saved_filename = f"{file_id}_{sanitized_filename}"
    saved_path = os.path.join(UPLOADS_DIR, saved_filename)

    with open(saved_path, "wb") as f:
        f.write(file_content)

    docs = load_pdf(saved_path)

    # Attach file_id and original filename metadata to each document/page
    for i, doc in enumerate(docs):
        doc.metadata["file_id"] = file_id
        doc.metadata["filename"] = filename
        if "page" not in doc.metadata:
            doc.metadata["page"] = i + 1

    chunks = split_documents(docs)
    
    # Ensure metadata propagates to all chunks
    for chunk in chunks:
        chunk.metadata["file_id"] = file_id
        chunk.metadata["filename"] = filename

    logger.info(f"Processed PDF '{filename}': {len(docs)} pages, {len(chunks)} chunks created.")
    return file_id, saved_path, chunks
