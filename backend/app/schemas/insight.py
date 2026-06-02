from pydantic import BaseModel
from typing import Optional

class PersonaInsightRead(BaseModel):
    id: str
    persona_id: str
    summary: str
    personality: str
    interests: str
    gift_suggestions: str
    emotion_trend: Optional[dict] = None
    interest_trends: Optional[dict] = None
    health_score: int
    health_factors: Optional[dict] = None

    class Config:
        from_attributes = True
