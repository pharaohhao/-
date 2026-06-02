from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models import Event, EventReminder
from app.schemas.event import EventCreate, EventReminderCreate


class EventService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: EventCreate) -> Event:
        event = Event(persona_id=persona_id, **data.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_by_persona(self, persona_id: str) -> list[Event]:
        return self.db.query(Event).filter(Event.persona_id == persona_id).order_by(Event.event_date.asc()).all()

    def get_upcoming(self, persona_id: str, days: int = 30) -> list[Event]:
        today = date.today()
        cutoff = today + timedelta(days=days)
        return self.db.query(Event).filter(
            Event.persona_id == persona_id,
            Event.event_date >= today,
            Event.event_date <= cutoff,
        ).order_by(Event.event_date.asc()).all()

    def add_reminder(self, data: EventReminderCreate) -> EventReminder:
        reminder = EventReminder(**data.model_dump())
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def delete(self, event_id: str) -> bool:
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        self.db.delete(event)
        self.db.commit()
        return True
