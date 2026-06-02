from pydantic import BaseModel
from datetime import date
from typing import Optional

class PersonaCreate(BaseModel):
    name: str
    avatar: str = "👤"
    relation: str  # girlfriend/father/mother/mentor/friend — NOTE: matches model column 'relation'
    birthdate: Optional[date] = None
    description: str = ""
    personality: str = ""
    interests: str = ""
    gift_ideas: str = ""

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    relation: Optional[str] = None
    birthdate: Optional[date] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    interests: Optional[str] = None
    gift_ideas: Optional[str] = None

class PersonaRead(BaseModel):
    id: str
    user_id: str
    name: str
    avatar: str
    relation: str
    birthdate: Optional[date] = None
    description: str
    personality: str
    interests: str
    gift_ideas: str

    class Config:
        from_attributes = True
