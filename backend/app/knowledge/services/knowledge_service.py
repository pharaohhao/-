"""Knowledge Service — Embedding generation, vector indexing, hybrid search"""
import base64
import struct
import numpy as np
from sqlalchemy.orm import Session

from app.knowledge.embeddings import get_embedding_provider
from app.knowledge.vectorstores import get_vector_store
from app.knowledge.schemas.retrieval import SearchResult, SearchResponse
from app.models import PersonaMemory, Persona


class KnowledgeService:
    """Knowledge Service: 向量化存储 + 混合检索"""

    def __init__(self, db: Session):
        self.db = db
        self.embedding_provider = get_embedding_provider()
        self.vector_store = get_vector_store(dimension=self.embedding_provider.dimension)

    def add_memory(self, memory: PersonaMemory) -> PersonaMemory:
        """为记忆生成 Embedding 并存入向量索引"""
        # Generate embedding
        text_to_embed = f"{memory.category}: {memory.content}"
        vector = self.embedding_provider.embed_single(text_to_embed)

        # Save to FAISS
        persona = self.db.query(Persona).filter(Persona.id == memory.persona_id).first()
        self.vector_store.add(
            ids=[memory.id],
            vectors=[vector],
            metadata=[{
                "memory_id": memory.id,
                "persona_id": memory.persona_id,
                "persona_name": persona.name if persona else "",
                "category": memory.category,
                "content": memory.content,
            }],
        )

        # Save embedding to DB as base64-encoded float32 bytes
        embedding_bytes = struct.pack(f"{len(vector)}f", *vector)
        memory.embedding = base64.b64encode(embedding_bytes).decode("ascii")
        self.db.commit()

        # Persist index
        self.vector_store.save("knowledge")

        return memory

    def search(self, query: str, persona_id: str | None = None, top_k: int = 5) -> SearchResponse:
        """混合检索：关键词 + 向量加权融合"""
        query_vector = self.embedding_provider.embed_single(query)

        # 1. Keyword search (score from 0-1 based on match quality)
        keyword_results = self._keyword_search(query, persona_id)
        keyword_map = {r["id"]: r["score"] for r in keyword_results}

        # 2. Vector search (cosine similarity via FAISS)
        filters = {"persona_id": persona_id} if persona_id else None
        vector_results = self.vector_store.search(query_vector, top_k=top_k * 2, filters=filters)
        vector_map = {r["id"]: r["score"] for r in vector_results}

        # 3. Merge and re-rank (hybrid fusion)
        all_ids = set(keyword_map.keys()) | set(vector_map.keys())
        scored = []
        for mem_id in all_ids:
            kw_score = keyword_map.get(mem_id, 0.0)
            vec_score = vector_map.get(mem_id, 0.0)
            # Hybrid: keyword 40% + vector 60%
            final_score = kw_score * 0.4 + vec_score * 0.6
            scored.append((mem_id, final_score, kw_score, vec_score))

        scored.sort(key=lambda x: x[1], reverse=True)
        top = scored[:top_k]

        # Build results
        results = []
        id_set = [s[0] for s in top]
        if id_set:
            memories = self.db.query(PersonaMemory).filter(PersonaMemory.id.in_(id_set)).all()
            mem_map = {m.id: m for m in memories}
            for mem_id, final, kw, vec in top:
                mem = mem_map.get(mem_id)
                if not mem:
                    continue
                persona = self.db.query(Persona).filter(Persona.id == mem.persona_id).first()
                score_type = "hybrid" if kw > 0 and vec > 0 else ("keyword" if kw > vec else "vector")
                results.append(SearchResult(
                    memory_id=mem.id,
                    persona_id=mem.persona_id,
                    persona_name=persona.name if persona else "",
                    category=mem.category,
                    content=mem.content,
                    score=round(final, 4),
                    score_type=score_type,
                ))

        return SearchResponse(query=query, results=results, total=len(results))

    def _keyword_search(self, query: str, persona_id: str | None = None) -> list[dict]:
        """关键词检索，返回 [{"id": "...", "score": 0.8}]"""
        # Score tiers:
        # - exact content match: 1.0
        # - keyword match: 0.8
        # - content LIKE match: 0.6
        results = []
        q = self.db.query(PersonaMemory)
        if persona_id:
            q = q.filter(PersonaMemory.persona_id == persona_id)

        all_memories = q.all()
        query_lower = query.lower()

        for mem in all_memories:
            score = 0.0
            content_lower = mem.content.lower()
            keywords_lower = mem.keywords.lower()

            if query_lower == content_lower:
                score = 1.0
            elif query_lower in keywords_lower:
                score = 0.8
            elif query_lower in content_lower:
                score = 0.6
            elif any(kw in content_lower for kw in query_lower.split()):
                score = 0.4

            if score > 0:
                results.append({"id": mem.id, "score": score})

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def rebuild_index(self):
        """从数据库所有记忆重建 FAISS 索引"""
        from app.knowledge.vectorstores.factory import reset_vector_store
        reset_vector_store()
        self.vector_store = get_vector_store(dimension=self.embedding_provider.dimension)

        memories = self.db.query(PersonaMemory).all()
        if not memories:
            return

        texts = [f"{m.category}: {m.content}" for m in memories]
        vectors = self.embedding_provider.embed(texts)

        metadata = []
        ids = []
        for m in memories:
            ids.append(m.id)
            persona = self.db.query(Persona).filter(Persona.id == m.persona_id).first()
            metadata.append({
                "memory_id": m.id,
                "persona_id": m.persona_id,
                "persona_name": persona.name if persona else "",
                "category": m.category,
                "content": m.content,
            })

        self.vector_store.add(ids, vectors, metadata)
        self.vector_store.save("knowledge")

    def add_memories_batch(self, memories: list[PersonaMemory]):
        """批量添加记忆到向量索引（更高效）"""
        if not memories:
            return
        texts = [f"{m.category}: {m.content}" for m in memories]
        vectors = self.embedding_provider.embed(texts)

        ids = []
        metadata = []
        for i, m in enumerate(memories):
            ids.append(m.id)
            persona = self.db.query(Persona).filter(Persona.id == m.persona_id).first()
            metadata.append({
                "memory_id": m.id,
                "persona_id": m.persona_id,
                "persona_name": persona.name if persona else "",
                "category": m.category,
                "content": m.content,
            })
            # Save embedding to DB
            embedding_bytes = struct.pack(f"{len(vectors[i])}f", *vectors[i])
            m.embedding = base64.b64encode(embedding_bytes).decode("ascii")

        self.vector_store.add(ids, vectors, metadata)
        self.db.commit()
        self.vector_store.save("knowledge")
