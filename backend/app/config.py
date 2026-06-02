from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Relationship Intelligence API"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./relationship_intelligence.db"
    SECRET_KEY: str = "change-me-in-production-use-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    ANTHROPIC_API_KEY: str = ""
    LLM_PROVIDER: str = "claude"

    class Config:
        env_file = ".env"


settings = Settings()
