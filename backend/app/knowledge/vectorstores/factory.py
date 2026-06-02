from app.knowledge.vectorstores.base import VectorStore
from app.knowledge.vectorstores.faiss_store import FAISSStore

_store: VectorStore | None = None
_index_path: str = "knowledge"


def get_vector_store(dimension: int | None = None, index_path: str = "knowledge") -> VectorStore:
    global _store, _index_path
    _index_path = index_path
    if _store is None:
        if dimension is None:
            dimension = 384  # Default for all-MiniLM-L6-v2
        _store = FAISSStore(dimension=dimension, index_path=index_path)
        # Try loading existing index
        try:
            _store.load(index_path)
        except Exception:
            pass  # Fresh index
    return _store


def reset_vector_store():
    global _store
    _store = None
