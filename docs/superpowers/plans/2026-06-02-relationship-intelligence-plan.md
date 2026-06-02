# Personal Relationship Intelligence Platform — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Personal Relationship Intelligence Platform 的完整后端基础设施，包括项目脚手架、11 张数据库模型、JWT 认证、Persona/Memory CRUD API。

**Architecture:** FastAPI 后端 + React 前端，分五层目录（models/schemas/api/services/core），SQLAlchemy ORM + Alembic 迁移，JWT 无状态认证，SQLite 数据库。

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, SQLite, python-jose (JWT), passlib, React 18 + Vite + Tailwind CSS

---

## 文件结构总览

```
backend/
  app/
    __init__.py
    main.py                    # FastAPI 应用入口，CORS，路由挂载
    config.py                  # Settings (pydantic-settings)
    database.py                # SQLAlchemy engine + session
    models/
      __init__.py              # 导出所有模型
      base.py                  # DeclarativeBase + TimestampMixin
      user.py                  # User 模型
      persona.py               # Persona 模型
      memory.py                # PersonaMemory + MemorySource + Observation
      relationship.py          # PersonaRelationship
      event.py                 # Event + EventReminder
      insight.py               # PersonaInsight
      action.py                # Action + Briefing
      chat.py                  # ChatSession + ChatMessage
    schemas/
      __init__.py
      user.py                  # UserCreate, UserRead, Token
      persona.py               # PersonaCreate, PersonaRead, PersonaUpdate
      memory.py                # MemoryCreate, MemoryRead, MemoryUpdate
      relationship.py          # RelationshipCreate, RelationshipRead
      event.py                 # EventCreate, EventRead, EventReminderCreate
      observation.py           # ObservationCreate, ObservationRead
      insight.py               # PersonaInsightRead
      action.py                # ActionCreate, ActionRead, BriefingRead
      chat.py                  # ChatMessageCreate, ChatMessageRead, ChatSessionRead
    api/
      __init__.py
      deps.py                  # get_db, get_current_user 依赖
      v1/
        __init__.py
        router.py              # 聚合所有 v1 路由
        auth.py                # POST /register, POST /login
        personas.py            # CRUD /personas
        memories.py            # CRUD /personas/{id}/memories
        relationships.py       # CRUD /relationships
        events.py              # CRUD /events
        observations.py        # CRUD /observations
        insights.py            # GET /personas/{id}/insights
        actions.py             # CRUD /actions, POST /briefings
        chat.py                # POST /chat/sessions, POST /chat/messages
    services/
      __init__.py
      persona_service.py
      memory_service.py
      relationship_service.py
      event_service.py
      observation_service.py
      insight_service.py
      action_service.py
      agent_router.py          # 意图分类路由
    core/
      __init__.py
      security.py              # JWT encode/decode, password hash
  alembic/
    versions/
    env.py
    alembic.ini
  requirements.txt
  pyproject.toml

frontend/
  src/
    components/
      layout/
        Sidebar.tsx
        PersonaSwitcher.tsx
      dashboard/
        PersonaCard.tsx
        HealthScore.tsx
        StatsGrid.tsx
      timeline/
        Timeline.tsx
        TimelineItem.tsx
      chat/
        ChatWindow.tsx
        ChatInput.tsx
        MessageBubble.tsx
      personas/
        PersonaForm.tsx
        PersonaDetail.tsx
    pages/
      Home.tsx
      Login.tsx
      Register.tsx
      PersonaPage.tsx
      ChatPage.tsx
      RelationshipsPage.tsx
      ActionsPage.tsx
      SettingsPage.tsx
    services/
      api.ts                   # axios 实例 + 拦截器
      auth.ts                  # 登录/注册/令牌管理
    hooks/
      useAuth.ts
      usePersonas.ts
      useChat.ts
    types/
      index.ts                 # TypeScript 类型定义
    App.tsx
    main.tsx
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  tsconfig.json
```

---

## Sprint 1：基础设施

### Task 1: 项目脚手架

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`

- [ ] **Step 1: 创建 backend 目录结构和 pyproject.toml**

```bash
mkdir -p backend/app/models backend/app/schemas backend/app/api/v1 backend/app/services backend/app/core
```

```toml
# backend/pyproject.toml
[project]
name = "relationship-intelligence"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110.0",
    "uvicorn[standard]>=0.29.0",
    "sqlalchemy>=2.0.30",
    "alembic>=1.13.0",
    "pydantic>=2.7.0",
    "pydantic-settings>=2.2.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.9",
]
```

- [ ] **Step 2: 创建 requirements.txt**

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
sqlalchemy>=2.0.30
alembic>=1.13.0
pydantic>=2.7.0
pydantic-settings>=2.2.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
```

- [ ] **Step 3: 创建 config.py**

```python
# backend/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Relationship Intelligence API"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./relationship_intelligence.db"
    SECRET_KEY: str = "change-me-in-production-use-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 4: 创建 main.py**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 5: 验证脚手架运行**

```bash
cd backend && pip install -e . && uvicorn app.main:app --reload --port 8000
```

Expected: `curl http://localhost:8000/health` 返回 `{"status":"ok"}`

