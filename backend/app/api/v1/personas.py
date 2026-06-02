from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaRead
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/personas", tags=["personas"])


@router.post("", response_model=PersonaRead, status_code=status.HTTP_201_CREATED)
def create_persona(data: PersonaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PersonaService(db).create(current_user.id, data)


@router.get("", response_model=list[PersonaRead])
def list_personas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PersonaService(db).list_by_user(current_user.id)


@router.get("/{persona_id}", response_model=PersonaRead)
def get_persona(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = PersonaService(db).get_by_id(persona_id, current_user.id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


@router.put("/{persona_id}", response_model=PersonaRead)
def update_persona(persona_id: str, data: PersonaUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    persona = PersonaService(db).update(persona_id, current_user.id, data)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(persona_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not PersonaService(db).delete(persona_id, current_user.id):
        raise HTTPException(status_code=404, detail="Persona not found")
