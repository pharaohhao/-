# backend/app/models/__init__.py
from app.models.base import Base, TimestampMixin, generate_uuid
from app.models.user import User
from app.models.persona import Persona
