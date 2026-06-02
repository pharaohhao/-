import json
from typing import AsyncIterator

from app.ai.providers.factory import get_llm_provider
from app.ai.schemas.extraction import MemoryExtractionItem
from app.ai.prompts.intent_detection import INTENT_DETECTION_SYSTEM_PROMPT
from app.ai.prompts.memory_extraction import MEMORY_EXTRACTION_SYSTEM_PROMPT
from app.ai.prompts.persona_summary import PERSONA_SUMMARY_SYSTEM_PROMPT


class LLMService:
    """LLM 调用统一入口，业务层通过此类使用 AI 能力"""

    def __init__(self):
        self.provider = get_llm_provider()

    async def chat(self, message: str, context: list[dict] | None = None, **kwargs) -> str:
        """通用对话"""
        messages = list(context) if context else []
        messages.append({"role": "user", "content": message})
        return await self.provider.chat(messages, **kwargs)

    async def chat_stream(self, message: str, context: list[dict] | None = None, **kwargs) -> AsyncIterator[str]:
        """流式对话"""
        messages = list(context) if context else []
        messages.append({"role": "user", "content": message})
        async for chunk in self.provider.chat_stream(messages, **kwargs):
            yield chunk

    async def extract_memories(self, text: str) -> dict:
        """从自然语言文本中提取结构化记忆，返回 {"items": [...], "events": [...]}"""
        extraction_schema = {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "persona_name": {"type": "string"},
                            "category": {"type": "string", "enum": ["food", "hobby", "style", "personality", "relationship", "dream", "dislike", "other"]},
                            "content": {"type": "string"},
                            "keywords": {"type": "string"},
                            "importance": {"type": "integer", "minimum": 1, "maximum": 10},
                            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                            "source_type": {"type": "string", "enum": ["direct_statement", "inference", "observation"]},
                        },
                        "required": ["persona_name", "category", "content"],
                    },
                },
                "events": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "persona_name": {"type": "string"},
                            "title": {"type": "string"},
                            "event_type": {"type": "string", "enum": ["birthday", "anniversary", "exam", "meeting", "other"]},
                            "event_date": {"type": "string", "description": "ISO date format"},
                            "description": {"type": "string"},
                        },
                    },
                },
            },
        }

        messages = [
            {"role": "system", "content": MEMORY_EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ]
        result_text = await self.provider.chat(messages, max_tokens=2048, temperature=0.1)

        cleaned = result_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("\n```", 1)[0]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        result = json.loads(cleaned)
        # Parse items into MemoryExtractionItem objects
        items = [MemoryExtractionItem(**item) for item in result.get("items", [])]
        return {
            "items": items,
            "events": result.get("events", []),
        }

    async def detect_intent(self, text: str) -> dict:
        """检测用户输入意图"""
        result = await self.provider.chat(
            [
                {"role": "system", "content": INTENT_DETECTION_SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            max_tokens=256,
            temperature=0.1,
        )
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("\n```", 1)[0]
        return json.loads(cleaned)

    async def generate_persona_summary(
        self, persona_name: str, memories: list[dict], events: list[dict] | None = None
    ) -> dict:
        """生成人物画像摘要"""
        events_data = events or []
        context = f"""人物：{persona_name}

记忆列表：
{json.dumps(memories, ensure_ascii=False, indent=2)}

事件列表：
{json.dumps(events_data, ensure_ascii=False, indent=2)}"""

        result = await self.provider.chat(
            [
                {"role": "system", "content": PERSONA_SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": context},
            ],
            max_tokens=1024,
            temperature=0.3,
        )

        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("\n```", 1)[0]
        return json.loads(cleaned)
