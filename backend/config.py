import os

class Settings:
    PROJECT_NAME: str = "SlideShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "slideshield-super-secret-jwt-key-2026-production-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./slideshield.db"
    )
    
    # Gemini AI API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Uploads directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(__file__), "uploads")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
