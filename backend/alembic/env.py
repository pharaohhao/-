import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.config import settings
from app.models.base import Base, UUIDChar

# Import all models so they register with Base.metadata
from app.models import *

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def render_item(type_, obj, autogen_context):
    """Custom type rendering for Alembic autogenerate."""
    if type_ == "type" and isinstance(obj, UUIDChar):
        autogen_context.imports.add("from app.models.base import UUIDChar")
        return "UUIDChar(length=36)"
    return False


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        render_item=render_item,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_item=render_item,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
