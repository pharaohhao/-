from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.services.action_engine_service import ActionEngineService

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("")
def get_actions(
    persona_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取待办行动列表"""
    if persona_id:
        return ActionEngineService(db).get_pending(persona_id)
    return ActionEngineService(db).generate_all(current_user.id)


@router.post("/generate")
def generate_actions(
    persona_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """生成行动建议"""
    engine = ActionEngineService(db)
    if persona_id:
        return engine.generate_actions(persona_id)
    return engine.generate_all(current_user.id)


@router.post("/{action_id}/complete")
def complete_action(
    action_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """标记行动为已完成"""
    if ActionEngineService(db).complete(action_id):
        return {"status": "completed"}
    raise HTTPException(status_code=404, detail="Action not found")
