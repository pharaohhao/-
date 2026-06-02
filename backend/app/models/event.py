from sqlalchemy import Column, String, Text, Date, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin, UUIDChar, generate_uuid


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    persona_id = Column(UUIDChar, ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, default="")
    event_type = Column(String(20), nullable=False)  # birthday/anniversary/exam/other
    event_date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=False)
    importance = Column(Integer, default=5)

    persona = relationship("Persona", back_populates="events")
    reminders = relationship("EventReminder", back_populates="event", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title!r}, type={self.event_type!r})>"


class EventReminder(Base, TimestampMixin):
    __tablename__ = "event_reminders"

    id = Column(UUIDChar, primary_key=True, default=generate_uuid)
    event_id = Column(UUIDChar, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    remind_before_days = Column(Integer, nullable=False)
    reminded_at = Column(DateTime, nullable=True)
    is_sent = Column(Boolean, default=False)

    event = relationship("Event", back_populates="reminders")

    def __repr__(self):
        return f"<EventReminder(id={self.id}, event_id={self.event_id})>"
