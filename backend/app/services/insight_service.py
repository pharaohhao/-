from sqlalchemy.orm import Session
from app.models import PersonaInsight, Persona, PersonaMemory, Event, Observation

class InsightService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, persona_id: str) -> PersonaInsight | None:
        insight = self.db.query(PersonaInsight).filter(PersonaInsight.persona_id == persona_id).first()
        if insight:
            return insight
        # Create empty placeholder
        insight = PersonaInsight(persona_id=persona_id)
        self.db.add(insight)
        self.db.commit()
        self.db.refresh(insight)
        return insight
