# backend/app/routes/interview_routes.py
from typing import Any, Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

from app.ai_engines.openrouter_engine import (
    generate_questions_from_profile,
    evaluate_answer,
    improve_answer,
    generate_final_report
)

router = APIRouter()


class StartReq(BaseModel):
  profile: Dict[str, Any]
  role: Optional[str] = None
  interview_type: Optional[str] = "mixed"
  persona: Optional[str] = "male"


class StartRes(BaseModel):
  session_id: str
  question: Dict[str, Any]


class AnswerReq(BaseModel):
  session_id: str
  question_id: str
  transcript: str
  metrics: Dict[str, Any]


class AnswerRes(BaseModel):
  evaluation: Dict[str, Any]
  improved: str
  next_question: Optional[Dict[str, Any]] = None


class MetricsReq(BaseModel):
  session_id: Optional[str] = None
  question_id: Optional[str] = None
  metrics: Dict[str, Any]


class ReportRes(BaseModel):
  session_id: str
  questions: List[Dict[str, Any]]
  evaluations: List[Dict[str, Any]]
  answers: List[Dict[str, Any]]
  summary: str
  interview_type: Optional[str] = None
  created_at: Optional[str] = None
  role: Optional[str] = None


class ReportListItem(BaseModel):
  session_id: str
  role: str
  interview_type: str
  created_at: str
  overall_score: float
  technical_score: float
  communication_score: float
  confidence_score: float
  questions_count: int


class ReportListRes(BaseModel):
  reports: List[ReportListItem]


SESSIONS: Dict[str, Dict[str, Any]] = {}


@router.post("/interview/start", response_model=StartRes)
def start(req: StartReq) -> StartRes:
  session_id = str(uuid.uuid4())

  # Use role from request or profile
  role = req.role or req.profile.get("role") or req.profile.get("estimated_role") or "Software Engineer"
  interview_type = req.interview_type or "mixed"
  persona = req.persona or "male"
  
  # Update profile with role
  profile = req.profile.copy()
  profile["role"] = role
  profile["interview_type"] = interview_type
  profile["persona"] = persona

  # Generate questions using OpenRouter engine
  questions = generate_questions_from_profile(
      profile=profile,
      persona=persona,
      interview_type=interview_type
  )

  SESSIONS[session_id] = {
    "profile": profile,
    "interview_type": interview_type,
    "persona": persona,
    "questions": questions,
    "answers": [],
    "evaluations": [],
    "current_question_index": 0,
    "created_at": datetime.utcnow().isoformat(),
    "role": role,
    "started_at": datetime.utcnow().isoformat(),
  }

  first = questions[0]
  return StartRes(session_id=session_id, question=first)


@router.post("/interview/answer", response_model=AnswerRes)
def answer(req: AnswerReq) -> AnswerRes:
  session = SESSIONS.get(req.session_id)
  if not session:
    raise HTTPException(status_code=404, detail="Session not found")

  # Find question object, text, and index
  question_obj = None
  question_text = ""
  idx = 0
  for i, q in enumerate(session["questions"]):
    if str(q.get("id")) == str(req.question_id):
      question_obj = q
      question_text = q.get("text") or q.get("question") or ""
      idx = i
      break
  
  # Get ideal answer and expected keywords from question
  ideal_answer = question_obj.get("ideal_answer", "")
  expected_keywords = question_obj.get("expected_keywords", [])

  # Evaluate answer using OpenRouter
  eval_res = evaluate_answer(
      question_text=question_text,
      transcript=req.transcript,
      expected_keywords=expected_keywords,
      profile=session.get("profile") or {},
      ideal_answer=ideal_answer
  )
  
  # Generate improved answer
  improved = improve_answer(
      question_text,
      req.transcript,
      session.get("profile") or {}
  )

  session["answers"].append(
    {
      "question_id": req.question_id,
      "question": question_text,
      "transcript": req.transcript,
      "metrics": req.metrics,
      "evaluation": eval_res,
      "improved": improved,
    }
  )
  session["evaluations"].append(eval_res)

  # Determine next question if available
  next_q: Optional[Dict[str, Any]] = None
  if idx + 1 < len(session["questions"]):
    next_q = session["questions"][idx + 1]

  return AnswerRes(evaluation=eval_res, improved=improved, next_question=next_q)


@router.post("/metrics")
def store_metrics(req: MetricsReq) -> Dict[str, str]:
  # Optional endpoint; we also store metrics in /answer.
  session = SESSIONS.get(req.session_id) if req.session_id else None
  if session:
    session.setdefault("extra_metrics", []).append(
      {"question_id": req.question_id, "metrics": req.metrics}
    )
  return {"status": "ok"}


@router.get("/interview/report/{session_id}", response_model=ReportRes)
def report(session_id: str) -> ReportRes:
  session = SESSIONS.get(session_id)
  if not session:
    raise HTTPException(status_code=404, detail="Session not found")

  evals: List[Dict[str, Any]] = session.get("evaluations", [])
  
  # Generate final report using OpenRouter
  try:
    report_data = generate_final_report(session)
    summary = report_data.get("overall_summary", "")
    if not summary:
      # Fallback to simple summary
      if evals:
        tech = sum(e.get("technical", 0) for e in evals) / len(evals)
        comm = sum(e.get("communication", 0) for e in evals) / len(evals)
        conf = sum(e.get("confidence", 0) for e in evals) / len(evals)
        summary = (
          f"Average technical score: {tech:.1f}. "
          f"Average communication score: {comm:.1f}. "
          f"Average confidence score: {conf:.1f}."
        )
      else:
        summary = "No answers recorded for this session."
  except Exception as e:
    print(f"Error generating final report: {e}")
    # Fallback to simple summary
    if evals:
      tech = sum(e.get("technical", 0) for e in evals) / len(evals)
      comm = sum(e.get("communication", 0) for e in evals) / len(evals)
      conf = sum(e.get("confidence", 0) for e in evals) / len(evals)
      summary = (
        f"Average technical score: {tech:.1f}. "
        f"Average communication score: {comm:.1f}. "
        f"Average confidence score: {conf:.1f}."
      )
    else:
      summary = "No answers recorded for this session."

  return ReportRes(
    session_id=session_id,
    questions=session.get("questions", []),
    evaluations=evals,
    answers=session.get("answers", []),
    summary=summary,
    interview_type=session.get("interview_type"),
    created_at=session.get("created_at"),
    role=session.get("role"),
  )


@router.get("/interview/reports", response_model=ReportListRes)
def list_reports() -> ReportListRes:
  """List all interview sessions with metadata"""
  reports = []
  
  for session_id, session in SESSIONS.items():
    evals = session.get("evaluations", [])
    
    if evals:
      tech = sum(e.get("technical", 0) for e in evals) / len(evals)
      comm = sum(e.get("communication", 0) for e in evals) / len(evals)
      conf = sum(e.get("confidence", 0) for e in evals) / len(evals)
      overall = (tech + comm + conf) / 3
    else:
      tech = comm = conf = overall = 0.0
    
    reports.append(ReportListItem(
      session_id=session_id,
      role=session.get("role", "Software Engineer"),
      interview_type=session.get("interview_type", "mixed"),
      created_at=session.get("created_at", datetime.utcnow().isoformat()),
      overall_score=overall,
      technical_score=tech,
      communication_score=comm,
      confidence_score=conf,
      questions_count=len(session.get("questions", []))
    ))
  
  # Sort by created_at descending (most recent first)
  reports.sort(key=lambda x: x.created_at, reverse=True)
  
  return ReportListRes(reports=reports)