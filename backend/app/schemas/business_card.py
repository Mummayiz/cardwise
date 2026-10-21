from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class BusinessCardBase(BaseModel):
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    notes: Optional[str] = None
    extra_fields: Optional[Dict[str, Any]] = {}


class BusinessCardCreate(BusinessCardBase):
    pass


class BusinessCardUpdate(BusinessCardBase):
    pass


class BusinessCardResponse(BusinessCardBase):
    id: int
    owner_id: int
    image_path: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    ocr_confidence: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    pass


class GroupResponse(GroupBase):
    id: int
    owner_id: int
    created_at: datetime
    cards: Optional[List[BusinessCardResponse]] = []

    class Config:
        from_attributes = True


class OCRResult(BaseModel):
    raw_text: str
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    confidence: Optional[str] = None
