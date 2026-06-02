from pydantic import BaseModel, Field


class MemoryExtractionItem(BaseModel):
    persona_name: str = Field(description="人物名称，如：妈妈、爸爸、小雨")
    category: str = Field(description="分类：food/hobby/style/personality/relationship/dream/dislike/other")
    content: str = Field(description="记忆内容")
    keywords: str = Field(default="", description="逗号分隔的关键词")
    importance: int = Field(default=5, ge=1, le=10, description="重要度 1-10")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="提取置信度")
    source_type: str = Field(default="direct_statement", description="来源类型: direct_statement/inference/observation")


class MemoryExtractionResult(BaseModel):
    items: list[MemoryExtractionItem]
    events: list[dict] = Field(default_factory=list, description="同时提取的事件信息")


class IntentDetectionResult(BaseModel):
    intent: str = Field(description="意图类型: ADD_MEMORY/CHAT/EVENT_CREATE/OBSERVATION")
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
