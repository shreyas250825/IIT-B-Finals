# backend/app/middleware/cors.py
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

def setup_cors(app):
    """Setup CORS middleware"""
    settings = get_settings()
    
    origins = [
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "https://your-frontend.vercel.app",  # Your Vercel frontend
        settings.FRONTEND_URL
    ]
    
    # Remove None values
    origins = [origin for origin in origins if origin]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )