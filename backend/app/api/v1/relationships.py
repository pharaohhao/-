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
