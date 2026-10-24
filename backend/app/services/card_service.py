from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.business_card import BusinessCard, Group
from app.schemas.business_card import BusinessCardCreate, BusinessCardUpdate, GroupCreate, GroupUpdate
from app.exports.workbook import refresh_master_workbook
from app.models.card_image import CardImage
from app.services.image_service import compress_card_image


# ── Business Card CRUD ──────────────────────────────────────────────────────

def create_card(
    db: Session,
    card_data: BusinessCardCreate,
    owner_id: int,
    image_bytes: Optional[bytes] = None,
) -> BusinessCard:
    card = BusinessCard(**card_data.model_dump(), owner_id=owner_id)
    db.add(card)
    if image_bytes is not None:
        db.flush()
        image = CardImage(
            card_id=card.id,
            owner_id=owner_id,
            content_type="image/jpeg",
            image_data=compress_card_image(image_bytes),
        )
        db.add(image)
        db.flush()
        card.image_path = f"db:{image.id}"
    db.commit()
    db.refresh(card)
    refresh_master_workbook(db, owner_id)
    return card


def get_card(db: Session, card_id: int, owner_id: int) -> BusinessCard:
    card = db.query(BusinessCard).filter(
        BusinessCard.id == card_id,
        BusinessCard.owner_id == owner_id
    ).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return card


def get_all_cards(
    db: Session,
    owner_id: int,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
) -> List[BusinessCard]:
    query = db.query(BusinessCard).filter(BusinessCard.owner_id == owner_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            BusinessCard.full_name.ilike(term) |
            BusinessCard.company.ilike(term) |
            BusinessCard.email.ilike(term)
        )
    return query.offset(skip).limit(limit).all()


def update_card(
    db: Session,
    card_id: int,
    owner_id: int,
    card_data: BusinessCardUpdate
) -> BusinessCard:
    card = get_card(db, card_id, owner_id)
    for field, value in card_data.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    refresh_master_workbook(db, owner_id)
    return card


def delete_card(db: Session, card_id: int, owner_id: int) -> None:
    card = get_card(db, card_id, owner_id)
    db.delete(card)
    db.commit()
    refresh_master_workbook(db, owner_id)


# ── Group CRUD ───────────────────────────────────────────────────────────────

def create_group(db: Session, group_data: GroupCreate, owner_id: int) -> Group:
    group = Group(**group_data.model_dump(), owner_id=owner_id)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def get_all_groups(db: Session, owner_id: int) -> List[Group]:
    return db.query(Group).filter(Group.owner_id == owner_id).all()


def get_group(db: Session, group_id: int, owner_id: int) -> Group:
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.owner_id == owner_id
    ).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group


def update_group(
    db: Session,
    group_id: int,
    owner_id: int,
    group_data: GroupUpdate
) -> Group:
    group = get_group(db, group_id, owner_id)
    for field, value in group_data.model_dump(exclude_unset=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group_id: int, owner_id: int) -> None:
    group = get_group(db, group_id, owner_id)
    db.delete(group)
    db.commit()


def add_card_to_group(db: Session, group_id: int, card_id: int, owner_id: int) -> Group:
    group = get_group(db, group_id, owner_id)
    card = get_card(db, card_id, owner_id)
    if card not in group.cards:
        group.cards.append(card)
        db.commit()
        db.refresh(group)
    return group


def remove_card_from_group(db: Session, group_id: int, card_id: int, owner_id: int) -> Group:
    group = get_group(db, group_id, owner_id)
    card = get_card(db, card_id, owner_id)
    if card in group.cards:
        group.cards.remove(card)
        db.commit()
        db.refresh(group)
    return group