- [ ] **Step 6: 初始化 Git 仓库并提交**

```bash
cd "D:\AIcode\新建文件夹"
git init
echo ".superpowers/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.db" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
git add -A
git commit -m "feat: initialize project scaffold with FastAPI health endpoint"
```

---

### Task 2: 数据库基础模型

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/persona.py`

- [ ] **Step 1: 创建 database.py**

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 需要
    echo=settings.DEBUG,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: 创建 base.py**

```python
# backend/app/models/base.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.dialects.sqlite import CHAR

def generate_uuid():
    return str(uuid.uuid4())

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
```

- [ ] **Step 3: 创建 User 模型**

```python
# backend/app/models/user.py
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    personas = relationship("Persona", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
```

- [ ] **Step 4: 创建 Persona 模型**

```python
# backend/app/models/persona.py
from sqlalchemy import Column, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class Persona(Base, TimestampMixin):
    __tablename__ = "personas"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    avatar = Column(String(10), default="👤")
    relationship = Column(String(20), nullable=False)  # girlfriend/father/mother/mentor/friend
    birthdate = Column(Date, nullable=True)
    description = Column(Text, default="")
    personality = Column(Text, default="")
    interests = Column(Text, default="")
    gift_ideas = Column(Text, default="")

    user = relationship("User", back_populates="personas")
    memories = relationship("PersonaMemory", back_populates="persona", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="persona", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="persona", cascade="all, delete-orphan")
    insights = relationship("PersonaInsight", back_populates="persona", uselist=False, cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="persona", cascade="all, delete-orphan")
    briefings = relationship("Briefing", back_populates="persona", cascade="all, delete-orphan")
```

- [ ] **Step 5: 创建 models/__init__.py**

```python
# backend/app/models/__init__.py
from app.models.base import Base, TimestampMixin, generate_uuid
from app.models.user import User
from app.models.persona import Persona
```

- [ ] **Step 6: 创建数据库初始化脚本并验证表创建**

```bash
cd backend && python -c "
from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print('Tables created successfully')
"
```

- [ ] **Step 7: 提交**

```bash
git add backend/app/database.py backend/app/models/
git commit -m "feat: add database base, User and Persona models"
```

---

### Task 3: 完整数据模型（11 张表）

**Files:**
- Create: `backend/app/models/memory.py`
- Create: `backend/app/models/relationship.py`
- Create: `backend/app/models/event.py`
- Create: `backend/app/models/observation.py`
- Create: `backend/app/models/insight.py`
- Create: `backend/app/models/action.py`
- Create: `backend/app/models/chat.py`
- Modify: `backend/app/models/__init__.py`

- [ ] **Step 1: 创建 memory.py（persona_memories + memory_sources）**

```python
# backend/app/models/memory.py
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR, BLOB
from app.models.base import Base, TimestampMixin, generate_uuid

class PersonaMemory(Base, TimestampMixin):
    __tablename__ = "persona_memories"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(20), nullable=False, index=True)
    # food/hobby/style/personality/relationship/dream/dislike/other
    content = Column(Text, nullable=False)
    keywords = Column(String(500), default="")
    embedding = Column(BLOB, nullable=True)
    importance = Column(Integer, default=5)

    persona = relationship("Persona", back_populates="memories")
    sources = relationship("MemorySource", back_populates="memory", cascade="all, delete-orphan")


class MemorySource(Base, TimestampMixin):
    __tablename__ = "memory_sources"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    memory_id = Column(CHAR(36), ForeignKey("persona_memories.id", ondelete="CASCADE"), nullable=False, index=True)
    chat_message_id = Column(CHAR(36), ForeignKey("chat_messages.id", ondelete="SET NULL"), nullable=True)
    observation_id = Column(CHAR(36), ForeignKey("observations.id", ondelete="SET NULL"), nullable=True)
    created_from = Column(String(20), nullable=False)  # chat/observation/manual

    memory = relationship("PersonaMemory", back_populates="sources")
    chat_message = relationship("ChatMessage", back_populates="memory_sources")
```

- [ ] **Step 2: 创建 observation.py**

```python
# backend/app/models/observation.py
from sqlalchemy import Column, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class Observation(Base, TimestampMixin):
    __tablename__ = "observations"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    source_type = Column(String(20), nullable=False, default="manual")  # manual/chat/ai_inferred
    confidence = Column(Float, default=1.0)

    persona = relationship("Persona", back_populates="observations")
```

- [ ] **Step 3: 创建 relationship.py**

```python
# backend/app/models/relationship.py
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class PersonaRelationship(Base, TimestampMixin):
    __tablename__ = "persona_relationships"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    source_persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    target_persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(20), nullable=False)
    # son/daughter/spouse/parent/friend/mentor/colleague/other
    strength_score = Column(Integer, default=50)

    source_persona = relationship("Persona", foreign_keys=[source_persona_id])
    target_persona = relationship("Persona", foreign_keys=[target_persona_id])
