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
