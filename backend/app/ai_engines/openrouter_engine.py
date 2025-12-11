"""
OpenRouter Engine using anthropic/claude-3-haiku (free-friendly) for all LLM tasks.
- Question + ideal_answer generation
- Answer evaluation
- Improved answers
- Final report generation

IMPORTANT: Uses the correct OpenRouter API URL:
    https://openrouter.ai/api/v1/chat/completions
"""

import json
import hashlib
import os
import time
from typing import Any, Dict, List, Optional

import requests

from app.config import get_settings

settings = get_settings()

# --------------------------------------------------------------------
# OpenRouter Configuration
# --------------------------------------------------------------------
OPENROUTER_API_KEY = (
    os.getenv("OPENROUTER_API_KEY")
    or getattr(settings, "OPENROUTER_API_KEY", None)
    or None
)

# Use the same model that worked in test_system.py
OPENROUTER_MODEL = (
    os.getenv("OPENROUTER_MODEL")
    or getattr(settings, "OPENROUTER_MODEL", None)
    or "anthropic/claude-3-haiku"
)

# HARD-CODE the correct API URL (do NOT read from env/settings)
OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"

if not OPENROUTER_API_KEY:
    print("⚠️ WARNING: OPENROUTER_API_KEY not found in environment or .env file")
else:
    print(f"✅ OpenRouter API key loaded (model: {OPENROUTER_MODEL})")
    print(f"   Using base URL: {OPENROUTER_BASE}")

# In-memory cache with TTL
CACHE: Dict[str, Dict[str, Any]] = {}


# --------------------------------------------------------------------
# Core HTTP call
# --------------------------------------------------------------------
def _get_cache_key(
    messages: List[Dict[str, str]],
    temperature: float,
    max_tokens: int,
) -> str:
    """Generate SHA256 cache key from messages + basic params."""
    payload = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True).encode("utf-8")
    ).hexdigest()


def call_openrouter(
    messages: List[Dict[str, str]],
    temperature: float = 0.0,
    max_tokens: int = 600,
    timeout: int = 30,
) -> str:
    """
    Call OpenRouter and return raw assistant text.

    Single, clean HTTP call.
    """
    if not OPENROUTER_API_KEY:
        print("⚠️ OPENROUTER_API_KEY not configured")
        return ""

    cache_key = _get_cache_key(messages, temperature, max_tokens)
    now = time.time()
    cached = CACHE.get(cache_key)
    if cached and now - cached["ts"] < 3600:  # 1 hour TTL
        return cached["out"]

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Optional for OpenRouter analytics
        "HTTP-Referer": "https://github.com/your-repo",
        "X-Title": "AI Mock Interview Simulator",
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    print(
        f"🔄 OpenRouter request: POST {OPENROUTER_BASE} "
        f"(model: {OPENROUTER_MODEL}, tokens: {max_tokens}, temp: {temperature})"
    )

    try:
        resp = requests.post(
            OPENROUTER_BASE, headers=headers, json=payload, timeout=timeout
        )
        resp.raise_for_status()

        # If it's clearly HTML, don't even try to json.loads
        content_type = resp.headers.get("Content-Type", "")
        if "application/json" not in content_type:
            body_preview = resp.text[:400]
            print("❌ OpenRouter returned non-JSON response.")
            print(f"   Body (first 400 chars): {body_preview!r}")
            return ""

        data = resp.json()

        # Extract assistant message
        if "choices" in data and data["choices"]:
            text = data["choices"][0].get("message", {}).get("content", "").strip()
        else:
            print(f"⚠️ Unexpected OpenRouter response JSON: {data}")
            text = ""

        CACHE[cache_key] = {"out": text, "ts": now}
        return text

    except requests.exceptions.RequestException as e:
        print(f"❌ OpenRouter API error: {e}")
        return ""
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error from OpenRouter: {e}")
        body_preview = resp.text[:400] if "resp" in locals() else ""
        print(f"   Raw body (first 400 chars): {body_preview!r}")
        return ""
    except Exception as e:
        print(f"❌ Unexpected OpenRouter error: {e}")
        return ""


# --------------------------------------------------------------------
# JSON Parsing Helper
# --------------------------------------------------------------------
def _parse_json_from_text(text: str) -> Optional[Any]:
    """Robust JSON extractor that handles markdown code blocks."""
    if not text:
        return None

    cleaned = text.strip()
    # Strip ```json ... ```
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    # Direct attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract JSON array/object inside text
        start_idx = cleaned.find("[")
        if start_idx == -1:
            start_idx = cleaned.find("{")
        if start_idx != -1:
            try:
                bracket = cleaned[start_idx]
                if bracket == "[":
                    end_idx = cleaned.rfind("]")
                else:
                    end_idx = cleaned.rfind("}")
                if end_idx > start_idx:
                    json_str = cleaned[start_idx : end_idx + 1]
                    return json.loads(json_str)
            except Exception:
                pass

    return None


