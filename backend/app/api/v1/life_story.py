from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.services.life_story_service import LifeStoryService

router = APIRouter(prefix="/personas/{persona_id}/story", tags=["story"])


@router.get("")
def get_life_story(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取人物生命故事"""
    result = LifeStoryService(db).generate_story(persona_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
