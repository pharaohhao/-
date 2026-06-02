from pydantic import BaseModel
from typing import Optional

class MemoryCreate(BaseModel):
    category: str  # food/hobby/style/personality/relationship/dream/dislike/other
    content: str
    keywords: str = ""
    importance: int = 5
    source_type: str = "manual"  # chat/observation/manual

class MemoryUpdate(BaseModel):
    category: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    importance: Optional[int] = None

class MemoryRead(BaseModel):
    id: str
    persona_id: str
    category: str
    content: str
    keywords: str
    importance: int

    class Config:
        from_attributes = True
