from pydantic import BaseModel
from datetime import date
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: str = ""
    event_type: str  # birthday/anniversary/exam/other
    event_date: date
    is_recurring: bool = False
    importance: int = 5

class EventRead(BaseModel):
    id: str
    persona_id: str
    title: str
    description: str
    event_type: str
    event_date: date
    is_recurring: bool
    importance: int

    class Config:
        from_attributes = True

class EventReminderCreate(BaseModel):
    event_id: str
    remind_before_days: int
