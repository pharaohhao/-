from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class PersonaInsight(Base, TimestampMixin):
    __tablename__ = "persona_insights"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, default="")
    personality = Column(Text, default="")
    interests = Column(Text, default="")
    gift_suggestions = Column(Text, default="")
    emotion_trend = Column(JSON, nullable=True)
    interest_trends = Column(JSON, nullable=True)
    health_score = Column(Integer, default=100)
    health_factors = Column(JSON, nullable=True)

    persona = relationship("Persona", back_populates="insights")

    def __repr__(self):
        return f"<PersonaInsight(persona_id={self.persona_id}, health_score={self.health_score})>"
