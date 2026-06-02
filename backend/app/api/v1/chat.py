"""Chat API — Persona Context RAG 对话"""
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.chat.schemas.chat import ChatRequest, ChatResponse
from app.chat.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Persona Context Chat — 基于人物记忆的 RAG 问答"""
    svc = ChatService(db)
    return await svc.ask(data.persona_id, data.message)


@router.post("/stream")
async def chat_stream(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """流式 Persona Context Chat"""
    svc = ChatService(db)

    async def generate():
        async for chunk in svc.ask_stream(data.persona_id, data.message):
            yield f"data: {json.dumps({'chunk': chunk}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
