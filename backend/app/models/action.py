from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class Action(Base, TimestampMixin):
    __tablename__ = "actions"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(20), nullable=False)  # contact/gift/event_prep/check_in
    suggestion = Column(Text, nullable=False)
    reason = Column(Text, default="")
    priority = Column(Integer, default=5)
    is_completed = Column(Boolean, default=False)

    persona = relationship("Persona", back_populates="actions")

    def __repr__(self):
        return f"<Action(id={self.id}, type={self.action_type!r}, completed={self.is_completed})>"


class Briefing(Base, TimestampMixin):
    __tablename__ = "briefings"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    occasion = Column(String(30), nullable=False)  # meeting/birthday/casual
    topics = Column(Text, default="")
    recent_highlights = Column(Text, default="")

    persona = relationship("Persona", back_populates="briefings")

    def __repr__(self):
        return f"<Briefing(id={self.id}, occasion={self.occasion!r})>"
