from pydantic import BaseModel
from typing import Optional

class ChatMessageCreate(BaseModel):
    session_id: str
    content: str

class ChatMessageRead(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    intent: Optional[str] = None

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    persona_id: Optional[str] = None
    title: str = "新对话"

class ChatSessionRead(BaseModel):
    id: str
    user_id: str
    persona_id: Optional[str] = None
    title: str

    class Config:
        from_attributes = True
