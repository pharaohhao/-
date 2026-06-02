from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.services.insight_engine_service import InsightEngineService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取所有人物的洞察总览"""
    return InsightEngineService(db).get_dashboard(current_user.id)
