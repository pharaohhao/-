from sqlalchemy.orm import Session
from app.models import PersonaRelationship
from app.schemas.relationship import RelationshipCreate


class RelationshipService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: RelationshipCreate) -> PersonaRelationship:
        rel = PersonaRelationship(**data.model_dump())
        self.db.add(rel)
        self.db.commit()
        self.db.refresh(rel)
        return rel

    def list_all(self) -> list[PersonaRelationship]:
        return self.db.query(PersonaRelationship).all()

    def delete(self, rel_id: str) -> bool:
        rel = self.db.query(PersonaRelationship).filter(PersonaRelationship.id == rel_id).first()
        if not rel:
            return False
        self.db.delete(rel)
        self.db.commit()
        return True
