from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.business_card import GroupCreate, GroupUpdate, GroupResponse
from app.core.dependencies import get_current_active_user
from app.models.business_card import Group

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("/", response_model=List[GroupResponse])
def list_groups(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    return db.query(Group).filter(Group.owner_id == current_user.id).all()


@router.post("/", response_model=GroupResponse)
def create_group(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    group = Group(
        name=group_in.name,
        description=group_in.description,
        owner_id=current_user.id
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_in: GroupUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.owner_id == current_user.id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    for field, value in group_in.dict(exclude_unset=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.owner_id == current_user.id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}
