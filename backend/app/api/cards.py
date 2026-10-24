from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.business_card import (
    BusinessCardCreate, BusinessCardUpdate,
    BusinessCardResponse, OCRResult
)
from app.services import card_service
from app.ocr.ocr_engine import extract_text_from_image
from app.ocr.card_parser import parse_card
import os, shutil, uuid
from pathlib import Path
from app.core.config import settings

router = APIRouter(prefix="/cards", tags=["Business Cards"])


@router.post("/scan", response_model=OCRResult)
async def scan_card(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    image_bytes = await file.read()
    raw_text, confidence = extract_text_from_image(image_bytes)
    return parse_card(raw_text, confidence)


@router.post("/", response_model=BusinessCardResponse, status_code=201)
async def create_card(
    card_data: BusinessCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return card_service.create_card(db, card_data, current_user.id)


@router.post("/upload", response_model=BusinessCardResponse, status_code=201)
async def upload_and_create_card(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Save image
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[-1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    image_bytes = await file.read()
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    # OCR + parse
    raw_text, confidence = extract_text_from_image(image_bytes)
    ocr_result = parse_card(raw_text, confidence)

    # Save card
    from app.schemas.business_card import BusinessCardCreate
    card_data = BusinessCardCreate(
        full_name=ocr_result.full_name,
        job_title=ocr_result.job_title,
        company=ocr_result.company,
        email=ocr_result.email,
        phone=ocr_result.phone,
        website=ocr_result.website,
        linkedin=ocr_result.linkedin,
        twitter=ocr_result.twitter,
    )
    card = card_service.create_card(db, card_data, current_user.id)
    card.image_path = filename
    card.raw_ocr_text = raw_text
    card.ocr_confidence = ocr_result.confidence
    db.commit()
    db.refresh(card)
    return card


@router.get("/{card_id}/image")
def get_card_image(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    card = card_service.get_card(db, card_id, current_user.id)
    if not card.image_path:
        raise HTTPException(status_code=404, detail="Card image not found")

    upload_root = Path(settings.UPLOAD_DIR).resolve()
    stored_path = Path(card.image_path)
    image_path = stored_path if stored_path.is_absolute() else upload_root / stored_path.name
    image_path = image_path.resolve()
    try:
        image_path.relative_to(upload_root)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Card image not found") from exc
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Card image not found")
    return FileResponse(image_path, filename=image_path.name)


@router.get("/", response_model=List[BusinessCardResponse])
def list_cards(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return card_service.get_all_cards(db, current_user.id, skip, limit, search)


@router.get("/{card_id}", response_model=BusinessCardResponse)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return card_service.get_card(db, card_id, current_user.id)


@router.put("/{card_id}", response_model=BusinessCardResponse)
def update_card(
    card_id: int,
    card_data: BusinessCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return card_service.update_card(db, card_id, current_user.id, card_data)


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    card_service.delete_card(db, card_id, current_user.id)

