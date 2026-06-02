from sqlalchemy.orm import Session
from app.models import Observation
from app.schemas.observation import ObservationCreate


class ObservationService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: ObservationCreate) -> Observation:
        obs = Observation(persona_id=persona_id, **data.model_dump())
        self.db.add(obs)
        self.db.commit()
        self.db.refresh(obs)
        return obs

    def list_by_persona(self, persona_id: str) -> list[Observation]:
        return self.db.query(Observation).filter(
            Observation.persona_id == persona_id
        ).order_by(Observation.created_at.desc()).all()

    def delete(self, obs_id: str) -> bool:
        obs = self.db.query(Observation).filter(Observation.id == obs_id).first()
        if not obs:
            return False
        self.db.delete(obs)
        self.db.commit()
        return True
