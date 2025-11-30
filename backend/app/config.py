# backend/app/config.py
from pydantic import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Mock Interview Simulator"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite:///./interview.db"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # AI Models
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

def get_settings():
    return Settings()