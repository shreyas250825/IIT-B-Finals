# backend/app/schemas/analysis_schema.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class AnswerSubmission(BaseModel):
    session_id: str
    question_index: int
    answer_text: str
    behavioral_metrics: Optional[Dict[str, Any]] = None  # From frontend analysis

class AnalysisResult(BaseModel):
    technical_score: float
    communication_score: float 
    confidence_score: float
    overall_score: float
    feedback: str
    detailed_analysis: Dict[str, Any]

class ReportResponse(BaseModel):
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    question_analysis: List[Dict[str, Any]]
    behavioral_insights: Dict[str, Any]
    improvement_suggestions: List[str]