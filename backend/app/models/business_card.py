from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class BusinessCard(Base):
    __tablename__ = "business_cards"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Contact info
    full_name = Column(String, index=True)
    job_title = Column(String)
    company = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    website = Column(String)
    address = Column(Text)
    linkedin = Column(String)
    twitter = Column(String)

    # Card image & OCR
    image_path = Column(String)
    raw_ocr_text = Column(Text)
    ocr_confidence = Column(String)

    # Extra fields as JSON
    extra_fields = Column(JSON, default={})

    # Notes
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="business_cards")
    groups = relationship("Group", secondary="card_groups", back_populates="cards")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="groups")
    cards = relationship("BusinessCard", secondary="card_groups", back_populates="groups")


class CardGroup(Base):
    __tablename__ = "card_groups"

    card_id = Column(Integer, ForeignKey("business_cards.id"), primary_key=True)
    group_id = Column(Integer, ForeignKey("groups.id"), primary_key=True)
