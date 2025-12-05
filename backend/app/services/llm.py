# backend/app/services/llm.py
# DEPRECATED: This service used HuggingFace transformers.
# Now using OpenRouter via openrouter_engine.py
# Keeping for backward compatibility but models are not initialized.

# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# import torch
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # self.device = "cuda" if torch.cuda.is_available() else "cpu"  # Deprecated
        self.device = "cpu"  # Placeholder
        self.model = None
        self.tokenizer = None
        self.sentiment_analyzer = None
        self.summarizer = None
        self._initialized = False

    def _initialize_models(self):
        """DEPRECATED: Models no longer initialized - using OpenRouter instead"""
        if self._initialized:
            return
        
        logger.warning("LLMService._initialize_models() called but HuggingFace models are deprecated. Using OpenRouter instead.")
        self._initialized = True  # Mark as initialized to prevent repeated warnings

    def generate_interviewer_response(self, question: str, candidate_answer: str, conversation_history: list = None) -> str:
        """DEPRECATED: Use OpenRouter engine instead"""
        logger.warning("LLMService.generate_interviewer_response() is deprecated. Use OpenRouter engine.")
        return "Thank you for sharing that. Let's continue with the next question."

    def generate_question(self, role: str, difficulty: str = "intermediate", topic: Optional[str] = None) -> str:
        """DEPRECATED: Use OpenRouter engine instead"""
        logger.warning("LLMService.generate_question() is deprecated. Use OpenRouter engine.")
        return f"Can you tell me about your experience with {role} related technologies?"

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """DEPRECATED: Basic sentiment analysis fallback"""
        logger.warning("LLMService.analyze_sentiment() is deprecated. Using basic fallback.")
        # Simple fallback - check for positive/negative words
        text_lower = text.lower()
        positive_words = ['good', 'great', 'excellent', 'success', 'achieved', 'improved']
        negative_words = ['bad', 'failed', 'difficult', 'challenge', 'problem', 'issue']
        
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return {"label": "POSITIVE", "score": 0.7, "confidence": 0.7}
        elif neg_count > pos_count:
            return {"label": "NEGATIVE", "score": 0.3, "confidence": 0.3}
        else:
            return {"label": "NEUTRAL", "score": 0.5, "confidence": 0.5}

    def generate_feedback_summary(self, responses: list) -> str:
        """DEPRECATED: Use OpenRouter generate_final_report instead"""
        logger.warning("LLMService.generate_feedback_summary() is deprecated. Use OpenRouter generate_final_report.")
        return "Your interview responses showed good effort. Focus on providing detailed, specific examples to strengthen your answers."

    def generate_improvement_suggestions(self, weak_areas: list) -> list:
        """DEPRECATED: Use OpenRouter generate_final_report instead"""
        logger.warning("LLMService.generate_improvement_suggestions() is deprecated. Use OpenRouter generate_final_report.")
        # Return fallback suggestions
        return [
            "Practice speaking clearly and at a moderate pace",
            "Prepare specific examples from your past experience",
            "Research the company and role thoroughly before interviews",
            "Use the STAR method (Situation, Task, Action, Result) for behavioral questions"
        ]

# Global instance
llm_service = LLMService()
