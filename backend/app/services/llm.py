# backend/app/services/llm.py
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models = {}
        self._initialized = False

    def _initialize_models(self):
        """Lazy initialization of Hugging Face models"""
        if self._initialized:
            return

        try:
            logger.info("Initializing LLM models... This may take a few minutes on first run.")

            # Text generation model for interview responses
            self.models['text_generator'] = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                device=0 if self.device == "cuda" else -1,
                max_length=100,
                temperature=0.7,
                do_sample=True,
                pad_token_id=50256
            )

            # Question generation model
            self.models['question_generator'] = pipeline(
                "text2text-generation",
                model="google/flan-t5-base",
                device=0 if self.device == "cuda" else -1,
                max_length=200
            )

            # Sentiment analysis for feedback
            self.models['sentiment_analyzer'] = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if self.device == "cuda" else -1
            )

            # Summarization for report generation
            self.models['summarizer'] = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if self.device == "cuda" else -1
            )

            self._initialized = True
            logger.info(f"LLM models initialized successfully on {self.device}")

        except Exception as e:
            logger.error(f"Failed to initialize LLM models: {e}")
            raise

    def generate_interview_response(self, question: str, context: Optional[str] = None) -> str:
        """Generate AI interview response to user answers"""
        try:
            self._initialize_models()
            prompt = f"Question: {question}\n"
            if context:
                prompt += f"Context: {context}\n"
            prompt += "Response:"

            result = self.models['text_generator'](prompt, max_length=150, num_return_sequences=1)
            response = result[0]['generated_text'].split("Response:")[-1].strip()

            return response

        except Exception as e:
            logger.error(f"Failed to generate interview response: {e}")
            return "I understand your answer. Let's continue with the next question."

    def generate_question(self, role: str, difficulty: str = "intermediate", topic: Optional[str] = None) -> str:
        """Generate interview questions using Hugging Face"""
        try:
            self._initialize_models()
            prompt = f"Generate a {difficulty} level interview question for a {role} position"
            if topic:
                prompt += f" about {topic}"

            result = self.models['question_generator'](prompt, max_length=100)
            question = result[0]['generated_text'].strip()

            return question

        except Exception as e:
            logger.error(f"Failed to generate question: {e}")
            return f"Can you tell me about your experience with {role} related technologies?"

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of user responses"""
        try:
            self._initialize_models()
            result = self.models['sentiment_analyzer'](text)
            sentiment = result[0]

            return {
                "label": sentiment['label'],
                "score": sentiment['score'],
                "confidence": sentiment['score']
            }

        except Exception as e:
            logger.error(f"Failed to analyze sentiment: {e}")
            return {
                "label": "NEUTRAL",
                "score": 0.5,
                "confidence": 0.5
            }

    def generate_feedback_summary(self, responses: list) -> str:
        """Generate summary feedback from multiple responses"""
        try:
            self._initialize_models()
            # Combine all responses
            combined_text = " ".join([r.get('answer', '') for r in responses if r.get('answer')])

            if len(combined_text) < 50:
                return "Based on your responses, you demonstrated good communication skills. Consider providing more specific examples in future interviews."

            # Summarize the combined responses
            result = self.models['summarizer'](
                combined_text,
                max_length=150,
                min_length=50,
                do_sample=False
            )

            summary = result[0]['summary_text']
            return f"Summary of your interview performance: {summary}"

        except Exception as e:
            logger.error(f"Failed to generate feedback summary: {e}")
            return "Your interview responses showed good effort. Focus on providing detailed, specific examples to strengthen your answers."

    def generate_improvement_suggestions(self, weak_areas: list) -> list:
        """Generate specific improvement suggestions"""
        suggestions = []

        try:
            for area in weak_areas:
                prompt = f"Provide one specific suggestion to improve {area} in job interviews"

                result = self.models['question_generator'](prompt, max_length=50)
                suggestion = result[0]['generated_text'].strip()

                if suggestion and len(suggestion) > 10:
                    suggestions.append(suggestion)

        except Exception as e:
            logger.error(f"Failed to generate improvement suggestions: {e}")

        # Fallback suggestions if model fails
        if not suggestions:
            suggestions = [
                "Practice speaking clearly and at a moderate pace",
                "Prepare specific examples from your past experience",
                "Research the company and role thoroughly before interviews",
                "Use the STAR method (Situation, Task, Action, Result) for behavioral questions"
            ]

        return suggestions

# Global instance
llm_service = LLMService()
