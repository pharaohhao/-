from sqlalchemy.orm import Session
from app.models import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate


class PersonaService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, data: PersonaCreate) -> Persona:
        persona = Persona(user_id=user_id, **data.model_dump())
        self.db.add(persona)
        self.db.commit()
        self.db.refresh(persona)
        return persona

    def get_by_id(self, persona_id: str, user_id: str) -> Persona | None:
        return self.db.query(Persona).filter(
            Persona.id == persona_id,
            Persona.user_id == user_id,
        ).first()

    def list_by_user(self, user_id: str) -> list[Persona]:
        return self.db.query(Persona).filter(Persona.user_id == user_id).all()

    def update(self, persona_id: str, user_id: str, data: PersonaUpdate) -> Persona | None:
        persona = self.get_by_id(persona_id, user_id)
        if not persona:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(persona, key, value)
        self.db.commit()
        self.db.refresh(persona)
        return persona

    def delete(self, persona_id: str, user_id: str) -> bool:
        persona = self.get_by_id(persona_id, user_id)
        if not persona:
            return False
        self.db.delete(persona)
        self.db.commit()
        return True
