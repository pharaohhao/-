from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.event import EventCreate, EventRead
from app.services.event_service import EventService

router = APIRouter(prefix="/personas/{persona_id}/events", tags=["events"])


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(persona_id: str, data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return EventService(db).create(persona_id, data)


@router.get("", response_model=list[EventRead])
def list_events(persona_id: str, upcoming: bool = False, days: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if upcoming:
        return EventService(db).get_upcoming(persona_id, days)
    return EventService(db).list_by_persona(persona_id)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(persona_id: str, event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not EventService(db).delete(event_id):
        raise HTTPException(status_code=404, detail="Event not found")
