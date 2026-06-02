from sqlalchemy.orm import Session
from app.models import PersonaMemory, Event, Observation

class TimelineService:
    def __init__(self, db: Session):
        self.db = db

    def get_timeline(self, persona_id: str, limit: int = 30) -> list[dict]:
        memories = self.db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona_id).all()
        events = self.db.query(Event).filter(Event.persona_id == persona_id).all()
        observations = self.db.query(Observation).filter(Observation.persona_id == persona_id).all()

        items = []
        for m in memories:
            items.append({"type": "memory", "id": m.id, "date": m.created_at, "category": m.category, "content": m.content})
        for e in events:
            items.append({"type": "event", "id": e.id, "date": e.event_date, "title": e.title, "description": e.description, "event_type": e.event_type})
        for o in observations:
            items.append({"type": "observation", "id": o.id, "date": o.created_at, "content": o.content, "confidence": o.confidence})

        items.sort(key=lambda x: x["date"], reverse=True)
        return items[:limit]
