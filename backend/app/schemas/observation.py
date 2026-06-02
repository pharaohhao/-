from pydantic import BaseModel

class ObservationCreate(BaseModel):
    content: str
    source_type: str = "manual"  # manual/chat/ai_inferred
    confidence: float = 1.0

class ObservationRead(BaseModel):
    id: str
    persona_id: str
    content: str
    source_type: str
    confidence: float

    class Config:
        from_attributes = True
