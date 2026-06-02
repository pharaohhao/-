# Personal Relationship Intelligence Platform — 设计文档

> 状态：已冻结 | 日期：2026-06-02

## 产品定义

**Personal Relationship Intelligence Platform** 是一个关系智能平台，帮助用户建立关于家人、伴侣、朋友的长期关系记忆系统，并将这些记忆转化为行动建议。

核心价值闭环：**记忆 → 理解 → 行动**

## Product Principles

所有功能决策必须符合以下六条原则：

1. **Persona First** — 所有数据必须归属于某个 Persona。系统围绕人物构建，而非围绕聊天构建。
2. **Memory Before Chat** — 聊天只是输入方式，记忆才是核心资产。
3. **Insight Before Storage** — 系统不仅存储信息，还应理解信息。
4. **Action Creates Value** — 记忆本身不产生价值。提醒、建议、简报、规划等行动能力才产生价值。
5. **Explainable Intelligence** — 所有 AI 结论都应可追溯到具体记忆、观察或事件来源。
6. **Human Relationships Over Productivity** — 本产品的目标不是任务管理，而是帮助用户维护重要的人际关系。

## 六层架构

```
L1 · Persona Layer    人物档案
L2 · Memory Layer     结构化记忆 + 溯源
L3 · Graph Layer      人物关系图谱
L4 · Insight Layer    AI 画像 + Health Score
L5 · Action Layer     提醒 · 建议 · 简报
L6 · Agent Layer      意图路由 · 规划链
```

## 技术栈

| 层 | 选择 | 说明 |
|---|------|------|
| 前端 | React + Vite | 现代前端框架，生态最大 |
| 后端 | FastAPI (Python) | 异步支持，SSE 原生支持 |
| 数据库 | SQLite | 零配置，单文件，适合个人应用 |
| 向量库 | FAISS | 本地向量检索，无需外部服务 |
| LLM | Claude API | 通过 LLM Adapter 抽象，预留 OpenAI/Gemini 扩展 |
| 样式 | Tailwind CSS | 轻量，不引入组件库依赖 |
| 认证 | JWT | 无状态认证 |
| 实时 | SSE + WebSocket 预留 | 流式响应 + 消息推送 |

## 系统架构

```
React Frontend
  PersonaSwitcher · Dashboard · Timeline · Chat
  RelationGraph · ActionCenter · HealthScore · AIBriefing
  NotificationCenter
       │  SSE + REST + JWT
       ▼
FastAPI Backend
  Persona Service    Relationship Service
  Memory Service     Event Service
  Insight Service    Action Service
  Reminder Service   Agent Router
       │
       ├── SQLite (主存储)
       ├── FAISS (向量检索)
       ├── LLM Adapter (Claude/OpenAI/Gemini)
       └── Background Tasks (Insight 生成 · Health Score · 提醒)
```

## 数据模型（11 张表）

### L1 — Persona Layer

**personas**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| user_id | UUID FK | 所属用户 |
| name | VARCHAR | 姓名，如 "小雨" |
| avatar | VARCHAR | 头像 emoji/URL |
| relationship | VARCHAR | 关系，如 "girlfriend", "father" |
| birthdate | DATE | 生日 |
| description | TEXT | AI 生成的描述 |
| personality | TEXT | AI 总结的性格 |
| interests | TEXT | AI 总结的兴趣 |
| gift_ideas | TEXT | AI 送礼建议 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### L2 — Memory Layer

**persona_memories**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| category | VARCHAR | 分类：food/hobby/style/personality/relationship/dream/dislike/other |
| content | TEXT | 记忆内容 |
| keywords | VARCHAR | 关键词，逗号分隔 |
| embedding | BLOB | 向量嵌入 |
| importance | INTEGER | 重要度 1-10 |
| created_at | DATETIME | 创建时间 |