# --------------------------------------------------------------------
# Question + Ideal Answer Generation
# --------------------------------------------------------------------
def generate_questions_from_profile(
    profile: Dict[str, Any],
    persona: str,
    interview_type: str,
) -> List[Dict[str, Any]]:
    """
    Generate exactly 7 interview questions using OpenRouter.

    Each question dict includes:
    id, text, followups, type, difficulty, expected_keywords,
    expected_length, ideal_answer (reference answer).
    """
    role = profile.get("role", profile.get("estimated_role", "Software Engineer"))
    skills = profile.get("skills", [])
    experience = profile.get("experience", {})

    profile_json = {
        "role": role,
        "skills": skills[:10] if skills else [],
        "experience_level": experience.get("level", "Mid-Level"),
        "experience_years": experience.get("years_experience", 0),
        "projects": profile.get("projects", []),
    }

    system_prompt = (
        "You are a senior interviewer for mock job interviews.\n"
        "Return ONLY valid JSON.\n"
        "Output exactly 7 interview questions.\n\n"
        "Each question object must contain:\n"
        "- id\n"
        "- text\n"
        "- followups\n"
        "- type\n"
        "- difficulty\n"
        "- expected_keywords\n"
        "- expected_length\n"
        "- ideal_answer  (a concise, high-quality reference answer)\n\n"
        "Focus questions on the candidate's role, projects, and skills.\n"
        "Keep all text concise. Persona must influence tone."
    )

    user_prompt = f"""CANDIDATE PROFILE:
{json.dumps(profile_json, indent=2)}

INTERVIEW TYPE: {interview_type}
PERSONA: {persona}

Rules:
- Produce exactly 7 questions.
- Mix behavioral + technical questions relevant to this profile.
- Each item must include an 'ideal_answer' field.
- Keep question wording <= 25 words.
- Followups <= 12 words.
- expected_keywords must be concise.
- Output ONLY a JSON array of question objects."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",  "content": user_prompt},
    ]

    text = call_openrouter(messages, temperature=0.0, max_tokens=900)

    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, list) and len(parsed) >= 7:
            questions: List[Dict[str, Any]] = []
            for i, q in enumerate(parsed[:7]):
                if isinstance(q, dict):
                    questions.append(
                        {
                            "id": q.get("id", f"q{i + 1}"),
                            "text": q.get("text", q.get("question", "")),
                            "followups": q.get("followups", ""),
                            "type": q.get("type", interview_type),
                            "difficulty": q.get("difficulty", "medium"),
                            "expected_keywords": q.get("expected_keywords", []),
                            "expected_length": q.get("expected_length", "medium"),
                            "ideal_answer": q.get("ideal_answer", ""),
                        }
                    )
            if len(questions) == 7:
                return questions

    print("⚠️ OpenRouter returned empty/invalid text for question generation. Using fallback.")
    return _get_fallback_questions(role, interview_type, persona)


def _get_fallback_questions(role: str, interview_type: str, persona: str) -> List[Dict[str, Any]]:
    """Generate fallback questions from template or JSON file."""
    try:
        fallback_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "data",
            "demos",
            "questions_fallback.json",
        )
        fallback_path = os.path.normpath(fallback_path)
        if os.path.exists(fallback_path):
            with open(fallback_path, "r", encoding="utf-8") as f:
                fallback_data = json.load(f)
                if isinstance(fallback_data, list) and len(fallback_data) >= 7:
                    questions: List[Dict[str, Any]] = []
                    persona_prefixes = {
                        "male": "",
                        "female": "I'd love to hear about ",
                        "bossy_female": "I need you to explain ",
                    }
                    prefix = persona_prefixes.get(persona, "")
                    for q in fallback_data[:7]:
                        q_copy = q.copy()
                        if interview_type != "mixed":
                            q_copy["type"] = interview_type
                        if prefix and q_copy.get("text"):
                            q_copy["text"] = prefix + q_copy["text"]
                        if "{role}" in q_copy.get("text", ""):
                            q_copy["text"] = q_copy["text"].replace("{role}", role)
                        q_copy.setdefault("ideal_answer", "")
                        q_copy.setdefault("expected_keywords", [])
                        questions.append(q_copy)
                    return questions
    except Exception as e:
        print(f"⚠️ Could not load fallback JSON: {e}")

    persona_prefixes = {
        "male": "",
        "female": "",
        "bossy_female": "",
    }
    prefix = persona_prefixes.get(persona, "")

    base_questions = [
        {
            "id": "q1",
            "text": f"{prefix}Tell me about yourself and your background.",
            "followups": "Can you elaborate?",
            "type": interview_type,
            "difficulty": "easy",
            "expected_keywords": ["experience", "background", "skills"],
            "expected_length": "medium",
            "ideal_answer": "Briefly summarize your education, core skills, key projects, and what you are looking for next.",
        },
        {
            "id": "q2",
            "text": f"{prefix}Describe a challenging project you worked on as a {role}.",
            "followups": "What was the outcome?",
            "type": interview_type,
            "difficulty": "medium",
            "expected_keywords": ["project", "challenge", "solution", "technologies"],
            "expected_length": "long",
            "ideal_answer": "Explain the project context, your role, main challenge, approach, and measurable result.",
        },
        {
            "id": "q3",
            "text": f"{prefix}How do you handle tight deadlines and pressure?",
            "followups": "Give an example.",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["time management", "prioritization", "communication"],
            "expected_length": "medium",
            "ideal_answer": "Describe how you plan, prioritize, communicate, and maintain quality under pressure using a concrete example.",
        },
        {
            "id": "q4",
            "text": f"{prefix}What technical skills do you bring to this {role} position?",
            "followups": "Which is your strongest?",
            "type": interview_type,
            "difficulty": "medium",
            "expected_keywords": ["skills", "technologies", "tools"],
            "expected_length": "medium",
            "ideal_answer": "List your main languages, frameworks, tools, and briefly connect them to the role’s responsibilities.",
        },
        {
            "id": "q5",
            "text": f"{prefix}Describe a time when you had to learn a new technology quickly.",
            "followups": "How did you approach it?",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["learning", "adaptation", "self-study"],
            "expected_length": "medium",
            "ideal_answer": "Explain how you identified what to learn, resources used, practice method, and how you applied it in a project.",
        },
        {
            "id": "q6",
            "text": f"{prefix}How do you approach problem-solving in your work?",
            "followups": "Walk me through an example.",
            "type": interview_type,
            "difficulty": "hard",
            "expected_keywords": ["analysis", "debugging", "root cause"],
            "expected_length": "long",
            "ideal_answer": "Describe your systematic approach: understanding requirements, breaking down the problem, experimenting, validating, and documenting the solution.",
        },
        {
            "id": "q7",
            "text": f"{prefix}Why are you interested in this {role} position?",
            "followups": "What excites you most?",
            "type": "behavioral",
            "difficulty": "easy",
            "expected_keywords": ["interest", "motivation", "goals"],
            "expected_length": "medium",
            "ideal_answer": "Connect your interests, skills, and long-term goals with what this role and company offer.",
        },
    ]

    return base_questions


# --------------------------------------------------------------------
# Evaluation
# --------------------------------------------------------------------
def evaluate_answer(
    question_text: str,
    transcript: str,
    expected_keywords: List[str],
    profile: Dict[str, Any],
    ideal_answer: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluate answer and return compact evaluation JSON.
    """
    system_prompt = (
        "Return ONLY JSON with keys:\n"
        "technical (0-100),\n"
        "communication (0-100),\n"
        "confidence (0-100),\n"
        "relevance (0-100),\n"
        "short_notes (<= 40 words)."
    )

    profile_summary = {
        "role": profile.get("role", profile.get("estimated_role", "")),
        "skills": profile.get("skills", [])[:5],
    }

    user_prompt = f"""QUESTION: {question_text}
IDEAL_ANSWER: {ideal_answer or "N/A"}
ANSWER: {transcript}
PROFILE: {json.dumps(profile_summary)}
KEYWORDS: {', '.join(expected_keywords) if expected_keywords else 'N/A'}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",  "content": user_prompt},
    ]

    text = call_openrouter(messages, temperature=0.0, max_tokens=220)

    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, Dict):
            return {
                "technical": int(parsed.get("technical", 70)),
                "communication": int(parsed.get("communication", 70)),
                "confidence": int(parsed.get("confidence", 70)),
                "relevance": int(parsed.get("relevance", 70)),
                "short_notes": parsed.get("short_notes", "Baseline evaluation.")[:200],
            }

    # Fallback evaluation
    return {
        "technical": 70,
        "communication": 70,
        "confidence": 70,
        "relevance": 70,
        "short_notes": "Baseline evaluation (OpenRouter not available).",
    }


# --------------------------------------------------------------------
# Improved Answer
# --------------------------------------------------------------------
def improve_answer(
    question_text: str,
    transcript: str,
    profile: Dict[str, Any],
) -> str:
    """
    Return a concise improved answer (40–70 words). No JSON.
    """
    system_prompt = "Return ONLY a short improved answer (40–70 words). No JSON."

    user_prompt = f"""QUESTION: {question_text}
