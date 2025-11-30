# backend/app/ai_engines/behavioral_engine.py
class BehavioralEngine:
    def __init__(self):
        pass
    
    def analyze_behavioral(self, metrics: dict):
        """Analyze behavioral metrics from frontend"""
        # Default scores if no metrics provided
        if not metrics:
            return {
                "communication_score": 70.0,
                "confidence_score": 70.0,
                "feedback": "No behavioral metrics available for analysis."
            }
        
        # Extract metrics with defaults
        filler_words = metrics.get('filler_words', 0)
        pause_count = metrics.get('pause_count', 0)
        speech_rate = metrics.get('speech_rate', 150)  # words per minute
        eye_contact = metrics.get('eye_contact', 0.7)  # ratio
        
        # Calculate communication score
        comm_score = 100
        comm_score -= min(filler_words * 3, 30)  # Deduct for filler words
        comm_score -= min(pause_count * 2, 20)   # Deduct for excessive pauses
        
        # Adjust for speech rate (ideal: 140-160 wpm)
        if speech_rate < 100:
            comm_score -= 10
        elif speech_rate > 200:
            comm_score -= 10
        
        # Calculate confidence score
        conf_score = 50  # Base
        conf_score += eye_contact * 50  # Eye contact contributes up to 50 points
        
        return {
            "communication_score": max(0, min(comm_score, 100)),
            "confidence_score": max(0, min(conf_score, 100)),
            "metrics_analyzed": {
                "filler_words": filler_words,
                "pause_count": pause_count,
                "speech_rate": speech_rate,
                "eye_contact": eye_contact
            },
            "feedback": self._generate_behavioral_feedback(comm_score, conf_score)
        }
    
    def _generate_behavioral_feedback(self, comm_score: float, conf_score: float) -> str:
        """Generate behavioral feedback"""
        feedback = []
        
        if comm_score < 70:
            feedback.append("Try to reduce filler words and speak more fluently.")
        elif comm_score > 85:
            feedback.append("Excellent communication skills and fluency.")
        
        if conf_score < 70:
            feedback.append("Work on maintaining better eye contact and confident posture.")
        elif conf_score > 85:
            feedback.append("Great confidence and engagement during speaking.")
        
        return " ".join(feedback) if feedback else "Good communication and confidence levels."