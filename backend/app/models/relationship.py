from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class PersonaRelationship(Base, TimestampMixin):
    __tablename__ = "persona_relationships"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    source_persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    target_persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(20), nullable=False)
    strength_score = Column(Integer, default=50)

    source_persona = relationship("Persona", foreign_keys=[source_persona_id], back_populates="source_relationships")
    target_persona = relationship("Persona", foreign_keys=[target_persona_id], back_populates="target_relationships")

    def __repr__(self):
        return f"<PersonaRelationship(source={self.source_persona_id}, target={self.target_persona_id}, type={self.relationship_type!r})>"
