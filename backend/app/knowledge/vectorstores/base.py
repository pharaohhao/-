from abc import ABC, abstractmethod


class VectorStore(ABC):
    """Vector Store 抽象基类"""

    @abstractmethod
    def add(self, ids: list[str], vectors: list[list[float]], metadata: list[dict]):
        """添加向量到索引"""
        ...

    @abstractmethod
    def search(self, query_vector: list[float], top_k: int = 5, filters: dict | None = None) -> list[dict]:
        """搜索最相似的 top_k 个向量，返回 [{"id": ..., "score": ..., "metadata": ...}]"""
        ...

    @abstractmethod
    def remove(self, ids: list[str]):
        """从索引中移除向量"""
        ...

    @abstractmethod
    def count(self) -> int:
        """索引中的向量数量"""
        ...

    @abstractmethod
    def save(self, path: str):
        """持久化索引到磁盘"""
        ...

    @abstractmethod
    def load(self, path: str):
        """从磁盘加载索引"""
        ...
