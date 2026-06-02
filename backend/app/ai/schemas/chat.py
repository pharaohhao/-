from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    persona_id: str | None = Field(default=None, description="当前上下文人物 ID")
    session_id: str | None = Field(default=None, description="当前会话 ID")


class ChatResponse(BaseModel):
    reply: str
    intent: str | None = Field(default=None, description="识别的意图")
