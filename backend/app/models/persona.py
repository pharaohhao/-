# backend/app/models/persona.py
from sqlalchemy import Column, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class Persona(Base, TimestampMixin):
    __tablename__ = "personas"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    user_id = Column(UUIDChar, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    avatar = Column(String(10), default="👤")
    relation = Column(String(20), nullable=False)  # girlfriend/father/mother/mentor/friend
    birthdate = Column(Date, nullable=True)
    description = Column(Text, default="")
    personality = Column(Text, default="")
    interests = Column(Text, default="")
    gift_ideas = Column(Text, default="")

    user = relationship("User", back_populates="personas")

    # 以下是将在 Task 3 中创建的模型的关系引用
    memories = relationship("PersonaMemory", back_populates="persona", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="persona", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="persona", cascade="all, delete-orphan")
    insights = relationship("PersonaInsight", back_populates="persona", uselist=False, cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="persona", cascade="all, delete-orphan")
    briefings = relationship("Briefing", back_populates="persona", cascade="all, delete-orphan")
    source_relationships = relationship(
        "PersonaRelationship", foreign_keys="PersonaRelationship.source_persona_id",
        back_populates="source_persona", cascade="all, delete-orphan",
    )
    target_relationships = relationship(
        "PersonaRelationship", foreign_keys="PersonaRelationship.target_persona_id",
        back_populates="target_persona", cascade="all, delete-orphan",
    )
    chat_sessions = relationship("ChatSession", back_populates="persona")

    def __repr__(self):
        return f"<Persona(id={self.id}, name={self.name!r}, relation={self.relation!r})>"
