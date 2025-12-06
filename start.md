# Quick Start Guide for AI Mock Interview Simulator

This guide provides the essential commands to set up and run the AI Mock Interview Simulator project.

## Prerequisites
- Python 3.8+
- Node.js 16+
- Docker and Docker Compose (optional, for containerized setup)
- Git

## Development Setup

### 1. Clone and Navigate to Project
```bash
git clone <repository-url>
cd ai-mock-interview-simulator
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database tables
python create_tables.py

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup (in a new terminal)
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 4. Chrome Extension Setup (Required for Video/Camera)
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `chrome-extension` folder
4. Note the extension ID from the extension card
5. Update the `extensionId` in `frontend/src/hooks/useWebcam.ts` with the actual ID

### 5. Alternative: Docker Setup
```bash
# Using Docker Compose (recommended for full setup)
docker-compose -f docker-compose.dev.yml up --build

# Or for production
docker-compose -f docker-compose.prod.yml up --build
```

## Accessing the Application
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs (Swagger UI)

## Environment Configuration
- Copy `.env.example` to `.env` in the backend directory
- Set up API keys for AI services (OpenAI, OpenRouter, etc.)
- Configure database connection if not using SQLite

## Testing
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting
- Ensure all prerequisites are installed
- Check that ports 8000 and 5173 are available
- Verify Chrome extension is loaded for video features
- Check logs in `backend/logs/` for backend issues
