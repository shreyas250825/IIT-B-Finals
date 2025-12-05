# backend/app/ai_engines/scoring_engine.py
from typing import Dict, Any, List
import re
# import torch  # Deprecated - no longer using HuggingFace
from app.services.llm import llm_service

class ScoringEngine:
    def __init__(self):
        self._initialized = False
        self.sentiment_analyzer = None
        self.similarity_model = None

    def _initialize_models(self):
        """Lazy initialization of models"""
        if self._initialized:
            return

        try:
            # DEPRECATED: HuggingFace models removed - using OpenRouter instead
            # from transformers import pipeline
            # from sentence_transformers import SentenceTransformer
            # self.sentiment_analyzer = pipeline(...)
            # self.similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("Warning: ScoringEngine models deprecated. Using OpenRouter for evaluation.")
            self._initialized = True
        except Exception as e:
            print(f"Warning: Models not available: {e}")
            self._initialized = True  # Don't try again

    def analyze_technical(self, question: str, answer: str) -> Dict[str, Any]:
        """DEPRECATED: Use OpenRouter evaluate_answer instead"""
        print("Warning: ScoringEngine.analyze_technical() is deprecated. Using basic fallback.")
        # Fallback to basic analysis
        return self._basic_technical_analysis(question, answer)

    def _basic_technical_analysis(self, question: str, answer: str) -> Dict[str, Any]:
        """Basic technical analysis as fallback"""
        answer_length = len(answer.strip())
        question_words = set(question.lower().split())
        answer_words = set(answer.lower().split())

        # Simple relevance check
        common_words = question_words.intersection(answer_words)
        relevance_score = min(100, len(common_words) * 20)

        # Length-based completeness
        completeness_score = min(100, answer_length / 2)

        # Basic accuracy (placeholder)
        accuracy_score = 70

        technical_score = (accuracy_score + completeness_score + relevance_score) / 3

        return {
            "score": technical_score,
            "accuracy": accuracy_score,
            "completeness": completeness_score,
            "relevance": relevance_score,
            "concepts_covered": [],
            "technical_errors": [],
            "feedback": "Your answer shows basic understanding. Consider providing more specific technical details and examples.",
            "analysis_method": "basic_fallback"
        }

    def _extract_score(self, text: str, label: str) -> float:
        """Extract numeric score from analysis text"""
        try:
            pattern = f"{label}:\\s*(\\d+)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return min(100, max(0, float(match.group(1))))
        except:
            pass
        return 70  # Default score

    def _extract_section(self, text: str, label: str) -> str:
        """Extract section content from analysis text"""
        try:
            pattern = f"{label}:\\s*(.*?)(?=\n[A-Z]+:|$)"
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        except:
            pass
        return ""

    def analyze_answer_quality(self, question: str, answer: str) -> Dict[str, Any]:
        """Analyze overall answer quality"""
        technical_analysis = self.analyze_technical(question, answer)

        return {
            "technical_score": technical_analysis["score"],
            "overall_quality": technical_analysis["score"],
            "strengths": technical_analysis.get("concepts_covered", []),
            "weaknesses": technical_analysis.get("technical_errors", []),
            "feedback": technical_analysis.get("feedback", "")
        }
