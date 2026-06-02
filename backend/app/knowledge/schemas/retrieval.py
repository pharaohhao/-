from pydantic import BaseModel, Field


class SearchResult(BaseModel):
    memory_id: str = Field(description="记忆 ID")
    persona_id: str = Field(description="所属人物 ID")
    persona_name: str = Field(default="", description="人物名称")
    category: str = Field(default="", description="记忆分类")
    content: str = Field(description="记忆内容")
    score: float = Field(description="检索得分")
    score_type: str = Field(default="hybrid", description="得分类型: keyword/vector/hybrid")


class SearchResponse(BaseModel):
    query: str = Field(description="原始查询")
    results: list[SearchResult] = Field(default_factory=list)
    total: int = Field(default=0)
