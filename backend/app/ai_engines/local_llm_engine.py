"""
Local LLM Engine - Fallback when OpenRouter is unavailable.
Uses simple rule-based responses for development and testing.
"""

import json
import random
from typing import Any, Dict, List, Optional


def call_local_llm(
    messages: List[Dict[str, str]],
    temperature: float = 0.0,
    max_tokens: int = 600,
    timeout: int = 30
) -> str:
    """
    Local LLM fallback - returns mock responses for development.

    Args:
        messages: List of message dicts with "role" and "content"
        temperature: Sampling temperature (ignored in local fallback)
        max_tokens: Maximum tokens to generate (ignored in local fallback)
        timeout: Request timeout in seconds (ignored in local fallback)

    Returns:
        Mock text response based on input patterns
    """
    if not messages:
        return ""

    # Get the last user message
    last_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            last_message = msg.get("content", "").lower()
            break

    # Simple pattern matching for different types of requests
    if "question" in last_message and ("generate" in last_message or "create" in last_message):
        return _generate_mock_questions()
    elif "evaluate" in last_message or "score" in last_message:
        return _generate_mock_evaluation()
    elif "improve" in last_message or "better" in last_message:
        return _generate_mock_improvement()
    elif "report" in last_message or "summary" in last_message:
        return _generate_mock_report()
    else:
        return _generate_mock_response()


def _generate_mock_questions() -> str:
    """Generate mock interview questions JSON."""
    questions = [
        {
            "id": "q1",
            "text": "Tell me about yourself and your background.",
            "followups": "Can you elaborate on your most recent role?",
            "type": "behavioral",
            "difficulty": "easy",
            "expected_keywords": ["experience", "background", "skills"],
            "expected_length": "medium"
        },
        {
            "id": "q2",
            "text": "Describe a challenging project you worked on.",
            "followups": "What was the outcome?",
            "type": "technical",
            "difficulty": "medium",
            "expected_keywords": ["project", "challenge", "solution", "technologies"],
            "expected_length": "long"
        },
        {
            "id": "q3",
            "text": "How do you handle tight deadlines and pressure?",
            "followups": "Give an example.",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["time management", "stress", "prioritization"],
            "expected_length": "medium"
        },
        {
            "id": "q4",
            "text": "What technical skills do you bring to this position?",
            "followups": "Which is your strongest?",
            "type": "technical",
            "difficulty": "medium",
            "expected_keywords": ["skills", "technologies", "expertise"],
            "expected_length": "medium"
        },
        {
            "id": "q5",
            "text": "Describe a time when you had to learn a new technology quickly.",
            "followups": "How did you approach it?",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["learning", "adaptation", "technology"],
            "expected_length": "medium"
        },
        {
            "id": "q6",
            "text": "How do you approach problem-solving in your work?",
            "followups": "Walk me through an example.",
            "type": "technical",
            "difficulty": "hard",
            "expected_keywords": ["problem-solving", "methodology", "analysis"],
            "expected_length": "long"
        },
        {
            "id": "q7",
            "text": "Why are you interested in this position?",
            "followups": "What excites you most?",
            "type": "behavioral",
            "difficulty": "easy",
            "expected_keywords": ["interest", "motivation", "goals"],
            "expected_length": "medium"
        }
    ]
    return json.dumps(questions)


def _generate_mock_evaluation() -> str:
    """Generate mock evaluation JSON."""
    evaluation = {
        "technical": random.randint(65, 85),
        "communication": random.randint(70, 90),
        "confidence": random.randint(60, 80),
        "relevance": random.randint(70, 85),
        "short_notes": "Good technical knowledge demonstrated. Consider providing more specific examples."
    }
    return json.dumps(evaluation)


def _generate_mock_improvement() -> str:
    """Generate mock improved answer."""
    improvements = [
        "I have 3 years of experience as a software engineer, specializing in Python and JavaScript development. In my most recent role at TechCorp, I led a team of 4 developers in building a real-time analytics dashboard that improved user engagement by 40%.",
        "When faced with a tight deadline, I prioritize tasks using the Eisenhower matrix, focusing first on high-impact, time-sensitive items. For example, during a critical product launch, I coordinated with cross-functional teams to deliver the project 2 days early.",
        "My strongest technical skills include React, Node.js, and cloud architecture. I recently implemented a microservices architecture that reduced system downtime by 60% and improved scalability.",
        "When learning new technologies, I start with official documentation, then build small projects to understand practical applications. For instance, I learned Docker in 2 weeks by containerizing our entire development environment."
    ]
    return random.choice(improvements)


