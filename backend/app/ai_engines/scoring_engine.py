# backend/app/ai_engines/scoring_engine.py
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import numpy as np

class ScoringEngine:
    def __init__(self):
        # Use small models for CPU compatibility
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        self.similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def analyze_technical(self, question: str, answer: str):
        """Analyze technical content of answer"""
        self._initialize_models()

        # Calculate relevance
        relevance_score = self._calculate_relevance(question, answer)

        # Analyze sentiment/confidence
        if self.sentiment_analyzer:
            sentiment = self.sentiment_analyzer(answer[:512])[0]
            confidence_score = 0.8 if sentiment['label'] == 'POSITIVE' else 0.4
        else:
            confidence_score = 0.5

        # Simple technical depth heuristic
        tech_depth = min(len(answer.split()) / 100, 1.0)

        # Combined technical score
        technical_score = (
            relevance_score * 0.5 +
            tech_depth * 0.3 +
            confidence_score * 0.2
        ) * 100

        return {
            "score": round(technical_score, 2),
            "relevance_score": round(relevance_score * 100, 2),
            "depth_score": round(tech_depth * 100, 2),
            "confidence_score": round(confidence_score * 100, 2),
            "feedback": self._generate_technical_feedback(technical_score, len(answer.split()))
        }
    
    def _calculate_relevance(self, question: str, answer: str) -> float:
        """Calculate relevance using sentence embeddings"""
        self._initialize_models()
        if not self.similarity_model:
            return 0.5

        try:
            question_embedding = self.similarity_model.encode(question)
            answer_embedding = self.similarity_model.encode(answer)

            similarity = np.dot(question_embedding, answer_embedding) / (
                np.linalg.norm(question_embedding) * np.linalg.norm(answer_embedding)
            )
            return max(0, float(similarity))
        except:
            return 0.5
    
    def _generate_technical_feedback(self, score: float, word_count: int) -> str:
        """Generate technical feedback based on score"""
        if score >= 80:
            return "Excellent technical depth and relevance to the question."
        elif score >= 60:
            return "Good technical understanding, consider adding more specific examples."
        else:
            return "Focus on providing more detailed technical explanations with concrete examples."