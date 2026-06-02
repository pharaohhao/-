from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    persona_id: str = Field(description="当前上下文人物 ID")
    message: str = Field(description="用户消息")


class ChatResponse(BaseModel):
    reply: str = Field(description="AI 回复")
    persona_name: str = Field(default="", description="人物名称")
    sources: list[dict] = Field(default_factory=list, description="引用来源")
    memories_used: int = Field(default=0, description="使用的记忆数量")
