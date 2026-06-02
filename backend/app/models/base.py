# backend/app/models/base.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, TypeDecorator
from sqlalchemy.orm import DeclarativeBase


def generate_uuid():
    return str(uuid.uuid4())


class UUIDChar(TypeDecorator):
    """数据库无关的 UUID 字符串类型，自动适配不同数据库后端"""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return str(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return value


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