**memory_sources**（记忆溯源）
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| memory_id | UUID FK | 关联记忆 |
| chat_message_id | UUID FK | 来源聊天消息 |
| observation_id | UUID FK | 来源观察（可选） |
| created_from | VARCHAR | 来源类型：chat/observation/manual |
| created_at | DATETIME | 创建时间 |

**observations**（观察记录）
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| content | TEXT | 观察内容 |
| source_type | VARCHAR | 来源：manual/chat/ai_inferred |
| confidence | FLOAT | 置信度 0-1 |
| created_at | DATETIME | 创建时间 |

### L3 — Graph Layer

**persona_relationships**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| source_persona_id | UUID FK | 源人物 |
| target_persona_id | UUID FK | 目标人物 |
| relationship_type | VARCHAR | 关系类型：son/daughter/spouse/parent/friend/mentor 等 |
| strength_score | INTEGER | 关系强度 1-100 |
| created_at | DATETIME | 创建时间 |

### L4 — Insight Layer

**persona_insights**（异步生成，缓存读取）
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| summary | TEXT | AI 生成的综合摘要 |
| personality | TEXT | 性格分析 |
| interests | TEXT | 兴趣标签 |
| gift_suggestions | TEXT | 送礼建议 |
| emotion_trend | JSON | 情绪趋势数据 |
| interest_trends | JSON | 兴趣变化趋势 |
| health_score | INTEGER | 关系健康度 0-100 |
| health_factors | JSON | 健康度因子分解 |
| updated_at | DATETIME | 最后更新时间 |

### L5 — Action Layer

**actions**（行动建议）
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| action_type | VARCHAR | 类型：contact/gift/event_prep/check_in |
| suggestion | TEXT | 建议内容 |
| reason | TEXT | 建议理由 |
| priority | INTEGER | 优先级 1-10 |
| is_completed | BOOLEAN | 是否完成 |
| created_at | DATETIME | 创建时间 |

**briefings**（AI 简报）
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| occasion | VARCHAR | 场景：meeting/birthday/casual |
| topics | TEXT | 建议话题 |
| recent_highlights | TEXT | 近期亮点 |
| generated_at | DATETIME | 生成时间 |

**events**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| persona_id | UUID FK | 所属人物 |
| title | VARCHAR | 事件标题 |
| description | TEXT | 描述 |
| event_type | VARCHAR | 类型：birthday/anniversary/exam/other |
| event_date | DATE | 事件日期 |
| is_recurring | BOOLEAN | 是否每年重复 |
| importance | INTEGER | 重要度 1-10 |
| created_at | DATETIME | 创建时间 |

**event_reminders**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| event_id | UUID FK | 关联事件 |
| remind_before_days | INTEGER | 提前多少天提醒 |
| reminded_at | DATETIME | 上次提醒时间 |
| is_sent | BOOLEAN | 是否已发送 |

### L6 — Agent Layer

**chat_sessions**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| user_id | UUID FK | 所属用户 |
| persona_id | UUID FK | 当前上下文人物（可空） |
| title | VARCHAR | 会话标题 |
| created_at | DATETIME | 创建时间 |

**chat_messages**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| session_id | UUID FK | 所属会话 |
| role | VARCHAR | user / assistant |
| content | TEXT | 消息内容 |
| intent | VARCHAR | Agent 识别的意图 |
| metadata | JSON | 额外元数据 |
| created_at | DATETIME | 创建时间 |

### 基础表

**users**
| 列 | 类型 | 说明 |
|----|------|------|
| id | UUID | 主键 |
| username | VARCHAR | 用户名 |
| email | VARCHAR | 邮箱 |
| password_hash | VARCHAR | 密码哈希 |
| created_at | DATETIME | 创建时间 |

## Agent Router 意图分类

