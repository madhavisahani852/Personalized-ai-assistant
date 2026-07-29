import logging
from langchain_huggingface import HuggingFaceEmbeddings
from app.config.settings import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

_embedding_instance = None

def get_embedding_model():
    """
    Singleton function to load and return the HuggingFace embedding model.
    Preserves exact behavior from existing embedding.py while avoiding 
    re-instantiating the model on every query.
    """
    global _embedding_instance
    if _embedding_instance is None:
        logger.info(f"Loading HuggingFace embeddings: {EMBEDDING_MODEL_NAME}")
        _embedding_instance = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME
        )
    return _embedding_instance
