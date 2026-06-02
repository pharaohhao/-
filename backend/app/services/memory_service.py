from sqlalchemy.orm import Session
from app.models import PersonaMemory, MemorySource
from app.schemas.memory import MemoryCreate, MemoryUpdate


class MemoryService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: MemoryCreate) -> PersonaMemory:
        memory = PersonaMemory(
            persona_id=persona_id,
            category=data.category,
            content=data.content,
            keywords=data.keywords,
            importance=data.importance,
        )
        self.db.add(memory)
        self.db.flush()

        source = MemorySource(memory_id=memory.id, created_from=data.source_type)
        self.db.add(source)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def list_by_persona(self, persona_id: str) -> list[PersonaMemory]:
        return self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id
        ).order_by(PersonaMemory.created_at.desc()).all()

    def search(self, persona_id: str, query: str) -> list[PersonaMemory]:
        return self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id,
            (PersonaMemory.keywords.contains(query)) | (PersonaMemory.content.contains(query)),
        ).all()

    def update(self, memory_id: str, data: MemoryUpdate) -> PersonaMemory | None:
        memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == memory_id).first()
        if not memory:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(memory, key, value)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def delete(self, memory_id: str) -> bool:
        memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == memory_id).first()
        if not memory:
            return False
        self.db.delete(memory)
        self.db.commit()
        return True
