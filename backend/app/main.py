# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routes import health_check, interview_routes, resume_routes, report_routes
from app.middleware.cors import setup_cors
from app.config import get_settings

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="AI Mock Interview Simulator API",
    description="Backend for AI-powered mock interview platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS middleware
setup_cors(app)

# Include routers
app.include_router(health_check.router, tags=["Health"])
app.include_router(interview_routes.router, prefix="/api/v1/interview", tags=["Interview"])
app.include_router(resume_routes.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(report_routes.router, prefix="/api/v1/reports", tags=["Reports"])



@app.get("/")
async def root():
    return {
        "message": "AI Mock Interview Simulator API",
        "status": "running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )