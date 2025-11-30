# backend/app/services/question_service.py
from sqlalchemy.orm import Session
import random
from app.models.interview import Interview
from app.constants import QUESTION_BANK, Roles, InterviewType

class QuestionService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_next_question(self, session_id: str):
        """Get the next question for the interview session"""
        interview = self.db.query(Interview).filter(
            Interview.session_id == session_id
        ).first()
        
        if not interview:
            raise Exception("Interview session not found")
        
        # Get role-specific questions
        role_questions = QUESTION_BANK.get(
            Roles(interview.role), 
            QUESTION_BANK[Roles.SOFTWARE_ENGINEER]
        )
        
        # Determine question type based on interview type
        if interview.interview_type == InterviewType.TECHNICAL.value:
            question_pool = role_questions[InterviewType.TECHNICAL]
        elif interview.interview_type == InterviewType.BEHAVIORAL.value:
            question_pool = role_questions[InterviewType.BEHAVIORAL]
        else:  # MIXED
            # Alternate between technical and behavioral
            if interview.current_question_index % 2 == 0:
                question_pool = role_questions[InterviewType.TECHNICAL]
            else:
                question_pool = role_questions[InterviewType.BEHAVIORAL]
        
        # Filter out already asked questions
        asked_questions = interview.questions
        available_questions = [q for q in question_pool if q not in asked_questions]
        
        # If no more questions, reuse from asked questions
        if not available_questions:
            available_questions = question_pool
        
        # Select random question
        next_question = random.choice(available_questions)
        
        # Update interview with new question
        interview.questions.append(next_question)
        self.db.commit()
        
        return {
            "question": next_question,
            "question_index": interview.current_question_index,
            "session_id": session_id
        }