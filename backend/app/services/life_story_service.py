"""Life Story Generator — AI 驱动的人物叙事"""
from datetime import date
from sqlalchemy.orm import Session
from app.models import Persona, PersonaMemory, Event, Observation


class LifeStoryService:
    def __init__(self, db: Session):
        self.db = db

    def generate_story(self, persona_id: str) -> dict:
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            return {"error": "Persona not found"}

        memories = self.db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona_id).order_by(PersonaMemory.created_at.asc()).all()
        events = self.db.query(Event).filter(Event.persona_id == persona_id).order_by(Event.event_date.asc()).all()
        observations = self.db.query(Observation).filter(Observation.persona_id == persona_id).order_by(Observation.created_at.asc()).all()

        # Build chronological chapters
        chapters = []
        all_items = []

        for m in memories:
            all_items.append({"type": "memory", "date": m.created_at, "content": m.content, "category": m.category})
        for e in events:
            all_items.append({"type": "event", "date": e.created_at or e.event_date, "content": e.title, "event_type": e.event_type})
        for o in observations:
            all_items.append({"type": "observation", "date": o.created_at, "content": o.content})

        all_items.sort(key=lambda x: x["date"] if x["date"] else date(2000, 1, 1))

        # Group by year
        by_year = {}
        for item in all_items:
            if item["date"]:
                year = item["date"].year if hasattr(item["date"], 'year') else item["date"].year
                if year not in by_year:
                    by_year[year] = []
                by_year[year].append(item)

        for year in sorted(by_year.keys()):
            items = by_year[year]
            memories_count = sum(1 for i in items if i["type"] == "memory")
            events_count = sum(1 for i in items if i["type"] == "event")

            highlights = []
            for i in items[:5]:
                if i["type"] == "memory":
                    highlights.append(f"关注{i['category']}: {i['content']}")
                elif i["type"] == "event":
                    highlights.append(f"事件: {i['content']}")
                else:
                    highlights.append(f"观察: {i['content']}")

            chapters.append({
                "year": year,
                "summary": f"{year}年，共记录{memories_count}条记忆、{events_count}个事件",
                "highlights": highlights[:5],
            })

        # Generate narrative overview
        narrative_parts = []
        for ch in chapters:
            narrative_parts.append(f"{ch['year']}年: " + "；".join(ch["highlights"][:3]))

        narrative = f"{persona.name}的故事\n\n" + "\n\n".join(narrative_parts) if narrative_parts else f"关于{persona.name}的故事还在书写中..."

        return {
            "persona_name": persona.name,
            "persona_avatar": persona.avatar,
            "persona_relation": persona.relation,
            "narrative": narrative,
            "chapters": chapters,
            "total_memories": len(memories),
            "total_events": len(events),
            "total_observations": len(observations),
            "timeline_span": f"{chapters[0]['year']} - {chapters[-1]['year']}" if chapters else "暂无",
        }