| 意图 | 说明 | 示例 |
|------|------|------|
| MEMORY_ADD | 新增记忆 | "她喜欢向日葵" |
| MEMORY_QUERY | 查询记忆 | "她喜欢什么花？" |
| MEMORY_UPDATE | 更新记忆 | "她现在不喜欢那个了" |
| MEMORY_DELETE | 删除记忆 | "删掉那条" |
| EVENT_CREATE | 创建事件 | "她生日是8月1号" |
| EVENT_QUERY | 查询事件 | "下周有什么安排？" |
| PERSONA_QUERY | 查询人物 | "总结一下爸爸" |
| OBSERVATION_ADD | 记录观察 | "今天看到她一直在看那个" |
| RECOMMENDATION | 请求建议 | "妈妈生日送什么？" |
| BRIEFING | 请求简报 | "准备见张老师" |
| CHAT | 闲聊 | 其他非操作类对话 |

## AI 能力矩阵

| 能力 | 说明 | 实现 |
|------|------|------|
| 记忆提取 | 从聊天中自动提取结构化记忆 | Claude 提取 + 存入 persona_memories + FAISS |
| 向量检索 | 语义搜索记忆 | Embedding + FAISS 相似度检索 |
| RAG 问答 | 结合检索结果生成回答 | Top-K 记忆 + System Prompt + Claude |
| 人物卡生成 | AI 总结人物画像 | Background Task → persona_insights |
| 智能提醒 | 结合记忆上下文的提醒 | 定时扫描 + 记忆检索 + 生成增强提醒 |
| AI Briefing | 场景化简报 | 检索近期记忆 → LLM 生成简报 |
| 礼物推荐 | 结合兴趣和近期关注的推荐 | 检索记忆 → LLM 推荐 + 理由 |
| 记忆溯源 | 所有结论可追溯到原始来源 | memory_sources 表 + 来源引用 |
| Health Score | 关系健康度评分 | 后台计算：频率/完整度/参与度 |
| 观察推理 | 从观察中归纳记忆 | Observation → Insight → Memory |

## 前端页面结构

```
/                         首页/Dashboard（人物概览列表）
/login                    登录页
/register                 注册页
/persona/:id              人物主页
  - Dashboard             人物卡片 + 统计
  - Timeline              时间线
  - Memories              记忆列表
  - AI Card               AI 人物卡
/chat/:personaId          上下文聊天
/chat                      全局聊天
/relationships            关系图谱
/actions                  行动中心
/settings                 设置页
```

## V1/V2/V3 路线

### V1 — 核心闭环（MVP）
- Persona CRUD + 切换器
- AI 记忆提取（聊天 → 结构化存储）
- Embedding + FAISS 向量检索 + RAG 问答
- AI 人物卡自动生成
- 人物时间线
- 智能提醒（多级 + 记忆增强）
- AI Briefing（会前/事前简报）
- 礼物/行动推荐
- JWT 用户认证

### V2 — 关系智能
- Relationship Graph 关系图谱
- Health Score 关系健康度
- Planner Agent 多步规划

### V3 — 高级智能
- Observation 推理链（观察 → 归纳 → 记忆）
- 关系趋势分析
- 主动行动建议
- Multi-Agent 协作

## AI 层设计原则

### LLM Provider 必须可替换

业务代码永远依赖抽象 `LLMProvider`，不依赖具体实现。所有 LLM 调用必须通过统一入口。

```python
class LLMProvider(ABC):
    async def chat(self, messages: list, **kwargs) -> str
    async def extract(self, text: str, schema: dict) -> list[dict]

class ClaudeProvider(LLMProvider): ...
class OpenAIProvider(LLMProvider): ...
class GeminiProvider(LLMProvider): ...
```

### Knowledge Service 拆分

Memory Service 只负责 CRUD。Embedding / FAISS / RAG / Retrieval 由 Knowledge Service 独立负责。

```
Memory Service     → CRUD（创建/更新/删除/搜索记忆）
Knowledge Service  → Embedding 生成、FAISS 索引、向量检索、RAG 查询
```

