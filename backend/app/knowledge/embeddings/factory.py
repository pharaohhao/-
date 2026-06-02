from app.knowledge.embeddings.base import EmbeddingProvider

_provider: EmbeddingProvider | None = None


def get_embedding_provider() -> EmbeddingProvider:
    global _provider
    if _provider is None:
        from app.knowledge.embeddings.sentence_transformer import SentenceTransformersProvider
        _provider = SentenceTransformersProvider()
    return _provider


def set_embedding_provider(provider: EmbeddingProvider):
    global _provider
    _provider = provider
