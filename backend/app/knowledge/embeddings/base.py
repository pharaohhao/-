from abc import ABC, abstractmethod
import numpy as np


class EmbeddingProvider(ABC):
    """Embedding Provider 抽象基类"""

    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        """将文本列表转换为向量列表"""
        ...

    @abstractmethod
    def embed_single(self, text: str) -> list[float]:
        """将单条文本转换为向量"""
        ...

    @property
    @abstractmethod
    def dimension(self) -> int:
        """向量维度"""
        ...
