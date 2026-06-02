from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.snapshots.services.snapshot_service import SnapshotService

router = APIRouter(prefix="/personas/{persona_id}/snapshot", tags=["snapshot"])


@router.get("")
def get_snapshot(
    persona_id: str,
    target_date: date = Query(alias="date", description="目标日期 YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取人物在指定时间点的状态快照"""
    result = SnapshotService(db).get_snapshot(persona_id, target_date)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/years")
def get_timeline_years(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取人物有数据的所有年份"""
    return {"years": SnapshotService(db).get_timeline_years(persona_id)}


@router.get("/diff")
def get_diff(
    persona_id: str,
    from_date: date = Query(alias="from"),
    to_date: date = Query(alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """比较人物在两个时间点之间的变化"""
    result = SnapshotService(db).get_diff(persona_id, from_date, to_date)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
