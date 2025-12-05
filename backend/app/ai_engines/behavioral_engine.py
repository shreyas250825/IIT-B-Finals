# backend/app/ai_engines/behavioral_engine.py
# DEPRECATED: HuggingFace imports removed - using OpenRouter instead
# from transformers import pipeline
# from sentence_transformers import SentenceTransformer
from ..services.llm import llm_service
# import numpy as np
import re
import logging

logger = logging.getLogger(__name__)

class BehavioralEngine:
    def __init__(self):
        self.sentiment_analyzer = None
        self.similarity_model = None
        self._initialized = False

    def _initialize_models(self):
        """Lazy initialization of behavioral analysis models"""
        if self._initialized:
            return

        try:
            # DEPRECATED: HuggingFace models removed - using OpenRouter instead
            logger.warning("BehavioralEngine models deprecated. Using OpenRouter for evaluation.")
            # self.sentiment_analyzer = pipeline(...)
            # self.similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize behavioral engine: {e}")
            self.sentiment_analyzer = None
            self.similarity_model = None

    def analyze_behavioral(self, question: str, answer: str, metrics: dict = None):
        """Analyze behavioral content and metrics"""
        # Default scores if no answer provided
        if not answer or not answer.strip():
            return {
                "score": 50.0,
                "communication_score": 70.0,
                "confidence_score": 70.0,
                "relevance_score": 50.0,
                "depth_score": 50.0,
                "star_method_score": 0.0,
                "feedback": "No answer provided for behavioral analysis."
            }

        # Initialize models if needed
        self._initialize_models()

        # Calculate relevance
        relevance_score = self._calculate_relevance(question, answer) if question else 0.5

        # Analyze sentiment/confidence using Hugging Face
        sentiment = llm_service.analyze_sentiment(answer[:512])
        confidence_score = self._map_sentiment_to_confidence(sentiment)

        # Enhanced behavioral depth analysis
        behavioral_depth = self._analyze_behavioral_depth(answer)

        # STAR method detection
        star_score = self._detect_star_method(answer)

        # Analyze speech metrics if provided
        speech_metrics = self._analyze_speech_metrics(metrics or {})

        # Combined behavioral score
        behavioral_score = (
            relevance_score * 0.3 +
            behavioral_depth * 0.25 +
            confidence_score * 0.2 +
            star_score * 0.15 +
            speech_metrics['overall'] * 0.1
        ) * 100

        return {
            "score": round(behavioral_score, 2),
            "communication_score": round(speech_metrics['communication'] * 100, 2),
            "confidence_score": round(confidence_score * 100, 2),
            "relevance_score": round(relevance_score * 100, 2),
            "depth_score": round(behavioral_depth * 100, 2),
            "star_method_score": round(star_score * 100, 2),
            "speech_metrics": speech_metrics,
            "feedback": self._generate_behavioral_feedback(
                behavioral_score, answer, star_score, speech_metrics
            )
        }

    def _calculate_relevance(self, question: str, answer: str) -> float:
        """Calculate relevance using simple keyword matching (deprecated similarity model)"""
        self._initialize_models()
        # Simple keyword-based relevance as fallback
        try:
            question_words = set(question.lower().split())
            answer_words = set(answer.lower().split())
            common_words = question_words.intersection(answer_words)
            # Simple relevance score based on common words
            relevance = min(1.0, len(common_words) / max(1, len(question_words)) * 2)
            return max(0.3, relevance)  # Minimum 0.3 relevance
        except Exception as e:
            logger.error(f"Error calculating relevance: {e}")
            return 0.5

    def _map_sentiment_to_confidence(self, sentiment: dict) -> float:
        """Map sentiment analysis to confidence score"""
        label = sentiment.get('label', 'NEUTRAL').upper()
        score = sentiment.get('score', 0.5)

        if label == 'POSITIVE':
            return min(1.0, score + 0.3)
        elif label == 'NEGATIVE':
            return max(0.0, score - 0.3)
        else:
            return 0.5

    def _analyze_behavioral_depth(self, answer: str) -> float:
        """Analyze depth of behavioral response"""
        word_count = len(answer.split())

        # Check for specific examples and details
        has_specifics = len(re.findall(r'\b\d+\b|\b[A-Z][a-z]+\b.*\b\d{4}\b', answer)) > 0
        has_metrics = len(re.findall(r'\d+%|\d+ people|\$\d+', answer)) > 0
        has_outcomes = len(re.findall(r'result|outcome|achieved|improved|increased|decreased', answer.lower())) > 0

        depth_score = min(word_count / 100, 1.0)
        if has_specifics:
            depth_score += 0.2
        if has_metrics:
            depth_score += 0.2
        if has_outcomes:
            depth_score += 0.1

        return min(depth_score, 1.0)

    def _detect_star_method(self, answer: str) -> float:
        """Detect usage of STAR method (Situation, Task, Action, Result)"""
        answer_lower = answer.lower()

        situation_keywords = ['situation', 'background', 'context', 'when', 'at that time']
        task_keywords = ['task', 'responsibility', 'role', 'expected to', 'needed to']
        action_keywords = ['action', 'did', 'implemented', 'used', 'applied', 'took']
        result_keywords = ['result', 'outcome', 'achieved', 'learned', 'improved']

        star_components = 0
        if any(word in answer_lower for word in situation_keywords):
            star_components += 1
        if any(word in answer_lower for word in task_keywords):
            star_components += 1
        if any(word in answer_lower for word in action_keywords):
            star_components += 1
        if any(word in answer_lower for word in result_keywords):
            star_components += 1

        return star_components / 4.0  # Normalize to 0-1

    def _analyze_speech_metrics(self, metrics: dict) -> dict:
        """Analyze speech metrics from frontend"""
        # Extract metrics with defaults
        filler_words = metrics.get('filler_words', 0)
        pause_count = metrics.get('pause_count', 0)
        speech_rate = metrics.get('speech_rate', 150)  # words per minute
        eye_contact = metrics.get('eye_contact', 0.7)  # ratio

        # Calculate communication score
        comm_score = 1.0
        comm_score -= min(filler_words * 0.03, 0.3)  # Deduct for filler words
        comm_score -= min(pause_count * 0.02, 0.2)   # Deduct for excessive pauses

        # Adjust for speech rate (ideal: 140-160 wpm)
        if speech_rate < 100:
            comm_score -= 0.1
        elif speech_rate > 200:
            comm_score -= 0.1

        comm_score = max(0, min(comm_score, 1.0))

        # Calculate overall speech score
        speech_score = (comm_score + eye_contact) / 2

        return {
            'communication': comm_score,
            'eye_contact': eye_contact,
            'speech_rate': speech_rate,
            'filler_words': filler_words,
            'pause_count': pause_count,
            'overall': speech_score
        }

    def _generate_behavioral_feedback(self, score: float, answer: str, star_score: float, speech_metrics: dict) -> str:
        """Generate behavioral feedback based on score and analysis"""
        feedback_parts = []

        if score >= 80:
            feedback_parts.append("Excellent behavioral response with strong examples and clear communication.")
        elif score >= 60:
            feedback_parts.append("Good behavioral understanding, consider adding more specific examples.")
        else:
            feedback_parts.append("Focus on using the STAR method (Situation, Task, Action, Result) for clearer behavioral responses.")

        # STAR method specific feedback
        if star_score < 0.5:
            feedback_parts.append("Try structuring your answer using the STAR method: describe the Situation, your Task, the Actions you took, and the Results achieved.")
        elif star_score >= 0.75:
            feedback_parts.append("Great use of the STAR method in your response!")

        # Speech metrics feedback
        if speech_metrics['communication'] < 0.7:
            feedback_parts.append("Try to reduce filler words and speak more fluently.")
        if speech_metrics['eye_contact'] < 0.6:
            feedback_parts.append("Work on maintaining better eye contact with the camera.")

        # Specific improvement suggestions
        if len(answer.split()) < 50:
            feedback_parts.append("Consider providing more detail in your behavioral responses.")

        return " ".join(feedback_parts) if feedback_parts else "Good communication and confidence levels."
