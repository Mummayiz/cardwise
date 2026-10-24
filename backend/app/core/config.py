from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Business Card Manager"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/business_cards"

    # JWT Auth
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    EXPORT_DIR: str = "private_exports"
    MAX_FILE_SIZE_MB: int = 10

    # Browser origins allowed to call the API (comma-separated)
    CORS_ORIGINS: str = ""

    # OCR
    OCR_LANGUAGE: str = "en"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
