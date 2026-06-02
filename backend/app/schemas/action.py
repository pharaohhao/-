from pydantic import BaseModel

class ActionCreate(BaseModel):
    action_type: str  # contact/gift/event_prep/check_in
    suggestion: str
    reason: str = ""
    priority: int = 5

class ActionRead(BaseModel):
    id: str
    persona_id: str
    action_type: str
    suggestion: str
    reason: str
    priority: int
    is_completed: bool

    class Config:
        from_attributes = True

class BriefingRequest(BaseModel):
    persona_id: str
    occasion: str = "casual"  # meeting/birthday/casual

class BriefingRead(BaseModel):
    id: str
    persona_id: str
    occasion: str
    topics: str
    recent_highlights: str

    class Config:
        from_attributes = True
