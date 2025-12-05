#!/usr/bin/env python3
"""
Test script for OpenRouter integration.
Tests question generation, evaluation, and report generation.
"""
import sys
import os
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.ai_engines.openrouter_engine import (
    generate_questions_from_profile,
    evaluate_answer,
    improve_answer,
    generate_final_report
)


def test_question_generation():
    """Test Q-gen → must return 7 items"""
    print("🧪 Testing Question Generation...")
    
    profile = {
        "role": "Software Engineer",
        "estimated_role": "Software Engineer",
        "skills": ["Python", "JavaScript", "React", "Node.js"],
        "experience": {
            "level": "Mid-Level",
            "years_experience": 3
        }
    }
    
    questions = generate_questions_from_profile(profile, "male", "technical")
    
    assert len(questions) == 7, f"Expected 7 questions, got {len(questions)}"
    assert all("id" in q for q in questions), "All questions must have 'id'"
    assert all("text" in q for q in questions), "All questions must have 'text'"
    assert all("difficulty" in q for q in questions), "All questions must have 'difficulty'"
    
    print(f"✅ Question generation passed: {len(questions)} questions generated")
    print(f"   Sample question: {questions[0]['text'][:50]}...")
    return True


def test_evaluation():
    """Test evaluation → must return all 5 scores"""
    print("\n🧪 Testing Answer Evaluation...")
    
    profile = {
        "role": "Software Engineer",
        "skills": ["Python", "JavaScript"]
    }
    
    question_text = "Tell me about yourself."
    transcript = "I'm a software engineer with 3 years of experience in Python and JavaScript."
    expected_keywords = ["experience", "background", "skills"]
    
    result = evaluate_answer(question_text, transcript, expected_keywords, profile)
    
    required_keys = ["technical", "communication", "confidence", "relevance", "short_notes"]
    for key in required_keys:
        assert key in result, f"Missing key: {key}"
        if key != "short_notes":
            assert isinstance(result[key], int), f"{key} must be int"
            assert 0 <= result[key] <= 100, f"{key} must be 0-100"
    
    print(f"✅ Evaluation passed: All scores present")
    print(f"   Technical: {result['technical']}, Communication: {result['communication']}")
    return True


def test_report():
    """Test report → JSON with summary + recommendations"""
    print("\n🧪 Testing Final Report Generation...")
    
    session_data = {
        "questions": [
            {"id": "q1", "text": "Tell me about yourself."},
            {"id": "q2", "text": "Describe a project."}
        ],
        "evaluations": [
            {"technical": 85, "communication": 80, "confidence": 75, "relevance": 82, "short_notes": "Good answer"},
            {"technical": 90, "communication": 85, "confidence": 80, "relevance": 88, "short_notes": "Excellent"}
        ],
        "answers": [
            {"question_id": "q1", "transcript": "I'm a software engineer..."},
            {"question_id": "q2", "transcript": "I built a web app..."}
        ]
    }
    
    report = generate_final_report(session_data)
    
    required_keys = [
        "overall_summary",
        "technical_strengths",
        "technical_gaps",
        "communication_score",
        "behavioral_score",
        "improved_answers",
        "recommendations"
    ]
    
    for key in required_keys:
        assert key in report, f"Missing key: {key}"
    
    assert isinstance(report["overall_summary"], str), "overall_summary must be string"
    assert isinstance(report["technical_strengths"], list), "technical_strengths must be list"
    assert isinstance(report["recommendations"], list), "recommendations must be list"
    
    print(f"✅ Report generation passed")
    print(f"   Summary: {report['overall_summary'][:60]}...")
    return True


def main():
    """Run all tests"""
    print("=" * 60)
    print("OpenRouter Integration Tests")
    print("=" * 60)
    
    try:
        test_question_generation()
        test_evaluation()
        test_report()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

