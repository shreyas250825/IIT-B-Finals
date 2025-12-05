"""
OpenRouter Engine using Amazon Nova-2-Lite for all LLM tasks.
Optimized for minimal tokens, high reliability, and JSON-only responses.
"""
import json
import hashlib
import os
import time
from typing import Any, Dict, List, Optional
import requests

from app.config import get_settings

settings = get_settings()

# OpenRouter Configuration
# Try to get from environment or settings (settings loads from .env file)
OPENROUTER_API_KEY = (
    os.getenv("OPENROUTER_API_KEY") or 
    getattr(settings, "OPENROUTER_API_KEY", None) or
    None
)
OPENROUTER_MODEL = (
    os.getenv("OPENROUTER_MODEL") or 
    getattr(settings, "OPENROUTER_MODEL", None) or
    "amazon/nova-2-lite-v1:free"
)
OPENROUTER_BASE = (
    os.getenv("OPENROUTER_BASE") or 
    getattr(settings, "OPENROUTER_BASE", None) or
    "https://api.openrouter.ai/v1/chat/completions"
)

# Debug logging (only if key is missing)
if not OPENROUTER_API_KEY:
    print("⚠️ WARNING: OPENROUTER_API_KEY not found in environment or .env file")
    print(f"   Checked: {os.getenv('OPENROUTER_API_KEY', 'Not in os.getenv')}")
    print(f"   Settings: {getattr(settings, 'OPENROUTER_API_KEY', 'Not in settings')}")
else:
    print(f"✅ OpenRouter API key loaded (model: {OPENROUTER_MODEL})")

# In-memory cache with TTL
CACHE: Dict[str, Dict[str, Any]] = {}


def _get_cache_key(messages: List[Dict[str, str]]) -> str:
    """Generate SHA256 cache key from messages."""
    messages_json = json.dumps(messages, sort_keys=True)
    return hashlib.sha256(messages_json.encode("utf-8")).hexdigest()


