# backend/app/constants.py
from enum import Enum

class InterviewType(str, Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical" 
    MIXED = "mixed"

class InterviewRound(str, Enum):
    HR_ROUND = "hr_round"
    TECHNICAL_ROUND = "technical_round"
    FINAL_ROUND = "final_round"

class Roles(str, Enum):
    SOFTWARE_ENGINEER = "software_engineer"
    FRONTEND_DEVELOPER = "frontend_developer" 
    BACKEND_DEVELOPER = "backend_developer"
    DATA_SCIENTIST = "data_scientist"
    ML_ENGINEER = "ml_engineer"
    PRODUCT_MANAGER = "product_manager"

# Question bank for different roles
QUESTION_BANK = {
    Roles.SOFTWARE_ENGINEER: {
        InterviewType.TECHNICAL: [
            "Explain the concept of object-oriented programming and its main principles.",
            "What are the differences between SQL and NoSQL databases?",
            "How would you optimize a slow database query?",
            "Explain the concept of RESTful APIs and their constraints.",
        ],
        InterviewType.BEHAVIORAL: [
            "Tell me about a challenging project you worked on and how you overcame the challenges.",
            "How do you handle disagreements with team members?",
        ]
    },
    Roles.DATA_SCIENTIST: {
        InterviewType.TECHNICAL: [
            "Explain the bias-variance tradeoff in machine learning.",
            "What's the difference between supervised and unsupervised learning?",
            "How would you handle missing values in a dataset?",
        ],
        InterviewType.BEHAVIORAL: [
            "How do you ensure your models are fair and unbiased?",
            "Describe your process for cleaning and preparing data.",
        ]
    }
}