from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/personas/{persona_id}/timeline", tags=["timeline"])

@router.get("")
def get_timeline(persona_id: str, limit: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return TimelineService(db).get_timeline(persona_id, limit)
