"""Memory Intelligence Pipeline — 智能记忆处理全流程"""
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.ai.services.llm_service import LLMService
from app.ai.schemas.extraction import MemoryExtractionItem
from app.models import Persona, PersonaMemory, MemorySource


@dataclass
class PipelineResult:
    """Pipeline 处理结果"""
    intent: str
    intent_confidence: float
    items_extracted: int
    items_stored: int
    items_skipped_validation: int
    items_skipped_duplicate: int
    items_merged: int
    events_extracted: int
    memories: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        return len(self.errors) == 0


class MemoryIntelligenceService:
    """记忆智能处理 Pipeline

    完成从用户输入到持久化存储的完整流程：
      用户输入
        ↓ Intent Detection    → 判断意图
        ↓ Match Persona       → 将 persona_name 映射到 persona_id
        ↓ Memory Extraction   → LLM 提取结构化记忆
        ↓ Validation          → 过滤低置信度 (< 0.5)
        ↓ Deduplication       → 检查相似记忆，合并 or 跳过
        ↓ Storage             → 写入 persona_memories + memory_sources
    """

    def __init__(self, db: Session, llm: LLMService | None = None):
        self.db = db
        self.llm = llm or LLMService()

    async def process(self, user_id: str, text: str) -> PipelineResult:
        """执行完整的记忆智能处理 Pipeline"""
        result = PipelineResult(
            intent="CHAT",
            intent_confidence=0.0,
            items_extracted=0,
            items_stored=0,
            items_skipped_validation=0,
            items_skipped_duplicate=0,
            items_merged=0,
            events_extracted=0,
        )

        # Stage 1: Intent Detection
        intent_data = await self.llm.detect_intent(text)
        result.intent = intent_data.get("intent", "CHAT")
        result.intent_confidence = intent_data.get("confidence", 0.0)

        if result.intent != "ADD_MEMORY":
            return result  # Not memory-related, skip pipeline

        # Stage 2: Memory Extraction
        extraction = await self.llm.extract_memories(text)
        items = extraction.get("items", [])
        events = extraction.get("events", [])
        result.items_extracted = len(items)
        result.events_extracted = len(events)

        # Stage 3+4+5: Validate -> Deduplicate -> Store
        for item in items:
            stored = await self._process_single_item(user_id, item, result)
            if stored:
                result.memories.append({
                    "persona_name": item.persona_name,
                    "category": item.category,
                    "content": item.content,
                    "action": stored,
                })

        return result

    async def _process_single_item(
        self,
        user_id: str,
        item: MemoryExtractionItem,
        result: PipelineResult,
    ) -> str | None:
        """处理单条记忆：验证 -> 匹配人物 -> 去重 -> 存储"""
        # Stage 3: Validation — 过滤低置信度记忆
        if item.confidence < 0.5:
            result.items_skipped_validation += 1
            return None

        # Match persona_name to actual persona_id
        persona = self._find_persona_by_name(user_id, item.persona_name)
        if persona is None:
            # Persona does not exist; skip this item
            result.errors.append(
                f"Persona '{item.persona_name}' not found for user {user_id}"
            )
            return None

        # Stage 4: Deduplication
        existing = self._find_similar_memory(persona.id, item)
        if existing:
            # Merge: update importance if new one is higher
            if item.importance > existing.importance:
                existing.importance = item.importance
                self.db.commit()
            # Merge keywords if new ones aren't already present
            if item.keywords:
                existing_keywords = set(
                    k.strip() for k in existing.keywords.split(",") if k.strip()
                )
                new_keywords = set(
                    k.strip() for k in item.keywords.split(",") if k.strip()
                )
                merged = existing_keywords | new_keywords
                merged_str = ",".join(sorted(merged))
                if merged_str != existing.keywords:
                    existing.keywords = merged_str
                    self.db.commit()
            result.items_merged += 1
            return "merged"

        # Stage 5: Storage with provenance
        memory = PersonaMemory(
            persona_id=persona.id,
            category=item.category,
            content=item.content,
            keywords=item.keywords,
            importance=item.importance,
        )
        self.db.add(memory)
        self.db.flush()

        source = MemorySource(
            memory_id=memory.id,
            created_from=item.source_type,
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(memory)
        result.items_stored += 1
        return "stored"

    def _find_persona_by_name(self, user_id: str, persona_name: str) -> Persona | None:
        """通过名称查找用户的人物档案"""
        return self.db.query(Persona).filter(
            Persona.user_id == user_id,
            Persona.name == persona_name,
        ).first()

    def _find_similar_memory(
        self,
        persona_id: str,
        item: MemoryExtractionItem,
    ) -> PersonaMemory | None:
        """查找相似记忆（去重检查）

        策略：相同 persona + 相同 category + 关键词重叠 > 40%
        或内容子串匹配。
        """
        existing_memories = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id,
            PersonaMemory.category == item.category,
        ).all()

        for existing in existing_memories:
            overlap = self._keyword_overlap(item.keywords, existing.keywords)
            if overlap > 0.4:
                return existing
            # Also check content similarity (simple substring)
            if item.content in existing.content or existing.content in item.content:
                return existing

        return None

    def _keyword_overlap(self, keywords1: str, keywords2: str) -> float:
        """计算两组关键词的重叠度（交集大小 / 较小集合大小）"""
        if not keywords1 or not keywords2:
            return 0.0
        set1 = set(k.strip() for k in keywords1.split(",") if k.strip())
        set2 = set(k.strip() for k in keywords2.split(",") if k.strip())
        if not set1 or not set2:
            return 0.0
        intersection = set1 & set2
        return len(intersection) / min(len(set1), len(set2))
