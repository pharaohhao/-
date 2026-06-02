from abc import ABC, abstractmethod
from typing import AsyncIterator


class LLMProvider(ABC):
    """LLM Provider 抽象基类，所有 LLM 实现必须继承此类"""

    @abstractmethod
    async def chat(self, messages: list[dict], max_tokens: int = 1024, **kwargs) -> str:
        """发送对话消息，返回完整文本回复"""
        ...

    @abstractmethod
    async def chat_stream(self, messages: list[dict], max_tokens: int = 1024, **kwargs) -> AsyncIterator[str]:
        """流式对话，异步迭代器 yield 文本片段"""
        ...

    @abstractmethod
    async def extract(self, text: str, extraction_schema: dict) -> list[dict]:
        """从自然语言文本中提取结构化信息，返回 dict 列表"""
        ...
