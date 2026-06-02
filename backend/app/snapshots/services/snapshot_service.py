"""Time Capsule Snapshot Service — 人物时间快照"""
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from app.models import Persona, PersonaMemory, Event, Observation


class SnapshotService:
    """生成人物在特定时间点的状态快照"""

    def __init__(self, db: Session):
        self.db = db

    def get_snapshot(self, persona_id: str, target_date: date) -> dict:
        """获取人物在 target_date 时的状态快照"""
        target_dt = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)

        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            return {"error": "Persona not found"}

        # Collect all data up to target_date
        memories = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id,
            PersonaMemory.created_at <= target_dt,
        ).order_by(PersonaMemory.created_at.desc()).all()

        events = self.db.query(Event).filter(
            Event.persona_id == persona_id,
            Event.created_at <= target_dt,
        ).order_by(Event.event_date.desc()).all()

        observations = self.db.query(Observation).filter(
            Observation.persona_id == persona_id,
            Observation.created_at <= target_dt,
        ).order_by(Observation.created_at.desc()).all()

        # Categorize memories
        interests = []
        concerns = []
        personality_traits = []
        for m in memories:
            item = {"content": m.content, "category": m.category, "recorded_at": m.created_at.isoformat() if m.created_at else None}
            if m.category in ("hobby", "style", "food"):
                interests.append(item)
            elif m.category in ("dream",):
                concerns.append(item)
            elif m.category in ("personality",):
                personality_traits.append(item)
            else:
                concerns.append(item)  # dislike, relationship, other → concerns

        # Build snapshot
        return {
            "persona_id": persona.id,
            "persona_name": persona.name,
            "persona_avatar": persona.avatar,
            "persona_relation": persona.relation,
            "snapshot_date": target_date.isoformat(),
            "summary": {
                "total_memories": len(memories),
                "total_events": len(events),
                "total_observations": len(observations),
            },
            "interests": interests[:10],
            "concerns": concerns[:10],
            "personality_traits": personality_traits[:5],
            "important_events": [
                {
                    "title": e.title,
                    "event_type": e.event_type,
                    "event_date": e.event_date.isoformat() if e.event_date else None,
                    "description": e.description,
                }
                for e in events[:10]
            ],
            "recent_observations": [
                {"content": o.content, "confidence": o.confidence, "recorded_at": o.created_at.isoformat() if o.created_at else None}
                for o in observations[:5]
            ],
            # Earliest and latest data timestamps
            "data_range": {
                "earliest": memories[-1].created_at.isoformat() if memories else None,
                "latest": memories[0].created_at.isoformat() if memories else None,
            },
        }

    def get_diff(self, persona_id: str, from_date: date, to_date: date) -> dict:
        """比较两个时间点之间的人物变化"""
        snap_from = self.get_snapshot(persona_id, from_date)
        snap_to = self.get_snapshot(persona_id, to_date)

        if "error" in snap_from or "error" in snap_to:
            return {"error": snap_from.get("error") or snap_to.get("error")}

        # Calculate diffs
        from_interests = {i["content"] for i in snap_from.get("interests", [])}
        to_interests = {i["content"] for i in snap_to.get("interests", [])}

        from_concerns = {c["content"] for c in snap_from.get("concerns", [])}
        to_concerns = {c["content"] for c in snap_to.get("concerns", [])}

        from_events = {e["title"] for e in snap_from.get("important_events", [])}
        to_events = {e["title"] for e in snap_to.get("important_events", [])}

        new_memories = snap_to["summary"]["total_memories"] - snap_from["summary"]["total_memories"]
        new_events = snap_to["summary"]["total_events"] - snap_from["summary"]["total_events"]

        return {
            "persona_name": snap_to["persona_name"],
            "from_date": from_date.isoformat(),
            "to_date": to_date.isoformat(),
            "from_snapshot": snap_from,
            "to_snapshot": snap_to,
            "changes": {
                "new_interests": list(to_interests - from_interests),
                "faded_interests": list(from_interests - to_interests),
                "new_concerns": list(to_concerns - from_concerns),
                "faded_concerns": list(from_concerns - to_concerns),
                "new_events": list(to_events - from_events),
                "new_memory_count": new_memories,
                "new_event_count": new_events,
            },
        }

    def get_timeline_years(self, persona_id: str) -> list[int]:
        """获取人物有数据的所有年份，用于时间轴"""
        memories = self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id
        ).order_by(PersonaMemory.created_at.asc()).all()

        events = self.db.query(Event).filter(
            Event.persona_id == persona_id
        ).order_by(Event.event_date.asc()).all()

        years = set()
        for m in memories:
            if m.created_at:
                years.add(m.created_at.year)
        for e in events:
            if e.event_date:
                years.add(e.event_date.year)

        return sorted(years)