```

- [ ] **Step 4: 创建 event.py**

```python
# backend/app/models/event.py
from sqlalchemy import Column, String, Text, Date, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, default="")
    event_type = Column(String(20), nullable=False)  # birthday/anniversary/exam/other
    event_date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=False)
    importance = Column(Integer, default=5)

    persona = relationship("Persona", back_populates="events")
    reminders = relationship("EventReminder", back_populates="event", cascade="all, delete-orphan")


class EventReminder(Base, TimestampMixin):
    __tablename__ = "event_reminders"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    event_id = Column(CHAR(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    remind_before_days = Column(Integer, nullable=False)
    reminded_at = Column(DateTime, nullable=True)
    is_sent = Column(Boolean, default=False)

    event = relationship("Event", back_populates="reminders")
```

- [ ] **Step 5: 创建 insight.py**

```python
# backend/app/models/insight.py
from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class PersonaInsight(Base, TimestampMixin):
    __tablename__ = "persona_insights"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary = Column(Text, default="")
    personality = Column(Text, default="")
    interests = Column(Text, default="")
    gift_suggestions = Column(Text, default="")
    emotion_trend = Column(JSON, nullable=True)
    interest_trends = Column(JSON, nullable=True)
    health_score = Column(Integer, default=100)
    health_factors = Column(JSON, nullable=True)

    persona = relationship("Persona", back_populates="insights")
```

- [ ] **Step 6: 创建 action.py**

```python
# backend/app/models/action.py
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class Action(Base, TimestampMixin):
    __tablename__ = "actions"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(20), nullable=False)  # contact/gift/event_prep/check_in
    suggestion = Column(Text, nullable=False)
    reason = Column(Text, default="")
    priority = Column(Integer, default=5)
    is_completed = Column(Boolean, default=False)

    persona = relationship("Persona", back_populates="actions")


class Briefing(Base, TimestampMixin):
    __tablename__ = "briefings"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True)
    occasion = Column(String(30), nullable=False)  # meeting/birthday/casual
    topics = Column(Text, default="")
    recent_highlights = Column(Text, default="")

    persona = relationship("Persona", back_populates="briefings")
```

- [ ] **Step 7: 创建 chat.py**

```python
# backend/app/models/chat.py
from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import CHAR
from app.models.base import Base, TimestampMixin, generate_uuid

