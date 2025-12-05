# backend/app/services/question_service.py
from sqlalchemy.orm import Session
import random
from app.models.interview import Interview
from app.constants import QUESTION_BANK, Roles, InterviewType
from app.services.llm import llm_service

# Global question service instance
question_service = None

def get_question_service(db: Session = None):
    """Get or create global question service instance"""
    global question_service
    if question_service is None:
        question_service = QuestionService(db)
    return question_service

class QuestionService:
    def __init__(self, db: Session):
        self.db = db

    def get_questions_for_interview(self, role, interview_type, count: int = 5):
        """Generate questions for a new interview"""
        try:
            # Use LLM to generate dynamic questions
            questions = self._generate_dynamic_questions(role, interview_type, count)
            return questions
        except Exception as e:
            print(f"Error generating dynamic questions: {e}")
            # Fallback to static questions
            return self._get_static_questions(role, interview_type, count)

    def _generate_dynamic_questions(self, role, interview_type, count: int):
        """Generate questions using Mistral 7B"""
        role_name = role.value if hasattr(role, 'value') else str(role)
        interview_type_name = interview_type.value if hasattr(interview_type, 'value') else str(interview_type)

        prompt = f"""Generate {count} high-quality interview questions for a {role_name} position in a {interview_type_name} interview.

Requirements:
- Questions should be relevant to {role_name} responsibilities
- Mix of technical and behavioral questions appropriate for the role
- Questions should be clear and professional
- Each question should be on a new line
- Focus on practical skills and experience

Generate exactly {count} questions:"""

        try:
            inputs = llm_service.tokenizer(prompt, return_tensors="pt").to(llm_service.device)
            with llm_service.model.no_grad():
                outputs = llm_service.model.generate(
                    **inputs,
                    max_new_tokens=500,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=llm_service.tokenizer.eos_token_id,
                    eos_token_id=llm_service.tokenizer.eos_token_id
                )

            response = llm_service.tokenizer.decode(outputs[0], skip_special_tokens=True)
            questions_text = response.split("Generate exactly")[1].strip()

            # Parse questions
            questions = []
            for line in questions_text.split('\n'):
                line = line.strip()
                if line and not line.startswith(('Generate', 'Requirements', '-')):
                    # Remove numbering if present
                    line = line.lstrip('0123456789. ')
                    if line:
                        questions.append(line)

            # Ensure we have the right number of questions
            if len(questions) >= count:
                return questions[:count]
            else:
                # Pad with static questions if needed
                static_questions = self._get_static_questions(role, interview_type, count - len(questions))
                return questions + static_questions

        except Exception as e:
            print(f"LLM question generation failed: {e}")
            return self._get_static_questions(role, interview_type, count)

    def _get_static_questions(self, role, interview_type, count: int):
        """Fallback to static questions from QUESTION_BANK"""
        role_enum = role if isinstance(role, Roles) else Roles(role)
        interview_type_enum = interview_type if isinstance(interview_type, InterviewType) else InterviewType(interview_type)

        role_questions = QUESTION_BANK.get(role_enum, QUESTION_BANK[Roles.SOFTWARE_ENGINEER])

        if interview_type_enum == InterviewType.TECHNICAL:
            question_pool = role_questions[InterviewType.TECHNICAL]
        elif interview_type_enum == InterviewType.BEHAVIORAL:
            question_pool = role_questions[InterviewType.BEHAVIORAL]
        else:  # MIXED
            tech_questions = role_questions[InterviewType.TECHNICAL]
            behavioral_questions = role_questions[InterviewType.BEHAVIORAL]
            question_pool = tech_questions + behavioral_questions

        # Randomly select questions
        selected_questions = random.sample(question_pool, min(count, len(question_pool)))

        # Pad if needed
        while len(selected_questions) < count:
            selected_questions.extend(random.sample(question_pool, min(count - len(selected_questions), len(question_pool))))

        return selected_questions[:count]

    def get_next_question(self, questions_list: list, current_index: int):
        """Get next question from pre-generated list"""
        if current_index < len(questions_list):
            return questions_list[current_index]
        else:
            # If we've exhausted the list, return a generic follow-up question
            return "Can you elaborate on your previous answer or tell me about a challenging project you've worked on?"

    def get_next_question_old(self, session_id: str):
        """Legacy method - Get the next question for the interview session"""
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
