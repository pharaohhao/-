from app.ai.providers.base import LLMProvider
from app.config import settings

_provider: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    """获取 LLM Provider 单例，通过 settings.LLM_PROVIDER 配置切换"""
    global _provider
    if _provider is None:
        provider_type = settings.LLM_PROVIDER
        if provider_type == "claude":
            from app.ai.providers.claude import ClaudeProvider
            _provider = ClaudeProvider()
        else:
            raise ValueError(f"Unknown LLM provider: {provider_type}")
    return _provider


def set_llm_provider(provider: LLMProvider):
    """注入自定义 Provider（用于测试或运行时切换）"""
    global _provider
    _provider = provider


def reset_llm_provider():
    """重置 Provider 单例（下次调用时重新创建）"""
    global _provider
    _provider = None
