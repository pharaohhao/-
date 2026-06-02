from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.personas import router as personas_router
from app.api.v1.memories import router as memories_router
from app.api.v1.relationships import router as relationships_router
from app.api.v1.events import router as events_router
from app.api.v1.observations import router as observations_router
from app.api.v1.chat import router as chat_router
from app.api.v1.insights import router as insights_router
from app.api.v1.timeline import router as timeline_router
from app.api.v1.graph import router as graph_router
from app.api.v1.snapshot import router as snapshot_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(personas_router)
api_router.include_router(memories_router)
api_router.include_router(relationships_router)
api_router.include_router(events_router)
api_router.include_router(observations_router)
api_router.include_router(chat_router)
api_router.include_router(insights_router)
api_router.include_router(timeline_router)
api_router.include_router(graph_router)
api_router.include_router(snapshot_router)