def _generate_mock_report() -> str:
    """Generate mock final report JSON."""
    report = {
        "overall_summary": "Completed interview with solid technical knowledge and good communication skills. Shows promise but could benefit from more specific examples.",
        "technical_strengths": ["Good understanding of core concepts", "Demonstrated problem-solving approach"],
        "technical_gaps": ["Could provide more detailed technical examples", "Consider discussing system design more"],
        "communication_score": random.randint(75, 85),
        "behavioral_score": random.randint(70, 80),
        "improved_answers": [
            {"id": "q1", "improved": "Enhanced answer with specific metrics and achievements"},
            {"id": "q2", "improved": "Added more technical details and outcomes"}
        ],
        "recommendations": [
            "Practice using the STAR method for behavioral questions",
            "Prepare specific examples with metrics and outcomes",
            "Research the company and role thoroughly",
            "Focus on clear, concise communication"
        ]
    }
    return json.dumps(report)


def _generate_mock_response() -> str:
    """Generate generic mock response."""
    responses = [
        "Thank you for sharing that. Let's continue with the next question.",
        "That's interesting. Can you tell me more about your approach?",
        "Good point. How did you handle any challenges that arose?",
        "I appreciate you sharing that experience. What was the outcome?",
        "That's a solid foundation. Let's explore another aspect of your background."
    ]
    return random.choice(responses)


def generate_questions_from_profile(
    profile: Dict[str, Any],
    persona: str,
    interview_type: str
) -> List[Dict[str, Any]]:
    """
    Generate exactly 7 interview questions using local fallback.

    Returns list of question dicts with:
    id, text, followups, type, difficulty, expected_keywords, expected_length
    """
    print("🔄 Using local LLM fallback for question generation")

    # Parse mock questions JSON
    questions_json = _generate_mock_questions()
    try:
        questions = json.loads(questions_json)
        return questions
    except:
        # Fallback to hardcoded questions
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
            },
            {
                "id": "q3",
                "text": "How do you handle tight deadlines and pressure?",
                "followups": "Give an example.",
                "type": "behavioral",
                "difficulty": "medium",
                "expected_keywords": ["time management", "stress", "prioritization"],
                "expected_length": "medium"
            },
            {
                "id": "q4",
                "text": "What technical skills do you bring to this position?",
                "followups": "Which is your strongest?",
                "type": interview_type,
                "difficulty": "medium",
                "expected_keywords": ["skills", "technologies", "expertise"],
                "expected_length": "medium"
            },
            {
                "id": "q5",
                "text": "Describe a time when you had to learn a new technology quickly.",
                "followups": "How did you approach it?",
                "type": "behavioral",
                "difficulty": "medium",
                "expected_keywords": ["learning", "adaptation", "technology"],
                "expected_length": "medium"
            },
            {
                "id": "q6",
                "text": "How do you approach problem-solving in your work?",
                "followups": "Walk me through an example.",
                "type": interview_type,
                "difficulty": "hard",
                "expected_keywords": ["problem-solving", "methodology", "analysis"],
                "expected_length": "long"
            },
            {
                "id": "q7",
                "text": "Why are you interested in this position?",
                "followups": "What excites you most?",
                "type": "behavioral",
                "difficulty": "easy",
                "expected_keywords": ["interest", "motivation", "goals"],
                "expected_length": "medium"
            }
        ]


def evaluate_answer(
    question_text: str,
    transcript: str,
    expected_keywords: List[str],
    profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate answer using local fallback.

    Returns evaluation dict with scores and notes.
    """
    print("🔄 Using local LLM fallback for answer evaluation")

    try:
        evaluation_json = _generate_mock_evaluation()
        evaluation = json.loads(evaluation_json)
        return evaluation
    except:
        return {
            "technical": 70,
            "communication": 75,
            "confidence": 65,
            "relevance": 70,
            "short_notes": "Baseline evaluation (using local fallback)."
        }


def improve_answer(
    question_text: str,
    transcript: str,
    profile: Dict[str, Any]
) -> str:
    """
    Return improved answer using local fallback.
    """
    print("🔄 Using local LLM fallback for answer improvement")
    return _generate_mock_improvement()


def generate_final_report(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate final report using local fallback.
    """
    print("🔄 Using local LLM fallback for final report generation")

    try:
        report_json = _generate_mock_report()
        report = json.loads(report_json)
        return report
    except:
        return {
            "overall_summary": "Interview completed using local fallback system.",
            "technical_strengths": ["Basic technical knowledge demonstrated"],
            "technical_gaps": ["Consider providing more detailed examples"],
            "communication_score": 70,
            "behavioral_score": 65,
            "improved_answers": [],
            "recommendations": ["Practice more interview questions", "Focus on clear communication"]
        }


def generate_interviewer_response(question: str, candidate_answer: str, conversation_history: list = None) -> str:
    """
    Generate interviewer response using local fallback.
    """
    print("🔄 Using local LLM fallback for interviewer response generation")
    return _generate_mock_response()