ORIGINAL_ANSWER: {transcript}

Provide a concise, professional improved version."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",  "content": user_prompt},
    ]

    text = call_openrouter(messages, temperature=0.3, max_tokens=160)

    if text:
        cleaned = text.strip()
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1]
        return cleaned[:400]

    return transcript


# --------------------------------------------------------------------
# Final Report
# --------------------------------------------------------------------
def generate_final_report(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Summarize all evaluations and produce a final structured report.

    Returns:
        {
            overall_summary: str,
            technical_strengths: List[str],
            technical_gaps: List[str],
            communication_score: int,
            behavioral_score: int,
            improved_answers: List[Dict],
            recommendations: List[str]
        }
    """
    questions = session_data.get("questions", [])
    evaluations = session_data.get("evaluations", [])
    answers = session_data.get("answers", [])

    if not evaluations:
        return {
            "overall_summary": "No evaluations available.",
            "technical_strengths": [],
            "technical_gaps": [],
            "communication_score": 0,
            "behavioral_score": 0,
            "improved_answers": [],
            "recommendations": [],
        }

    avg_technical = sum(e.get("technical", 0) for e in evaluations) / len(evaluations)
    avg_communication = sum(e.get("communication", 0) for e in evaluations) / len(evaluations)
    avg_confidence = sum(e.get("confidence", 0) for e in evaluations) / len(evaluations)
    avg_relevance = sum(e.get("relevance", 0) for e in evaluations) / len(evaluations)

    session_summary = []
    for q, e, a in zip(
        questions[: len(evaluations)],
        evaluations,
        answers[: len(evaluations)],
    ):
        session_summary.append(
            {
                "question": q.get("text", ""),
                "ideal_answer": q.get("ideal_answer", ""),
                "candidate_answer": a.get("transcript", ""),
                "technical": e.get("technical", 0),
                "communication": e.get("communication", 0),
                "confidence": e.get("confidence", 0),
                "relevance": e.get("relevance", 0),
                "notes": e.get("short_notes", ""),
            }
        )

    system_prompt = """You are a report generator. Output ONLY JSON:
{
 "overall_summary": "...",
 "technical_strengths": [...],
 "technical_gaps": [...],
 "communication_score": int,
 "behavioral_score": int,
 "improved_answers": [{ "id": string, "improved": string }],
 "recommendations": [...]
}

Generate concise insights."""

    user_prompt = f"""SESSION DATA:
{json.dumps(session_summary, indent=2)}

Average Scores:
- Technical: {avg_technical:.1f}
- Communication: {avg_communication:.1f}
- Confidence: {avg_confidence:.1f}
- Relevance: {avg_relevance:.1f}

Generate a comprehensive report."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",  "content": user_prompt},
    ]

    text = call_openrouter(messages, temperature=0.2, max_tokens=400)

    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, Dict):
            return {
                "overall_summary": parsed.get(
                    "overall_summary",
                    f"Average technical: {avg_technical:.1f}, communication: {avg_communication:.1f}.",
                ),
                "technical_strengths": parsed.get("technical_strengths", []),
                "technical_gaps": parsed.get("technical_gaps", []),
                "communication_score": int(parsed.get("communication_score", avg_communication)),
                "behavioral_score": int(parsed.get("behavioral_score", avg_confidence)),
                "improved_answers": parsed.get("improved_answers", []),
                "recommendations": parsed.get("recommendations", []),
            }

    # Fallback report
    return {
        "overall_summary": (
            f"Completed interview with average scores: "
            f"Technical {avg_technical:.1f}, Communication {avg_communication:.1f}, "
            f"Confidence {avg_confidence:.1f}."
        ),
        "technical_strengths": ["Good technical knowledge demonstrated"] if avg_technical >= 70 else [],
        "technical_gaps": ["Continue practicing technical concepts"] if avg_technical < 70 else [],
        "communication_score": int(avg_communication),
        "behavioral_score": int(avg_confidence),
        "improved_answers": [],
        "recommendations": ["Practice more interview questions", "Focus on clear communication"],
    }