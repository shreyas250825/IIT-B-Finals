"""
Cloud LLM Engine - Delegates to OpenRouter Engine.
Maintains backward compatibility with existing code.
"""
from typing import Any, Dict, List

# Import OpenRouter engine functions
from app.ai_engines.openrouter_engine import (
    generate_questions_from_profile,
    evaluate_answer as openrouter_evaluate_answer,
    improve_answer as openrouter_improve_answer,
    generate_final_report
)


def generate_questions(profile: Dict[str, Any], interview_type: str, persona: str = "male", round_name: str = "round1") -> List[Dict[str, Any]]:
    """
    Generate 6-7 interview questions using OpenRouter.
    Delegates to openrouter_engine.generate_questions_from_profile
    """
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
    
    return questions


def evaluate_answer(question: str, answer: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate answer using OpenRouter.
    Delegates to openrouter_engine.evaluate_answer
    """
    # Extract expected_keywords from question if available
    expected_keywords = []
    question_text = ""
    
    if isinstance(question, dict):
        expected_keywords = question.get("expected_keywords", [])
        question_text = question.get("text", question.get("question", str(question)))
    else:
        question_text = str(question)
    
    result = openrouter_evaluate_answer(question_text, answer, expected_keywords, profile)
    
    # Ensure backward compatibility - map fields
    if "notes" not in result and "short_notes" in result:
        result["notes"] = result["short_notes"]
    # Add relevance as notes if not present (for backward compatibility)
    if "relevance" in result and "notes" not in result:
        result["notes"] = result.get("short_notes", f"Relevance score: {result['relevance']}")
    
    return result


def improve_answer(question: str, answer: str, profile: Dict[str, Any]) -> str:
    """
    Improve answer using OpenRouter.
    Delegates to openrouter_engine.improve_answer
    """
    if isinstance(question, dict):
        question_text = question.get("text", question.get("question", str(question)))
    else:
        question_text = str(question)
    
    return openrouter_improve_answer(question_text, answer, profile)


