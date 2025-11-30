# backend/app/routes/resume_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import aiofiles
import os

from app.database import get_db
from app.services.resume_service import ResumeService

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse a resume file"""
    try:
        # Validate file type
        allowed_types = ['.pdf', '.docx', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_types:
            raise HTTPException(400, "File type not supported")
        
        # Save file
        file_path = f"data/uploads/{file.filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Parse resume
        resume_service = ResumeService(db)
        parsed_data = resume_service.parse_resume(file_path)
        
        return {
            "success": True,
            "file_name": file.filename,
            "parsed_data": parsed_data
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to process resume: {str(e)}")