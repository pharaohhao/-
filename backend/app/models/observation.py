from sqlalchemy import Column, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class Observation(Base, TimestampMixin):
    __tablename__ = "observations"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    source_type = Column(String(20), nullable=False, default="manual")  # manual/chat/ai_inferred
    confidence = Column(Float, default=1.0)

    persona = relationship("Persona", back_populates="observations")

    def __repr__(self):
        return f"<Observation(id={self.id}, source_type={self.source_type!r})>"