### AI 基础设施目录结构

```
backend/app/ai/
├── providers/
│   ├── __init__.py
│   ├── base.py          # LLMProvider 抽象基类
│   ├── claude.py        # ClaudeProvider 实现
│   └── factory.py       # LLMProvider 工厂
├── prompts/
│   ├── __init__.py
│   ├── memory_extraction.py
│   └── persona_summary.py
├── schemas/
│   ├── __init__.py
│   ├── extraction.py    # 记忆提取的结构化输出 schema
│   └── chat.py          # 聊天请求/响应 schema
└── services/
    ├── __init__.py
    ├── llm_service.py        # LLM 调用统一入口
    └── knowledge_service.py  # Embedding + FAISS + RAG
```

### 混合检索策略

关键词检索（SQL LIKE）+ 向量检索（FAISS）→ 加权融合：

```
Final Score = Keyword Score × α + Vector Score × (1 - α)
```

结构化字段查询（如生日、姓名）优先用关键词匹配；语义模糊查询（如"喜欢什么风格"）优先用向量检索。

## 开发 Sprint

### Sprint 1：基础设施 ✅ 已完成
- [x] 项目脚手架（FastAPI + React + Vite）
- [x] 数据库模型（SQLAlchemy + Alembic，13 张表）
- [x] JWT 认证
- [x] Persona/Memory/Event/Observation/Relationship CRUD API
- [x] React 前端脚手架

### Sprint 2：AI 核心

#### Sprint 2.1 — LLM Gateway（AI 基础设施）
- LLMProvider 抽象基类 + ClaudeProvider 实现
- LLMProvider 工厂（通过配置切换 provider）
- LLM Service 统一调用入口
- AI 相关 Pydantic schemas
- Prompt 模板管理

#### Sprint 2.2 — Memory Extraction
- 自然语言 → 结构化记忆抽取 Pipeline
- 多实体识别（一段文本提取多条记忆）
- 记忆分类自动推断（category: food/hobby/style...）
- 抽取准确性验证

#### Sprint 2.3 — Embedding + FAISS + Knowledge Service
- Knowledge Service 实现
- 新增记忆时自动生成 Embedding
- FAISS 向量索引构建与持久化
- 混合检索（关键词 + 向量加权融合）

#### Sprint 2.4 — Persona Context Chat + RAG
- 上下文聊天（当前 Persona 自动注入检索上下文）
- RAG 问答：用户问题 → Embedding → FAISS Top-K → LLM 生成
- 验收标准：切换人物后，"她喜欢什么？" 自动检索正确人物的记忆

### Sprint 3：用户可见价值
- Persona Switcher 前端组件
- Dashboard 页面（统计卡片 + 近期动态）
- AI 人物卡展示
- 时间线组件

### Sprint 4：产品亮点
- AI Briefing 生成
- 智能提醒系统（多级 + 记忆增强）
- 礼物/行动推荐
- 通知中心

### Sprint 5：高级能力
- Relationship Graph 可视化
- Health Score 计算与展示
- Planner Agent 规划链

### Persona Intelligence 闭环（Sprint 2 验收标准）

```
用户输入 "妈妈喜欢百合花"
      ↓
Memory Extraction → 结构化记忆 [{persona:"妈妈", category:"preference", content:"喜欢百合花"}]
      ↓
存储 Memory + Embedding + FAISS
      ↓
用户提问 "妈妈最近喜欢什么？"（当前 Persona = 妈妈）
      ↓
Knowledge Service 检索（关键词 + 向量混合）
      ↓
RAG → Claude 生成回答
      ↓
"根据记录，妈妈喜欢百合花。"
```

当这个闭环首次跑通时，项目从 CRUD 系统质变为 AI Relationship Intelligence Platform。

---

*文档版本：2.0 | Sprint 1 验收通过 (2026-06-02) | 进入 Sprint 2.1*
