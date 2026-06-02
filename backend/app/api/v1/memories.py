from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryRead
from app.services.memory_service import MemoryService

router = APIRouter(prefix="/personas/{persona_id}/memories", tags=["memories"])


@router.post("", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
def create_memory(persona_id: str, data: MemoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MemoryService(db).create(persona_id, data)


@router.get("", response_model=list[MemoryRead])
def list_memories(persona_id: str, query: str | None = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if query:
        return MemoryService(db).search(persona_id, query)
    return MemoryService(db).list_by_persona(persona_id)


@router.put("/{memory_id}", response_model=MemoryRead)
def update_memory(persona_id: str, memory_id: str, data: MemoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memory = MemoryService(db).update(memory_id, data)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(persona_id: str, memory_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not MemoryService(db).delete(memory_id):
        raise HTTPException(status_code=404, detail="Memory not found")
