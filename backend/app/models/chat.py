from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class ChatSession(Base, TimestampMixin):
    __tablename__ = "chat_sessions"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    user_id = Column(UUIDChar, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), default="新对话")

    user = relationship("User", back_populates="chat_sessions")
    persona = relationship("Persona", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, title={self.title!r})>"


class ChatMessage(Base, TimestampMixin):
    __tablename__ = "chat_messages"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    session_id = Column(UUIDChar, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # user/assistant
    content = Column(Text, nullable=False)
    intent = Column(String(30), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    session = relationship("ChatSession", back_populates="messages")
    memory_sources = relationship("MemorySource", back_populates="chat_message")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role={self.role!r})>"
