from pydantic import BaseModel

class RelationshipCreate(BaseModel):
    source_persona_id: str
    target_persona_id: str
    relationship_type: str  # son/daughter/spouse/parent/friend/mentor/colleague/other
    strength_score: int = 50

class RelationshipRead(BaseModel):
    id: str
    source_persona_id: str
    target_persona_id: str
    relationship_type: str
    strength_score: int

    class Config:
        from_attributes = True
