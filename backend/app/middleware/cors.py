# backend/app/middleware/cors.py
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

def setup_cors(app):
    """Setup CORS middleware"""
    settings = get_settings()

    # Parse FRONTEND_URL which can be comma-separated
    configured_origins = [origin.strip() for origin in settings.FRONTEND_URL.split(",")]

    origins = [
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # React dev server (alternative port)
        "http://127.0.0.1:3001",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "https://intervize.vercel.app",  # Production frontend
        "https://intervize.vercel.app/", # Production frontend with trailing slash
    ] + configured_origins

    # Remove duplicates and None values
    origins = list(set([origin for origin in origins if origin]))
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )