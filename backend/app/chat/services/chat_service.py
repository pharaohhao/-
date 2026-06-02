"""Persona Context Chat Service — RAG with provenance"""
from sqlalchemy.orm import Session
from app.ai.services.llm_service import LLMService
from app.knowledge.services.knowledge_service import KnowledgeService
from app.models import Persona, PersonaMemory, MemorySource
from app.chat.prompts.persona_chat import PERSONA_CHAT_SYSTEM_PROMPT
from app.chat.schemas.chat import ChatResponse


class ChatService:
    """Persona Context Chat: 基于人物上下文的 RAG 对话"""

    def __init__(self, db: Session, llm: LLMService | None = None):
        self.db = db
        self.llm = llm or LLMService()
        self.knowledge = KnowledgeService(db)

    async def ask(self, persona_id: str, message: str, top_k: int = 5) -> ChatResponse:
        """带 Persona 上下文的 RAG 问答"""
        # 1. Load persona
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            return ChatResponse(reply="未找到该人物档案。", sources=[], memories_used=0)

        # 2. Query rewrite: replace pronouns with persona name
        rewritten = self._rewrite_query(message, persona.name)

        # 3. Hybrid search
        search_result = self.knowledge.search(rewritten, persona_id=persona_id, top_k=top_k)

        # 4. Build persona context
        memories_context = self._build_memories_context(search_result)
        sources_context = self._build_sources_context(search_result)

        # 5. Format system prompt
        system_prompt = PERSONA_CHAT_SYSTEM_PROMPT.format(
            persona_name=persona.name,
            relation=persona.relation,
            memories_context=memories_context,
            sources_context=sources_context,
        )

        # 6. LLM answer
        reply = await self.llm.chat(
            message,
            context=[{"role": "system", "content": system_prompt}],
            max_tokens=1024,
        )

        # 7. Build sources
        sources = []
        for r in search_result.results:
            memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == r.memory_id).first()
            if memory:
                src_list = self.db.query(MemorySource).filter(
                    MemorySource.memory_id == memory.id
                ).order_by(MemorySource.created_at.desc()).all()
                for src in src_list:
                    sources.append({
                        "content": memory.content,
                        "source_type": src.created_from,
                        "recorded_at": memory.created_at.isoformat() if memory.created_at else "",
                    })

        return ChatResponse(
            reply=reply,
            persona_name=persona.name,
            sources=sources,
            memories_used=len(search_result.results),
        )

    async def ask_stream(self, persona_id: str, message: str, top_k: int = 5):
        """流式 RAG 问答"""
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            yield "未找到该人物档案。"
            return

        rewritten = self._rewrite_query(message, persona.name)
        search_result = self.knowledge.search(rewritten, persona_id=persona_id, top_k=top_k)
        memories_context = self._build_memories_context(search_result)
        sources_context = self._build_sources_context(search_result)

        system_prompt = PERSONA_CHAT_SYSTEM_PROMPT.format(
            persona_name=persona.name,
            relation=persona.relation,
            memories_context=memories_context,
            sources_context=sources_context,
        )

        async for chunk in self.llm.chat_stream(
            message,
            context=[{"role": "system", "content": system_prompt}],
            max_tokens=1024,
        ):
            yield chunk

    def _rewrite_query(self, message: str, persona_name: str) -> str:
        """将代词替换为人物名称，增强检索效果"""
        pronouns = ["她", "他", "它", "其"]
        for p in pronouns:
            if message.startswith(p) or p in message:
                # Simple rewrite: add persona name context
                if persona_name not in message:
                    return f"{persona_name} {message}"
        return message

    def _build_memories_context(self, search_result) -> str:
        """构建记忆上下文"""
        if not search_result.results:
            return "暂无相关记忆。"
        lines = []
        for i, r in enumerate(search_result.results, 1):
            lines.append(f"{i}. [{r.category}] {r.content}")
        return "\n".join(lines)

    def _build_sources_context(self, search_result) -> str:
        """构建来源引用上下文"""
        if not search_result.results:
            return "暂无来源记录。"
        lines = []
        for i, r in enumerate(search_result.results, 1):
            memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == r.memory_id).first()
            if memory:
                lines.append(f"记忆{i}: \"{memory.content}\" (类别: {memory.category}, 记录时间: {memory.created_at})")
        return "\n".join(lines)
