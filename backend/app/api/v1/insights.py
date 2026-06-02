from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.insight import PersonaInsightRead
from app.services.insight_service import InsightService
from app.services.insight_engine_service import InsightEngineService

router = APIRouter(prefix="/personas/{persona_id}/insights", tags=["insights"])

@router.get("", response_model=PersonaInsightRead)
def get_insights(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    insight = InsightService(db).get_or_create(persona_id)
    if not insight:
        raise HTTPException(status_code=404, detail="Persona not found")
    return insight

@router.post("/generate", response_model=PersonaInsightRead)
async def generate_insights(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Persona, PersonaMemory, Event
    from app.ai.services.llm_service import LLMService

    persona = db.query(Persona).filter(Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    memories = db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona_id).all()
    events = db.query(Event).filter(Event.persona_id == persona_id).all()

    memory_dicts = [{"category": m.category, "content": m.content} for m in memories]
    event_dicts = [{"title": e.title, "event_type": e.event_type} for e in events]

    llm = LLMService()
    summary = await llm.generate_persona_summary(persona.name, memory_dicts, event_dicts)

    insight = InsightService(db).get_or_create(persona_id)
    insight.personality = summary.get("personality", "")
    insight.interests = summary.get("interests", "")
    insight.summary = summary.get("summary", "")
    insight.gift_suggestions = summary.get("gift_suggestions", "")
    db.commit()
    db.refresh(insight)
    return insight


@router.post("/analyze")
def analyze_persona(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = InsightEngineService(db).analyze(persona_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
