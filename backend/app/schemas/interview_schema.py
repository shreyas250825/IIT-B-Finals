# backend/app/schemas/interview_schema.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.constants import InterviewType, InterviewRound, Roles

class InterviewCreate(BaseModel):
    role: Roles
    interview_type: InterviewType
    round_type: InterviewRound
    resume_data: Optional[Dict[str, Any]] = None

class InterviewResponse(BaseModel):
    id: int
    session_id: str
    role: str
    interview_type: str
    round_type: str
    current_question_index: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    question: str
    question_index: int
    session_id: str