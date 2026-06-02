"""Graph Service — 关系图谱计算引擎"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import Persona, PersonaRelationship, PersonaMemory, Event, ChatSession


def _ensure_aware(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class GraphService:
    """计算关系图谱的节点和边，包括动态强度评分"""

    def __init__(self, db: Session):
        self.db = db

    def get_graph(self, user_id: str) -> dict:
        """返回完整关系图谱数据：nodes + edges"""
        personas = self.db.query(Persona).filter(Persona.user_id == user_id).all()
        relationships = self.db.query(PersonaRelationship).filter(
            (PersonaRelationship.source_persona_id.in_([p.id for p in personas])) |
            (PersonaRelationship.target_persona_id.in_([p.id for p in personas]))
        ).all()

        # Build nodes
        nodes = []
        for p in personas:
            memory_count = self.db.query(PersonaMemory).filter(PersonaMemory.persona_id == p.id).count()
            event_count = self.db.query(Event).filter(Event.persona_id == p.id).count()
            last_interaction = self._get_last_interaction(p.id)

            nodes.append({
                "id": p.id,
                "name": p.name,
                "avatar": p.avatar,
                "relation": p.relation,
                "memory_count": memory_count,
                "event_count": event_count,
                "last_interaction": last_interaction.isoformat() if last_interaction else None,
            })

        # Build edges with dynamic strength
        edges = []
        for rel in relationships:
            dynamic_strength = self._calculate_strength(rel)
            edges.append({
                "id": rel.id,
                "source": rel.source_persona_id,
                "target": rel.target_persona_id,
                "type": rel.relationship_type,
                "strength": dynamic_strength,
                "static_strength": rel.strength_score,
            })

            # Update static score if it changed significantly
            if abs(dynamic_strength - rel.strength_score) > 10:
                rel.strength_score = dynamic_strength
                self.db.commit()

        return {"nodes": nodes, "edges": edges}

    def _calculate_strength(self, rel: PersonaRelationship) -> int:
        """动态计算关系强度 (0-100)"""
        score = rel.strength_score  # Base: existing score

        source_memories = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == rel.source_persona_id
        ).count()
        target_memories = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == rel.target_persona_id
        ).count()

        # More memories = slightly higher strength
        memory_bonus = min((source_memories + target_memories) // 5, 10)
        score += memory_bonus

        # Recent interaction bonus
        source_last = self._get_last_interaction(rel.source_persona_id)
        target_last = self._get_last_interaction(rel.target_persona_id)
        now = datetime.now(timezone.utc)

        for last in [source_last, target_last]:
            if last:
                days_ago = (now - _ensure_aware(last)).days
                if days_ago < 7:
                    score += 15
                elif days_ago < 30:
                    score += 5
                elif days_ago > 90:
                    score -= 10

        return max(0, min(100, score))

    def _get_last_interaction(self, persona_id: str):
        """获取最近一次互动时间"""
        last_memory = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id
        ).order_by(PersonaMemory.created_at.desc()).first()

        last_chat = self.db.query(ChatSession).filter(
            ChatSession.persona_id == persona_id
        ).order_by(ChatSession.created_at.desc()).first()

        dates = []
        if last_memory and last_memory.created_at:
            dates.append(last_memory.created_at)
        if last_chat and last_chat.created_at:
            dates.append(last_chat.created_at)
        return max(dates) if dates else None
