import json
from typing import AsyncIterator
from anthropic import AsyncAnthropic
from app.ai.providers.base import LLMProvider
from app.config import settings


class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-6"):
        key = api_key or settings.ANTHROPIC_API_KEY
        if not key:
            raise ValueError("ANTHROPIC_API_KEY is not set")
        self.client = AsyncAnthropic(api_key=key)
        self.model = model

    def _split_system_messages(self, messages: list[dict]) -> tuple[str | None, list[dict]]:
        """Separate system message from chat messages for Anthropic API"""
        system = None
        chat_messages = []
        for m in messages:
            if m["role"] == "system":
                system = m["content"]
            else:
                chat_messages.append({"role": m["role"], "content": m["content"]})
        return system, chat_messages

    async def chat(self, messages: list[dict], max_tokens: int = 1024, **kwargs) -> str:
        system, chat_messages = self._split_system_messages(messages)
        kwargs_call = dict(model=self.model, max_tokens=max_tokens, messages=chat_messages, **kwargs)
        if system:
            kwargs_call["system"] = system
        response = await self.client.messages.create(**kwargs_call)
        return response.content[0].text

    async def chat_stream(self, messages: list[dict], max_tokens: int = 1024, **kwargs) -> AsyncIterator[str]:
        system, chat_messages = self._split_system_messages(messages)
        kwargs_call = dict(model=self.model, max_tokens=max_tokens, messages=chat_messages, **kwargs)
        if system:
            kwargs_call["system"] = system
        async with self.client.messages.stream(**kwargs_call) as stream:
            async for text in stream.text_stream:
                yield text

    async def extract(self, text: str, extraction_schema: dict) -> list[dict]:
        system_prompt = f"""你是一个信息提取助手。从用户输入的文本中提取结构化信息。

输出格式要求（严格遵守 JSON Schema）：
{json.dumps(extraction_schema, ensure_ascii=False, indent=2)}

只返回 JSON 数组，不要包含其他文字。如果没有可提取的信息，返回空数组 []。"""

        response = await self.chat(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            max_tokens=2048,
            temperature=0.1,
        )
        text_response = response.strip()
        if text_response.startswith("```"):
            text_response = text_response.split("\n", 1)[1].rsplit("\n```", 1)[0]
            if text_response.startswith("json"):
                text_response = text_response[4:].strip()
        return json.loads(text_response)