def call_openrouter(
    messages: List[Dict[str, str]], 
    temperature: float = 0.0, 
    max_tokens: int = 600,
    timeout: int = 30
) -> str:
    """
    Call OpenRouter Nova-2-Lite and return raw assistant text.
    
    Args:
        messages: List of message dicts with "role" and "content"
        temperature: Sampling temperature (0.0 for deterministic)
        max_tokens: Maximum tokens to generate
        timeout: Request timeout in seconds
    
    Returns:
        Raw text from assistant, or empty string on error
    """
    if not OPENROUTER_API_KEY:
        print("⚠️ OPENROUTER_API_KEY not configured")
        return ""
    
    # Check cache
    cache_key = _get_cache_key(messages)
    now = time.time()
    cached = CACHE.get(cache_key)
    if cached and now - cached["ts"] < 3600:  # 1 hour TTL
        return cached["out"]
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/your-repo",  # Optional
        "X-Title": "AI Mock Interview Simulator"  # Optional
    }
    
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    try:
        resp = requests.post(OPENROUTER_BASE, headers=headers, json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        
        # Extract assistant message
        if "choices" in data and len(data["choices"]) > 0:
            text = data["choices"][0].get("message", {}).get("content", "").strip()
            
            # Cache the result
            CACHE[cache_key] = {"out": text, "ts": now}
            return text
        else:
            print(f"⚠️ Unexpected OpenRouter response: {data}")
            return ""
    except requests.exceptions.RequestException as e:
        print(f"❌ OpenRouter API error: {e}")
        return ""
    except Exception as e:
        print(f"❌ Unexpected error calling OpenRouter: {e}")
        return ""


def _parse_json_from_text(text: str) -> Optional[Any]:
    """Robust JSON extractor that handles markdown code blocks."""
    if not text:
        return None
    
    # Remove markdown code blocks
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    # Try to find JSON object/array
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract JSON from text
        start_idx = cleaned.find('[')
        if start_idx == -1:
            start_idx = cleaned.find('{')
        if start_idx != -1:
            try:
                # Find matching closing bracket
                bracket = cleaned[start_idx]
                if bracket == '[':
                    end_idx = cleaned.rfind(']')
                else:
                    end_idx = cleaned.rfind('}')
                
                if end_idx > start_idx:
                    json_str = cleaned[start_idx:end_idx + 1]
                    return json.loads(json_str)
            except:
                pass
    
    return None


def generate_questions_from_profile(
    profile: Dict[str, Any], 
    persona: str, 
    interview_type: str
) -> List[Dict[str, Any]]:
    """
    Generate exactly 7 interview questions using OpenRouter.
    
    Returns list of question dicts with:
    id, text, followups, type, difficulty, expected_keywords, expected_length
    """
    role = profile.get("role", profile.get("estimated_role", "Software Engineer"))
    skills = profile.get("skills", [])
    experience = profile.get("experience", {})
    
    # Persona tone guidelines
    persona_tones = {
        "male": "neutral, professional tone",
        "female": "warm, encouraging tone",
        "bossy_female": "strict, demanding, high-pressure tone"
    }
    persona_tone = persona_tones.get(persona, "neutral, professional tone")
    
    # Build compact profile JSON
    profile_json = {
        "role": role,
        "skills": skills[:10] if skills else [],
        "experience_level": experience.get("level", "Mid-Level"),
        "experience_years": experience.get("years_experience", 0)
    }
    
    system_prompt = """You are a senior technical interviewer.
Return ONLY valid JSON.
Output exactly 7 interview questions.
Each question object must contain: id, text, followups, type, difficulty, expected_keywords, expected_length.
Keep text concise. Persona must influence tone."""
    
    user_prompt = f"""PROFILE:
{json.dumps(profile_json, indent=2)}

INTERVIEW TYPE: {interview_type}
PERSONA: {persona}

Rules:
- Produce exactly 7 questions.
- Keep wording <= 25 words.
- Followups <= 12 words.
- expected_keywords must be concise.
- Output ONLY a JSON array."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    text = call_openrouter(messages, temperature=0.0, max_tokens=600)
    
    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, list) and len(parsed) >= 7:
            questions = []
            for i, q in enumerate(parsed[:7]):
                if isinstance(q, dict):
                    questions.append({
                        "id": q.get("id", f"q{i + 1}"),
                        "text": q.get("text", q.get("question", "")),
                        "followups": q.get("followups", ""),
                        "type": q.get("type", interview_type),
                        "difficulty": q.get("difficulty", "medium"),
                        "expected_keywords": q.get("expected_keywords", []),
                        "expected_length": q.get("expected_length", "medium")
                    })
            if len(questions) == 7:
                return questions
    
    # Fallback to template questions
    return _get_fallback_questions(role, interview_type, persona)


def _get_fallback_questions(role: str, interview_type: str, persona: str) -> List[Dict[str, Any]]:
    """Generate fallback questions from template or JSON file."""
    # Try to load from JSON file first
    try:
        fallback_path = os.path.join(
            os.path.dirname(__file__), 
            "..", "..", "data", "demos", "questions_fallback.json"
        )
        # Normalize path
        fallback_path = os.path.normpath(fallback_path)
        if os.path.exists(fallback_path):
            with open(fallback_path, 'r', encoding='utf-8') as f:
                fallback_data = json.load(f)
                if isinstance(fallback_data, list) and len(fallback_data) >= 7:
                    # Apply persona and role to fallback questions
                    questions = []
                    for q in fallback_data[:7]:
                        q_copy = q.copy()
                        # Update type if needed
                        if interview_type != "mixed":
                            q_copy["type"] = interview_type
                        # Apply persona prefix to text
                        persona_prefixes = {
                            "male": "",
                            "female": "I'd love to hear about ",
                            "bossy_female": "I need you to explain "
                        }
                        prefix = persona_prefixes.get(persona, "")
                        if prefix and q_copy.get("text"):
                            q_copy["text"] = prefix + q_copy["text"]
                        # Update role-specific questions
                        if "{role}" in q_copy.get("text", ""):
                            q_copy["text"] = q_copy["text"].replace("{role}", role)
                        questions.append(q_copy)
                    return questions
    except Exception as e:
        print(f"⚠️ Could not load fallback JSON: {e}")
    
    # Fallback to hardcoded template
    persona_prefixes = {
        "male": "",
        "female": "I'd love to hear about ",
        "bossy_female": "I need you to explain "
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
            "expected_length": "medium"
        },
        {
            "id": "q2",
            "text": f"{prefix}Describe a challenging project you worked on as a {role}.",
            "followups": "What was the outcome?",
            "type": interview_type,
            "difficulty": "medium",
            "expected_keywords": ["project", "challenge", "solution", "technologies"],
            "expected_length": "long"
        },
        {
            "id": "q3",
            "text": f"{prefix}How do you handle tight deadlines and pressure?",
            "followups": "Give an example.",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["time management", "stress", "prioritization"],
            "expected_length": "medium"
        },
        {
            "id": "q4",
            "text": f"{prefix}What technical skills do you bring to this {role} position?",
            "followups": "Which is your strongest?",
            "type": interview_type,
            "difficulty": "medium",
            "expected_keywords": ["skills", "technologies", "expertise"],
            "expected_length": "medium"
        },
        {
            "id": "q5",
            "text": f"{prefix}Describe a time when you had to learn a new technology quickly.",
            "followups": "How did you approach it?",
            "type": "behavioral",
            "difficulty": "medium",
            "expected_keywords": ["learning", "adaptation", "technology"],
            "expected_length": "medium"
        },
        {
            "id": "q6",
            "text": f"{prefix}How do you approach problem-solving in your work?",
            "followups": "Walk me through an example.",
            "type": interview_type,
            "difficulty": "hard",
            "expected_keywords": ["problem-solving", "methodology", "analysis"],
            "expected_length": "long"
        },
        {
            "id": "q7",
            "text": f"{prefix}Why are you interested in this {role} position?",
            "followups": "What excites you most?",
            "type": "behavioral",
            "difficulty": "easy",
            "expected_keywords": ["interest", "motivation", "goals"],
            "expected_length": "medium"
        }
    ]
    
    return base_questions


def evaluate_answer(
    question_text: str, 
    transcript: str, 
    expected_keywords: List[str], 
    profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate answer and return compact evaluation JSON.
    
    Returns:
        {
            technical: int (0-100),
            communication: int (0-100),
            confidence: int (0-100),
            relevance: int (0-100),
            short_notes: str (<= 40 words)
        }
    """
    system_prompt = """Return ONLY JSON with keys:
technical (0-100),
communication (0-100),
confidence (0-100),
relevance (0-100),
short_notes (<= 40 words)."""
    
    profile_summary = {
        "role": profile.get("role", profile.get("estimated_role", "")),
        "skills": profile.get("skills", [])[:5]
    }
    
    user_prompt = f"""QUESTION: {question_text}
ANSWER: {transcript}
PROFILE: {json.dumps(profile_summary)}
KEYWORDS: {', '.join(expected_keywords) if expected_keywords else 'N/A'}"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    text = call_openrouter(messages, temperature=0.0, max_tokens=200)
    
    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, dict):
            return {
                "technical": int(parsed.get("technical", 70)),
                "communication": int(parsed.get("communication", 70)),
                "confidence": int(parsed.get("confidence", 70)),
                "relevance": int(parsed.get("relevance", 70)),
                "short_notes": parsed.get("short_notes", "Baseline evaluation.")[:200]
            }
    
    # Fallback evaluation
    return {
        "technical": 70,
        "communication": 70,
        "confidence": 70,
        "relevance": 70,
        "short_notes": "Baseline evaluation (OpenRouter not configured)."
    }


def improve_answer(
    question_text: str, 
    transcript: str, 
    profile: Dict[str, Any]
) -> str:
    """
    Return a concise improved answer (40–70 words). No JSON.
    """
    system_prompt = "Return ONLY a short improved answer (40–70 words). No JSON."
    
    user_prompt = f"""QUESTION: {question_text}
ORIGINAL ANSWER: {transcript}

Provide a concise, professional improved version."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    text = call_openrouter(messages, temperature=0.3, max_tokens=150)
    
    if text:
        # Clean up the response
        cleaned = text.strip()
        # Remove any JSON markers if present
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1]
        return cleaned[:300]  # Max 300 chars
    
    return transcript  # Return original if improvement fails


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
    # Build summary of session
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
            "recommendations": []
        }
    
    # Calculate averages
    avg_technical = sum(e.get("technical", 0) for e in evaluations) / len(evaluations)
    avg_communication = sum(e.get("communication", 0) for e in evaluations) / len(evaluations)
    avg_confidence = sum(e.get("confidence", 0) for e in evaluations) / len(evaluations)
    avg_relevance = sum(e.get("relevance", 0) for e in evaluations) / len(evaluations)
    
    # Build session summary
    session_summary = []
    for i, (q, e, a) in enumerate(zip(questions[:len(evaluations)], evaluations, answers[:len(evaluations)])):
        session_summary.append({
            "question": q.get("text", ""),
            "technical": e.get("technical", 0),
            "communication": e.get("communication", 0),
            "confidence": e.get("confidence", 0),
            "notes": e.get("short_notes", "")
        })
    
    system_prompt = """You are a report generator. Output ONLY JSON:
{
 "overall_summary": "...",
 "technical_strengths": [...],
 "technical_gaps": [...],
 "communication_score": int,
 "behavioral_score": int,
 "improved_answers": [{id, improved}],
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
        {"role": "user", "content": user_prompt}
    ]
    
    text = call_openrouter(messages, temperature=0.2, max_tokens=300)
    
    if text:
        parsed = _parse_json_from_text(text)
        if isinstance(parsed, dict):
            # Ensure all required fields
            return {
                "overall_summary": parsed.get("overall_summary", f"Average technical: {avg_technical:.1f}, communication: {avg_communication:.1f}."),
                "technical_strengths": parsed.get("technical_strengths", []),
                "technical_gaps": parsed.get("technical_gaps", []),
                "communication_score": int(parsed.get("communication_score", avg_communication)),
                "behavioral_score": int(parsed.get("behavioral_score", avg_confidence)),
                "improved_answers": parsed.get("improved_answers", []),
                "recommendations": parsed.get("recommendations", [])
            }
    
    # Fallback report
    return {
        "overall_summary": f"Completed interview with average scores: Technical {avg_technical:.1f}, Communication {avg_communication:.1f}, Confidence {avg_confidence:.1f}.",
        "technical_strengths": ["Good technical knowledge demonstrated"] if avg_technical >= 70 else [],
        "technical_gaps": ["Continue practicing technical concepts"] if avg_technical < 70 else [],
        "communication_score": int(avg_communication),
        "behavioral_score": int(avg_confidence),
        "improved_answers": [],
        "recommendations": ["Practice more interview questions", "Focus on clear communication"]
    }

