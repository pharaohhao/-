# Personal Relationship Intelligence Platform

> 以人物为中心的关系智能平台 — Persona First, Not Chat First

## 核心能力

记录并理解你关心的人：家人、伴侣、朋友、导师。系统自动提取结构化记忆、生成人物画像、并在你提问时结合记忆上下文给出有来源引用的回答。

```
用户输入 "妈妈喜欢百合花"
     ↓
Memory Extraction → 结构化记忆
     ↓
Embedding + FAISS → 向量索引
     ↓
Persona Context RAG → 上下文回答
     ↓
"根据记录，妈妈喜欢百合花。"
```

## 技术架构

| 层 | 技术 |
|---|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Zustand |
| 后端 | FastAPI (Python 3.12) + SQLAlchemy 2.0 + Alembic |
| 数据库 | SQLite + FAISS (向量检索) |
| AI | Claude API (LLM) + Sentence Transformers (Embedding) |
| 认证 | JWT (python-jose + bcrypt) |

### 代码架构

```
backend/app/
├── ai/           LLM Gateway + Memory Intelligence Pipeline
├── knowledge/    Embedding + FAISS + Hybrid Search
├── chat/         Persona Context RAG + Provenance
├── models/       13 张表 (SQLAlchemy ORM)
├── schemas/      Pydantic v2 验证
├── services/     8 个业务 Service
├── api/v1/       10 个路由模块 + SSE 流式
└── core/         JWT + Config

frontend/src/
├── components/   PersonaSwitcher, Dashboard, AI Card, Timeline, Chat
├── pages/        Home, PersonaPage, Login, Register
├── services/     API 封装层 (persona, memory, chat, insight, timeline)
└── store/        Zustand 全局状态
```

## 版本演进

### V1 — 核心闭环 (2026-06)

- **Sprint 1**: 基础设施 — FastAPI + React 脚手架、13 张表、JWT 认证、CRUD API
- **Sprint 2.1**: LLM Gateway — Provider 抽象层 (Claude/OpenAI/Gemini 可替换)
- **Sprint 2.2**: Memory Intelligence Pipeline — 意图检测 → 记忆提取 → 验证 → 去重 → 溯源
- **Sprint 2.3**: Knowledge Service — Sentence Transformers Embedding + FAISS 向量检索 + 混合搜索
- **Sprint 2.4**: Persona Context Chat — 人物上下文 RAG、来源引用、SSE 流式回答
- **Sprint 3**: Persona Experience Layer — 人物切换器、Dashboard、AI 人物卡、时间线、AI 简报

### V2 — 关系智能 (开发中)

- **Sprint 1**: Relationship Graph — 关系图谱可视化 (React Flow) + 动态强度评分引擎

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- Claude API Key

### 安装

```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e .
alembic upgrade head

# 配置 API Key
cp .env.example .env
# 编辑 .env: ANTHROPIC_API_KEY=sk-ant-...

# 前端
cd frontend
npm install
```

### 运行

```bash
# 后端 (http://localhost:8000)
cd backend && uvicorn app.main:app --reload

# 前端 (http://localhost:5173)
cd frontend && npm run dev
```

### API 端点

```
POST   /api/v1/auth/register          注册
POST   /api/v1/auth/login             登录
GET    /api/v1/personas               人物列表
POST   /api/v1/personas               创建人物
GET    /api/v1/personas/{id}          人物详情
GET    /api/v1/personas/{id}/timeline 人物时间线
GET    /api/v1/personas/{id}/insights  AI 人物画像
POST   /api/v1/personas/{id}/insights/generate  生成 AI 画像
POST   /api/v1/personas/{id}/memories            添加记忆
GET    /api/v1/personas/{id}/memories            记忆列表
POST   /api/v1/chat                   Persona Context RAG 问答
POST   /api/v1/chat/stream            SSE 流式问答
GET    /api/v1/graph                  关系图谱数据
```

## 设计原则

1. **Persona First** — 所有数据归属人物，系统围绕人物构建
2. **Memory Before Chat** — 聊天是输入方式，记忆是核心资产
3. **Insight Before Storage** — 不仅存储信息，更要理解信息
4. **Action Creates Value** — 记忆通过行动产生价值
5. **Explainable Intelligence** — AI 结论可追溯到原始来源
