# backend/app/routes/interview_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.interview_schema import InterviewCreate, InterviewResponse, QuestionResponse
from app.schemas.analysis_schema import AnswerSubmission, AnalysisResult
from app.services.interview_service import InterviewService
from app.services.question_service import QuestionService

router = APIRouter()

@router.post("/start", response_model=InterviewResponse)
async def start_interview(
    interview_data: InterviewCreate,
    db: Session = Depends(get_db)
):
    """Start a new interview session"""
    try:
        interview_service = InterviewService(db)
        interview = interview_service.create_interview(interview_data)
        return interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@router.get("/{session_id}/next-question", response_model=QuestionResponse)
async def get_next_question(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get the next question for the interview"""
    try:
        question_service = QuestionService(db)
        question_data = question_service.get_next_question(session_id)
        return question_data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/submit-answer", response_model=AnalysisResult)
async def submit_answer(
    answer_data: AnswerSubmission,
    db: Session = Depends(get_db)
):
    """Submit an answer and get analysis"""
    try:
        interview_service = InterviewService(db)
        analysis = interview_service.analyze_answer(answer_data)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze answer: {str(e)}")

@router.post("/{session_id}/complete")
async def complete_interview(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Mark interview as completed and generate final report"""
    try:
        interview_service = InterviewService(db)
        report = interview_service.complete_interview(session_id)
        return {"report_id": report.id, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))