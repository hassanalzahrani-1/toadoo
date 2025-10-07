"""Application configuration using Pydantic settings."""
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./toadoo.db"
    
    # JWT Authentication
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Generate random key if not set
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email (mock for Phase 2)
    EMAIL_ENABLED: bool = False
    EMAIL_FROM: str = "noreply@toadoo.app"
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_EXPIRE_HOURS: int = 1
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_API: str = "100/minute"
    
    # Application
    APP_TITLE: str = "Toadoo API"
    APP_DESCRIPTION: str = "Enhanced FastAPI todo management with authentication and user management"
    APP_VERSION: str = "2.0.0"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
