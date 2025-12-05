"""
Cloud LLM Engine - Delegates to OpenRouter Engine with local LLM fallback.
Maintains backward compatibility with existing code.
"""
import logging
from typing import Any, Dict, List

# Import OpenRouter engine functions
from app.ai_engines.openrouter_engine import (
    generate_questions_from_profile,
    evaluate_answer as openrouter_evaluate_answer,
    improve_answer as openrouter_improve_answer,
    generate_final_report,
    generate_interviewer_response as openrouter_generate_interviewer_response
)

# Import local LLM engine functions for fallback
from app.ai_engines.local_llm_engine import (
    generate_questions_from_profile as local_generate_questions,
    evaluate_answer as local_evaluate_answer,
    improve_answer as local_improve_answer,
    generate_interviewer_response as local_generate_interviewer_response
)

# Set up logger
logger = logging.getLogger(__name__)


def generate_questions(profile: Dict[str, Any], interview_type: str, persona: str = "male", round_name: str = "round1") -> List[Dict[str, Any]]:
    """
    Generate 6-7 interview questions using OpenRouter with local fallback.
    Tries OpenRouter first, falls back to local LLM if it fails.
    """
    try:
        logger.info("Attempting to generate questions using OpenRouter")
        questions = generate_questions_from_profile(profile, persona, interview_type)

        # Ensure backward compatibility - add missing fields if needed
        for q in questions:
            if "followups" not in q:
                q["followups"] = ""
            if "type" not in q:
                q["type"] = interview_type
            if "expected_keywords" not in q:
                q["expected_keywords"] = []
            if "expected_length" not in q:
                q["expected_length"] = "medium"

        logger.info(f"Successfully generated {len(questions)} questions using OpenRouter")
        return questions

    except Exception as e:
        logger.warning(f"OpenRouter failed for question generation: {e}. Falling back to local LLM.")
        try:
            questions = local_generate_questions(profile, persona, interview_type)

            # Ensure backward compatibility - add missing fields if needed
            for q in questions:
                if "followups" not in q:
                    q["followups"] = ""
                if "type" not in q:
                    q["type"] = interview_type
                if "expected_keywords" not in q:
                    q["expected_keywords"] = []
                if "expected_length" not in q:
                    q["expected_length"] = "medium"

            logger.info(f"Successfully generated {len(questions)} questions using local fallback")
            return questions

        except Exception as fallback_e:
            logger.error(f"Both OpenRouter and local fallback failed for question generation: {fallback_e}")
            # Return minimal fallback questions
            return [
                {
                    "id": "q1",
                    "text": "Tell me about yourself and your background.",
                    "followups": "Can you elaborate?",
                    "type": interview_type,
                    "difficulty": "easy",
                    "expected_keywords": ["experience", "background", "skills"],
                    "expected_length": "medium"
                },
                {
                    "id": "q2",
                    "text": "Describe a challenging project you worked on.",
                    "followups": "What was the outcome?",
                    "type": interview_type,
                    "difficulty": "medium",
                    "expected_keywords": ["project", "challenge", "solution", "technologies"],
                    "expected_length": "long"
                }
            ]


def evaluate_answer(question: str, answer: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate answer using OpenRouter with local fallback.
    Tries OpenRouter first, falls back to local LLM if it fails.
    """
    # Extract expected_keywords from question if available
    expected_keywords = []
    question_text = ""

    if isinstance(question, dict):
        expected_keywords = question.get("expected_keywords", [])
        question_text = question.get("text", question.get("question", str(question)))
    else:
        question_text = str(question)

    try:
        logger.info("Attempting to evaluate answer using OpenRouter")
        result = openrouter_evaluate_answer(question_text, answer, expected_keywords, profile)
        logger.info("Successfully evaluated answer using OpenRouter")
        return result

    except Exception as e:
        logger.warning(f"OpenRouter failed for answer evaluation: {e}. Falling back to local LLM.")
        try:
            result = local_evaluate_answer(question_text, answer, expected_keywords, profile)
            logger.info("Successfully evaluated answer using local fallback")

            # Ensure backward compatibility - map fields
            if "notes" not in result and "short_notes" in result:
                result["notes"] = result["short_notes"]
            # Add relevance as notes if not present (for backward compatibility)
            if "relevance" in result and "notes" not in result:
                result["notes"] = result.get("short_notes", f"Relevance score: {result['relevance']}")

            return result

        except Exception as fallback_e:
            logger.error(f"Both OpenRouter and local fallback failed for answer evaluation: {fallback_e}")
            # Return minimal fallback evaluation
            return {
                "technical": 70,
                "communication": 70,
                "confidence": 65,
                "relevance": 70,
                "short_notes": "Evaluation using fallback system.",
                "notes": "Evaluation using fallback system."
            }


def improve_answer(question: str, answer: str, profile: Dict[str, Any]) -> str:
    """
    Improve answer using OpenRouter with local fallback.
    Tries OpenRouter first, falls back to local LLM if it fails.
    """
    if isinstance(question, dict):
        question_text = question.get("text", question.get("question", str(question)))
    else:
        question_text = str(question)

    try:
        logger.info("Attempting to improve answer using OpenRouter")
        result = openrouter_improve_answer(question_text, answer, profile)
        logger.info("Successfully improved answer using OpenRouter")
        return result

    except Exception as e:
        logger.warning(f"OpenRouter failed for answer improvement: {e}. Falling back to local LLM.")
        try:
            result = local_improve_answer(question_text, answer, profile)
            logger.info("Successfully improved answer using local fallback")
            return result

        except Exception as fallback_e:
            logger.error(f"Both OpenRouter and local fallback failed for answer improvement: {fallback_e}")
            # Return minimal fallback improvement
            return f"Consider providing more specific examples and metrics in your answer. Original answer: {answer}"


def generate_interviewer_response(question: str, candidate_answer: str, conversation_history: list = None) -> str:
    """
    Generate interviewer response using OpenRouter with local fallback.
    Tries OpenRouter first, falls back to local LLM if it fails.
    """
    try:
        logger.info("Attempting to generate interviewer response using OpenRouter")
        result = openrouter_generate_interviewer_response(question, candidate_answer, conversation_history)
        logger.info("Successfully generated interviewer response using OpenRouter")
        return result

    except Exception as e:
        logger.warning(f"OpenRouter failed for interviewer response generation: {e}. Falling back to local LLM.")
        try:
            result = local_generate_interviewer_response(question, candidate_answer, conversation_history)
            logger.info("Successfully generated interviewer response using local fallback")
            return result

        except Exception as fallback_e:
            logger.error(f"Both OpenRouter and local fallback failed for interviewer response generation: {fallback_e}")
            # Return minimal fallback response
            return "Thank you for your answer. Let's continue with the next question."


