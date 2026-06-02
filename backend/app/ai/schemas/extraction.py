from pydantic import BaseModel, Field


class MemoryExtractionItem(BaseModel):
    persona_name: str = Field(description="人物名称，如：妈妈、爸爸、小雨")
    category: str = Field(description="分类：food/hobby/style/personality/relationship/dream/dislike/other")
    content: str = Field(description="记忆内容")
    keywords: str = Field(default="", description="逗号分隔的关键词")
    importance: int = Field(default=5, ge=1, le=10, description="重要度 1-10")


class MemoryExtractionResult(BaseModel):
    items: list[MemoryExtractionItem]