class ChatSession(Base, TimestampMixin):
    __tablename__ = "chat_sessions"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    persona_id = Column(CHAR(36), ForeignKey("personas.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), default="新对话")

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base, TimestampMixin):
    __tablename__ = "chat_messages"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    session_id = Column(CHAR(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # user/assistant
    content = Column(Text, nullable=False)
    intent = Column(String(30), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    session = relationship("ChatSession", back_populates="messages")
    memory_sources = relationship("MemorySource", back_populates="chat_message")
```

- [ ] **Step 8: 更新 models/__init__.py**

```python
# backend/app/models/__init__.py
from app.models.base import Base, TimestampMixin, generate_uuid
from app.models.user import User
from app.models.persona import Persona
from app.models.memory import PersonaMemory, MemorySource
from app.models.observation import Observation
from app.models.relationship import PersonaRelationship
from app.models.event import Event, EventReminder
from app.models.insight import PersonaInsight
from app.models.action import Action, Briefing
from app.models.chat import ChatSession, ChatMessage
```

- [ ] **Step 9: 验证所有表创建**

```bash
cd backend && python -c "
from app.database import engine, Base
from app.models import *
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print('All 11 tables created successfully')
import sqlalchemy
insp = sqlalchemy.inspect(engine)
for table in insp.get_table_names():
    print(f'  - {table}')
"
```

- [ ] **Step 10: 提交**

```bash
git add backend/app/models/
git commit -m "feat: add all 11 database models (memory, relationship, event, observation, insight, action, chat)"
```

---

### Task 4: Alembic 迁移配置

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`

- [ ] **Step 1: 初始化 Alembic**

```bash
cd backend && alembic init alembic
```

- [ ] **Step 2: 修改 alembic.ini 中的数据库 URL**

```ini
# backend/alembic.ini (将 sqlalchemy.url 行改为)
sqlalchemy.url = sqlite:///./relationship_intelligence.db
```

- [ ] **Step 3: 修改 alembic/env.py**

```python
# backend/alembic/env.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.models import Base
from app.database import engine

target_metadata = Base.metadata

# ... 保留其余默认代码，只替换 config.set_main_option 行:
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

- [ ] **Step 4: 生成初始迁移并执行**

```bash
cd backend && alembic revision --autogenerate -m "initial_all_tables"
alembic upgrade head
```

- [ ] **Step 5: 提交**

```bash
git add backend/alembic.ini backend/alembic/ backend/alembic/versions/
git commit -m "feat: configure Alembic and generate initial migration"
```

---

### Task 5: JWT 安全模块

**Files:**
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/security.py`
- Test: `backend/tests/test_security.py` (手动验证脚本)

- [ ] **Step 1: 创建 security.py**

```python
# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
```

- [ ] **Step 2: 验证安全模块工作**

```bash
cd backend && python -c "
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

hashed = hash_password('test123')
assert verify_password('test123', hashed)
assert not verify_password('wrong', hashed)

token = create_access_token({'sub': 'user1'})
decoded = decode_access_token(token)
assert decoded['sub'] == 'user1'

print('All security checks passed')
"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/core/
git commit -m "feat: add JWT security module (hash, verify, token create/decode)"
```

---

### Task 6: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/persona.py`
- Create: `backend/app/schemas/memory.py`
- Create: `backend/app/schemas/relationship.py`
- Create: `backend/app/schemas/event.py`
- Create: `backend/app/schemas/observation.py`
- Create: `backend/app/schemas/insight.py`
- Create: `backend/app/schemas/action.py`
- Create: `backend/app/schemas/chat.py`

- [ ] **Step 1: 创建 user schemas**

```python
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserRead(BaseModel):
    id: str
    username: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str
```

- [ ] **Step 2: 创建 persona schemas**

```python
# backend/app/schemas/persona.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class PersonaCreate(BaseModel):
    name: str
    avatar: str = "👤"
    relationship: str  # girlfriend/father/mother/mentor/friend
    birthdate: Optional[date] = None
    description: str = ""
    personality: str = ""
    interests: str = ""
    gift_ideas: str = ""

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    relationship: Optional[str] = None
    birthdate: Optional[date] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    interests: Optional[str] = None
    gift_ideas: Optional[str] = None

class PersonaRead(BaseModel):
    id: str
    user_id: str
    name: str
    avatar: str
    relationship: str
    birthdate: Optional[date] = None
    description: str
    personality: str
    interests: str
    gift_ideas: str

    class Config:
        from_attributes = True
```

- [ ] **Step 3: 创建 memory schemas**

```python
# backend/app/schemas/memory.py
from pydantic import BaseModel
from typing import Optional

class MemoryCreate(BaseModel):
    category: str  # food/hobby/style/personality/relationship/dream/dislike/other
    content: str
    keywords: str = ""
    importance: int = 5
    source_type: str = "manual"  # chat/observation/manual

class MemoryUpdate(BaseModel):
    category: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    importance: Optional[int] = None

class MemoryRead(BaseModel):
    id: str
    persona_id: str
    category: str
    content: str
    keywords: str
    importance: int

    class Config:
        from_attributes = True
```

- [ ] **Step 4: 创建 relationship schemas**

```python
# backend/app/schemas/relationship.py
from pydantic import BaseModel
from typing import Optional

class RelationshipCreate(BaseModel):
    source_persona_id: str
    target_persona_id: str
    relationship_type: str  # son/daughter/spouse/parent/friend/mentor/colleague/other
    strength_score: int = 50

class RelationshipRead(BaseModel):
    id: str
    source_persona_id: str
    target_persona_id: str
    relationship_type: str
    strength_score: int

    class Config:
        from_attributes = True
```

- [ ] **Step 5: 创建 event schemas**

```python
# backend/app/schemas/event.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: str = ""
    event_type: str  # birthday/anniversary/exam/other
    event_date: date
    is_recurring: bool = False
    importance: int = 5

class EventRead(BaseModel):
    id: str
    persona_id: str
    title: str
    description: str
    event_type: str
    event_date: date
    is_recurring: bool
    importance: int

    class Config:
        from_attributes = True

class EventReminderCreate(BaseModel):
    event_id: str
    remind_before_days: int
```

- [ ] **Step 6: 创建 observation schemas**

```python
# backend/app/schemas/observation.py
from pydantic import BaseModel

class ObservationCreate(BaseModel):
    content: str
    source_type: str = "manual"  # manual/chat/ai_inferred
    confidence: float = 1.0

class ObservationRead(BaseModel):
    id: str
    persona_id: str
    content: str
    source_type: str
    confidence: float

    class Config:
        from_attributes = True
```

- [ ] **Step 7: 创建 insight schemas**

```python
# backend/app/schemas/insight.py
from pydantic import BaseModel
from typing import Optional

class PersonaInsightRead(BaseModel):
    id: str
    persona_id: str
    summary: str
    personality: str
    interests: str
    gift_suggestions: str
    emotion_trend: Optional[dict] = None
    interest_trends: Optional[dict] = None
    health_score: int
    health_factors: Optional[dict] = None

    class Config:
        from_attributes = True
```

- [ ] **Step 8: 创建 action schemas**

```python
# backend/app/schemas/action.py
from pydantic import BaseModel

class ActionCreate(BaseModel):
    action_type: str  # contact/gift/event_prep/check_in
    suggestion: str
    reason: str = ""
    priority: int = 5

class ActionRead(BaseModel):
    id: str
    persona_id: str
    action_type: str
    suggestion: str
    reason: str
    priority: int
    is_completed: bool

    class Config:
        from_attributes = True

class BriefingRequest(BaseModel):
    persona_id: str
    occasion: str = "casual"  # meeting/birthday/casual

class BriefingRead(BaseModel):
    id: str
    persona_id: str
    occasion: str
    topics: str
    recent_highlights: str

    class Config:
        from_attributes = True
```

- [ ] **Step 9: 创建 chat schemas**

```python
# backend/app/schemas/chat.py
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
```

- [ ] **Step 10: 创建 schemas/__init__.py**

```python
# backend/app/schemas/__init__.py
from app.schemas.user import UserCreate, UserRead, Token, LoginRequest
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaRead
from app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryRead
from app.schemas.relationship import RelationshipCreate, RelationshipRead
from app.schemas.event import EventCreate, EventRead, EventReminderCreate
from app.schemas.observation import ObservationCreate, ObservationRead
from app.schemas.insight import PersonaInsightRead
from app.schemas.action import ActionCreate, ActionRead, BriefingRequest, BriefingRead
from app.schemas.chat import ChatMessageCreate, ChatMessageRead, ChatSessionCreate, ChatSessionRead
```

- [ ] **Step 11: 提交**

```bash
git add backend/app/schemas/
git commit -m "feat: add all Pydantic schemas for 11 models"
```

---

### Task 7: API 依赖注入（deps）

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/deps.py`
- Create: `backend/app/api/v1/__init__.py`

- [ ] **Step 1: 创建 deps.py**

```python
# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models import User

security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
```

- [ ] **Step 2: 提交**

```bash
git add backend/app/api/
git commit -m "feat: add API dependency injection (get_db, get_current_user)"
```

---

### Task 8: Auth API（注册 + 登录）

**Files:**
- Create: `backend/app/api/v1/auth.py`
- Modify: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/v1/router.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: 创建 auth.py**

```python
# backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models import User
from app.schemas.user import UserCreate, UserRead, Token, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.id})
    return Token(access_token=token)
```

- [ ] **Step 2: 创建 v1 router 聚合**

```python
# backend/app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.personas import router as personas_router
from app.api.v1.memories import router as memories_router
from app.api.v1.relationships import router as relationships_router
from app.api.v1.events import router as events_router
from app.api.v1.observations import router as observations_router
from app.api.v1.insights import router as insights_router
from app.api.v1.actions import router as actions_router
from app.api.v1.chat import router as chat_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(personas_router)
api_router.include_router(memories_router)
api_router.include_router(relationships_router)
api_router.include_router(events_router)
api_router.include_router(observations_router)
api_router.include_router(insights_router)
api_router.include_router(actions_router)
api_router.include_router(chat_router)
```

- [ ] **Step 3: 更新 main.py 挂载路由**

```python
# backend/app/main.py (追加路由挂载)
from app.api.v1.router import api_router

app.include_router(api_router)
```

- [ ] **Step 4: 暂时创建空的 route 文件（避免 import 失败）**

```bash
cd backend/app/api/v1
for f in personas memories relationships events observations insights actions chat; do
  echo "from fastapi import APIRouter; router = APIRouter()" > "${f}.py"
done
```

- [ ] **Step 5: 验证 Auth API**

```bash
# 启动服务
cd backend && uvicorn app.main:app --reload --port 8000 &

# 测试注册
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# 测试登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

- [ ] **Step 6: 提交**

```bash
git add backend/app/api/v1/auth.py backend/app/api/v1/router.py backend/app/main.py backend/app/api/v1/*.py
git commit -m "feat: add auth API (register + login) with JWT token"
```

---

### Task 9: Persona CRUD API

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/persona_service.py`
- Modify: `backend/app/api/v1/personas.py`

- [ ] **Step 1: 创建 persona_service.py**

```python
# backend/app/services/persona_service.py
from sqlalchemy.orm import Session
from app.models import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate

class PersonaService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, data: PersonaCreate) -> Persona:
        persona = Persona(user_id=user_id, **data.model_dump())
        self.db.add(persona)
        self.db.commit()
        self.db.refresh(persona)
        return persona

    def get_by_id(self, persona_id: str, user_id: str) -> Persona | None:
        return self.db.query(Persona).filter(
            Persona.id == persona_id,
            Persona.user_id == user_id,
        ).first()

    def list_by_user(self, user_id: str) -> list[Persona]:
        return self.db.query(Persona).filter(Persona.user_id == user_id).all()

    def update(self, persona_id: str, user_id: str, data: PersonaUpdate) -> Persona | None:
        persona = self.get_by_id(persona_id, user_id)
        if not persona:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(persona, key, value)
        self.db.commit()
        self.db.refresh(persona)
        return persona

    def delete(self, persona_id: str, user_id: str) -> bool:
        persona = self.get_by_id(persona_id, user_id)
        if not persona:
            return False
        self.db.delete(persona)
        self.db.commit()
        return True
```

- [ ] **Step 2: 更新 personas.py 路由**

```python
# backend/app/api/v1/personas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaRead
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/personas", tags=["personas"])

@router.post("", response_model=PersonaRead, status_code=status.HTTP_201_CREATED)
def create_persona(
    data: PersonaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PersonaService(db).create(current_user.id, data)

@router.get("", response_model=list[PersonaRead])
def list_personas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PersonaService(db).list_by_user(current_user.id)

@router.get("/{persona_id}", response_model=PersonaRead)
def get_persona(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = PersonaService(db).get_by_id(persona_id, current_user.id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona

@router.put("/{persona_id}", response_model=PersonaRead)
def update_persona(
    persona_id: str,
    data: PersonaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = PersonaService(db).update(persona_id, current_user.id, data)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona

@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(
    persona_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not PersonaService(db).delete(persona_id, current_user.id):
        raise HTTPException(status_code=404, detail="Persona not found")
```

- [ ] **Step 3: 验证 Persona CRUD**

```bash
# 创建 Persona
curl -X POST http://localhost:8000/api/v1/personas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"小雨","relationship":"girlfriend","birthdate":"2000-08-15"}'

# 列表查询
curl http://localhost:8000/api/v1/personas \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/services/ backend/app/api/v1/personas.py
git commit -m "feat: add Persona CRUD API with service layer"
```

---

### Task 10: Memory CRUD API

**Files:**
- Create: `backend/app/services/memory_service.py`
- Modify: `backend/app/api/v1/memories.py`

- [ ] **Step 1: 创建 memory_service.py**

```python
# backend/app/services/memory_service.py
from sqlalchemy.orm import Session
from app.models import PersonaMemory, MemorySource, Persona
from app.schemas.memory import MemoryCreate, MemoryUpdate

class MemoryService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: MemoryCreate) -> PersonaMemory:
        memory = PersonaMemory(
            persona_id=persona_id,
            category=data.category,
            content=data.content,
            keywords=data.keywords,
            importance=data.importance,
        )
        self.db.add(memory)
        self.db.flush()

        source = MemorySource(
            memory_id=memory.id,
            created_from=data.source_type,
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def list_by_persona(self, persona_id: str) -> list[PersonaMemory]:
        return self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id
        ).order_by(PersonaMemory.created_at.desc()).all()

    def search_by_keywords(self, persona_id: str, query: str) -> list[PersonaMemory]:
        return self.db.query(PersonaMemory).filter(
            PersonaMemory.persona_id == persona_id,
            PersonaMemory.keywords.contains(query) | PersonaMemory.content.contains(query),
        ).all()

    def update(self, memory_id: str, data: MemoryUpdate) -> PersonaMemory | None:
        memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == memory_id).first()
        if not memory:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(memory, key, value)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def delete(self, memory_id: str) -> bool:
        memory = self.db.query(PersonaMemory).filter(PersonaMemory.id == memory_id).first()
        if not memory:
            return False
        self.db.delete(memory)
        self.db.commit()
        return True

    def get_sources(self, memory_id: str) -> list[MemorySource]:
        return self.db.query(MemorySource).filter(MemorySource.memory_id == memory_id).all()
```

- [ ] **Step 2: 更新 memories.py 路由**

```python
# backend/app/api/v1/memories.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryRead
from app.services.memory_service import MemoryService

router = APIRouter(prefix="/personas/{persona_id}/memories", tags=["memories"])

@router.post("", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
def create_memory(
    persona_id: str,
    data: MemoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return MemoryService(db).create(persona_id, data)

@router.get("", response_model=list[MemoryRead])
def list_memories(
    persona_id: str,
    query: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if query:
        return MemoryService(db).search_by_keywords(persona_id, query)
    return MemoryService(db).list_by_persona(persona_id)

@router.get("/{memory_id}", response_model=MemoryRead)
def get_memory(
    persona_id: str,
    memory_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    memory = MemoryService(db).list_by_persona(persona_id)
    memory = [m for m in memory if m.id == memory_id]
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory[0]

@router.put("/{memory_id}", response_model=MemoryRead)
def update_memory(
    persona_id: str,
    memory_id: str,
    data: MemoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    memory = MemoryService(db).update(memory_id, data)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(
    persona_id: str,
    memory_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not MemoryService(db).delete(memory_id):
        raise HTTPException(status_code=404, detail="Memory not found")
```

- [ ] **Step 3: 验证 Memory CRUD**

```bash
# 创建记忆
curl -X POST http://localhost:8000/api/v1/personas/$PERSONA_ID/memories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"hobby","content":"喜欢摄影，特别是胶片摄影","keywords":"摄影,胶片"}'

# 查询记忆列表
curl "http://localhost:8000/api/v1/personas/$PERSONA_ID/memories?query=摄影" \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/services/memory_service.py backend/app/api/v1/memories.py
git commit -m "feat: add Memory CRUD API with keyword search"
```

---

### Task 11: 剩余 CRUD API（Relationships, Events, Observations）

**Files:**
- Create: `backend/app/services/relationship_service.py`
- Create: `backend/app/services/event_service.py`
- Create: `backend/app/services/observation_service.py`
- Modify: `backend/app/api/v1/relationships.py`
- Modify: `backend/app/api/v1/events.py`
- Modify: `backend/app/api/v1/observations.py`

- [ ] **Step 1: 创建 relationship_service.py 并更新路由**

```python
# backend/app/services/relationship_service.py
from sqlalchemy.orm import Session
from app.models import PersonaRelationship
from app.schemas.relationship import RelationshipCreate

class RelationshipService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: RelationshipCreate) -> PersonaRelationship:
        rel = PersonaRelationship(**data.model_dump())
        self.db.add(rel)
        self.db.commit()
        self.db.refresh(rel)
        return rel

    def list_all(self) -> list[PersonaRelationship]:
        return self.db.query(PersonaRelationship).all()

    def get_graph(self) -> list[dict]:
        """返回可用于前端渲染的图谱数据"""
        rels = self.db.query(PersonaRelationship).all()
        nodes = set()
        edges = []
        for r in rels:
            nodes.add(r.source_persona_id)
            nodes.add(r.target_persona_id)
            edges.append({
                "source": r.source_persona_id,
                "target": r.target_persona_id,
                "type": r.relationship_type,
                "strength": r.strength_score,
            })
        return [{"id": n} for n in nodes], edges

    def delete(self, rel_id: str) -> bool:
        rel = self.db.query(PersonaRelationship).filter(PersonaRelationship.id == rel_id).first()
        if not rel:
            return False
        self.db.delete(rel)
        self.db.commit()
        return True
```

```python
# backend/app/api/v1/relationships.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.relationship import RelationshipCreate, RelationshipRead
from app.services.relationship_service import RelationshipService

router = APIRouter(prefix="/relationships", tags=["relationships"])

@router.post("", response_model=RelationshipRead, status_code=status.HTTP_201_CREATED)
def create_relationship(data: RelationshipCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return RelationshipService(db).create(data)

@router.get("", response_model=list[RelationshipRead])
def list_relationships(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return RelationshipService(db).list_all()

@router.delete("/{rel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relationship(rel_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not RelationshipService(db).delete(rel_id):
        raise HTTPException(status_code=404, detail="Relationship not found")
```

- [ ] **Step 2: 创建 event_service.py 并更新路由**

```python
# backend/app/services/event_service.py
from sqlalchemy.orm import Session
from app.models import Event, EventReminder
from app.schemas.event import EventCreate, EventReminderCreate

class EventService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: EventCreate) -> Event:
        event = Event(persona_id=persona_id, **data.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_by_persona(self, persona_id: str) -> list[Event]:
        return self.db.query(Event).filter(Event.persona_id == persona_id).order_by(Event.event_date.asc()).all()

    def get_upcoming(self, persona_id: str, days: int = 30) -> list[Event]:
        from datetime import date, timedelta
        today = date.today()
        cutoff = today + timedelta(days=days)
        return self.db.query(Event).filter(
            Event.persona_id == persona_id,
            Event.event_date >= today,
            Event.event_date <= cutoff,
        ).order_by(Event.event_date.asc()).all()

    def add_reminder(self, data: EventReminderCreate) -> EventReminder:
        reminder = EventReminder(**data.model_dump())
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def delete(self, event_id: str) -> bool:
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        self.db.delete(event)
        self.db.commit()
        return True
```

```python
# backend/app/api/v1/events.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.event import EventCreate, EventRead, EventReminderCreate
from app.services.event_service import EventService

router = APIRouter(prefix="/personas/{persona_id}/events", tags=["events"])

@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(persona_id: str, data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return EventService(db).create(persona_id, data)

@router.get("", response_model=list[EventRead])
def list_events(persona_id: str, upcoming: bool = False, days: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if upcoming:
        return EventService(db).get_upcoming(persona_id, days)
    return EventService(db).list_by_persona(persona_id)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(persona_id: str, event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not EventService(db).delete(event_id):
        raise HTTPException(status_code=404, detail="Event not found")
```

- [ ] **Step 3: 创建 observation_service.py 并更新路由**

```python
# backend/app/services/observation_service.py
from sqlalchemy.orm import Session
from app.models import Observation
from app.schemas.observation import ObservationCreate

class ObservationService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, persona_id: str, data: ObservationCreate) -> Observation:
        obs = Observation(persona_id=persona_id, **data.model_dump())
        self.db.add(obs)
        self.db.commit()
        self.db.refresh(obs)
        return obs

    def list_by_persona(self, persona_id: str) -> list[Observation]:
        return self.db.query(Observation).filter(
            Observation.persona_id == persona_id
        ).order_by(Observation.created_at.desc()).all()

    def delete(self, obs_id: str) -> bool:
        obs = self.db.query(Observation).filter(Observation.id == obs_id).first()
        if not obs:
            return False
        self.db.delete(obs)
        self.db.commit()
        return True
```

```python
# backend/app/api/v1/observations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.observation import ObservationCreate, ObservationRead
from app.services.observation_service import ObservationService

router = APIRouter(prefix="/personas/{persona_id}/observations", tags=["observations"])

@router.post("", response_model=ObservationRead, status_code=status.HTTP_201_CREATED)
def create_observation(persona_id: str, data: ObservationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ObservationService(db).create(persona_id, data)

@router.get("", response_model=list[ObservationRead])
def list_observations(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ObservationService(db).list_by_persona(persona_id)

@router.delete("/{obs_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation(persona_id: str, obs_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not ObservationService(db).delete(obs_id):
        raise HTTPException(status_code=404, detail="Observation not found")
```

- [ ] **Step 4: 验证所有新 API 端点**

```bash
# 创建关系
curl -X POST http://localhost:8000/api/v1/relationships \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source_persona_id":"<father_id>","target_persona_id":"<mother_id>","relationship_type":"spouse"}'

# 创建事件
curl -X POST http://localhost:8000/api/v1/personas/$PERSONA_ID/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"生日","event_type":"birthday","event_date":"2026-08-15","is_recurring":true,"importance":10}'

# 创建观察
curl -X POST http://localhost:8000/api/v1/personas/$PERSONA_ID/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"今天陪妈妈逛街，她一直在看空气炸锅","source_type":"manual"}'
```

- [ ] **Step 5: 提交**

```bash
git add backend/app/services/ backend/app/api/v1/
git commit -m "feat: add Relationship, Event, Observation CRUD APIs"
```

---

### Task 12: React 前端脚手架

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/services/auth.ts`

- [ ] **Step 1: 用 Vite 创建 React + TypeScript 项目**

```bash
cd "D:\AIcode\新建文件夹"
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
npm install axios react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: 配置 Tailwind CSS**

```js
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

- [ ] **Step 3: 创建 TypeScript 类型定义**

```typescript
// frontend/src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  relationship: string;
  birthdate: string | null;
  description: string;
  personality: string;
  interests: string;
  gift_ideas: string;
}

export interface PersonaMemory {
  id: string;
  persona_id: string;
  category: string;
  content: string;
  keywords: string;
  importance: number;
}

export interface Relationship {
  id: string;
  source_persona_id: string;
  target_persona_id: string;
  relationship_type: string;
  strength_score: number;
}

export interface PersonaEvent {
  id: string;
  persona_id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  is_recurring: boolean;
  importance: number;
}

export interface Observation {
  id: string;
  persona_id: string;
  content: string;
  source_type: string;
  confidence: number;
}

export interface PersonaInsight {
  id: string;
  persona_id: string;
  summary: string;
  personality: string;
  interests: string;
  gift_suggestions: string;
  health_score: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  persona_id: string | null;
  title: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent: string | null;
}
```

- [ ] **Step 4: 创建 API 服务层**

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// frontend/src/services/auth.ts
import api from './api';
import type { User } from '../types';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginData): Promise<void> {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.access_token);
  },

  async register(data: RegisterData): Promise<User> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
```

- [ ] **Step 5: 创建 App.tsx 入口**

```tsx
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/" element={<ProtectedRoute><div>Home</div></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 6: 验证前端启动**

```bash
cd frontend && npm run dev
```

Expected: `http://localhost:5173` 可见页面，API 代理到 `http://localhost:8000`

- [ ] **Step 7: 提交**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, axios, react-router"
```

---

## Sprint 1 完成检查点

Sprint 1 完成后，你将拥有：

- [x] FastAPI 项目脚手架 + 健康检查端点
- [x] 11 张数据库模型（SQLAlchemy ORM）
- [x] Alembic 迁移系统
- [x] JWT 注册/登录 API
- [x] Persona CRUD API（含 Service 层）
- [x] Memory CRUD API（含关键词搜索）
- [x] Relationship / Event / Observation CRUD API
- [x] React + Vite + Tailwind 前端脚手架
- [x] API 代理 + JWT 拦截器 + 类型定义

---

## Sprint 2 — AI 核心（概要）

### Task 13-18 待展开

任务概要：
- **Task 13**: LLM Adapter（claude/openai/gemini 抽象层）
- **Task 14**: 聊天 API（创建会话 + 发送消息 + SSE 流式响应）
- **Task 15**: Agent Router（意图分类 + 路由到对应 Service）
- **Task 16**: 记忆提取 Pipeline（聊天 → LLM 提取 → 结构化存储 + 溯源）
- **Task 17**: Embedding 生成 + FAISS 索引（sentence-transformers + faiss-cpu）
- **Task 18**: RAG 问答（向量检索 → Top-K → LLM 生成）

## Sprint 3 — 用户可见价值（概要）

### Task 19-24 待展开

任务概要：
- **Task 19**: Persona Switcher 组件
- **Task 20**: Dashboard 页面（统计卡片 + 近期动态）
- **Task 21**: AI 人物卡展示页
- **Task 22**: 时间线组件
- **Task 23**: 上下文聊天界面
- **Task 24**: 登录/注册页面

## Sprint 4 — 产品亮点（概要）

### Task 25-28 待展开

任务概要：
- **Task 25**: AI Briefing 生成 + 展示
- **Task 26**: 智能提醒系统（多级 + 记忆增强）
- **Task 27**: 礼物/行动推荐
- **Task 28**: 通知中心 + SSE 推送

## Sprint 5 — 高级能力（概要）

### Task 29-33 待展开

任务概要：
- **Task 29**: Relationship Graph 可视化（D3.js/React Flow）
- **Task 30**: Health Score 计算 + 展示
- **Task 31**: Planner Agent（多步规划链）
- **Task 32**: Observation → Memory 推理 Pipeline
- **Task 33**: 前端全局状态管理 + 性能优化

---

*计划版本：1.0 | Sprint 1 已详细展开，Sprint 2-5 概要待执行时细化*
