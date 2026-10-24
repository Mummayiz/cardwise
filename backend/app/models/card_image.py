from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.sql import func

from app.db.database import Base


class CardImage(Base):
    """Private, compressed source image stored with its durable contact record."""

    __tablename__ = "business_card_images"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(
        Integer,
        ForeignKey("business_cards.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content_type = Column(String(100), nullable=False, default="image/jpeg")
    image_data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
