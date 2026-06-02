from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class PersonaMemory(Base, TimestampMixin):
    __tablename__ = "persona_memories"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(20), nullable=False, index=True)
    content = Column(Text, nullable=False)
    keywords = Column(String(500), default="")
    embedding = Column(String, nullable=True)  # BLOB-like, stored as base64 string for SQLite
    importance = Column(Integer, default=5)

    persona = relationship("Persona", back_populates="memories")
    sources = relationship("MemorySource", back_populates="memory", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PersonaMemory(id={self.id}, category={self.category!r})>"


class MemorySource(Base, TimestampMixin):
    __tablename__ = "memory_sources"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    memory_id = Column(UUIDChar, ForeignKey("persona_memories.id", ondelete="CASCADE"), nullable=False, index=True)
    chat_message_id = Column(UUIDChar, ForeignKey("chat_messages.id", ondelete="SET NULL"), nullable=True)
    observation_id = Column(UUIDChar, ForeignKey("observations.id", ondelete="SET NULL"), nullable=True)
    created_from = Column(String(20), nullable=False)  # chat/observation/manual

    memory = relationship("PersonaMemory", back_populates="sources")
    chat_message = relationship("ChatMessage", back_populates="memory_sources")

    def __repr__(self):
        return f"<MemorySource(id={self.id}, memory_id={self.memory_id})>"
