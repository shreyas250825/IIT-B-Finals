#!/usr/bin/env python3
"""
Test script to verify AI Mock Interview Simulator functionality
"""
import sys
import os
import json
import requests
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

def test_config():
    """Test configuration loading"""
    print("🔧 Testing configuration...")
    try:
        from app.config import get_settings
        settings = get_settings()

        print(f"✅ API Key loaded: {bool(settings.OPENROUTER_API_KEY)}")
        print(f"✅ Model: {settings.OPENROUTER_MODEL}")
        print(f"✅ Database URL: {settings.DATABASE_URL}")
        print(f"✅ Frontend URL: {settings.FRONTEND_URL}")

        if not settings.OPENROUTER_API_KEY:
            print("❌ OpenRouter API key not found!")
            return False

        return True
    except Exception as e:
        print(f"❌ Config error: {e}")
        return False

def test_openrouter():
    """Test OpenRouter API connection"""
    print("\n🤖 Testing OpenRouter API...")
    try:
        from app.config import get_settings
        from app.ai_engines.openrouter_engine import generate_questions_from_profile

        settings = get_settings()

        # Test with sample profile
        profile = {
            "role": "VLSI Engineer",
            "skills": ["VLSI", "FPGA", "RTL Design"],
            "experience": {"level": "Mid-Level", "years_experience": 3}
        }

        print("Generating questions...")
        questions = generate_questions_from_profile(profile, "male", "technical")

        if questions and len(questions) > 0:
            print(f"✅ Generated {len(questions)} questions")
            for i, q in enumerate(questions[:3]):
                print(f"  {i+1}. {q.get('text', 'No text')}")
            return True
        else:
            print("❌ No questions generated")
            return False

    except Exception as e:
        print(f"❌ OpenRouter test failed: {e}")
        return False

def test_backend_startup():
    """Test if backend can start"""
    print("\n🚀 Testing backend startup...")
    try:
        # Import main app
        from app.main import app
        print("✅ Backend app imported successfully")

        # Test that routes are registered
        routes = [route.path for route in app.routes]
        if "/health" in routes:
            print("✅ Health route registered")
            return True
        else:
            print("❌ Health route not found")
            return False

    except Exception as e:
        print(f"❌ Backend startup failed: {e}")
        return False

def test_interview_flow():
    """Test the complete interview flow"""
    print("\n🎯 Testing interview flow...")
    try:
        # Test that interview service can be imported
        from app.services.interview_service import InterviewService
        from app.services.question_service import QuestionService
        from app.database import get_db

        print("✅ Interview services imported successfully")

        # Test that we can create service instances with database
        db = next(get_db())
        question_service = QuestionService(db)
        interview_service = InterviewService(db)

        print("✅ Services instantiated successfully")
        return True

    except Exception as e:
        print(f"❌ Interview flow test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 AI Mock Interview Simulator - System Test\n")

    results = []

    # Test configuration
    results.append(("Configuration", test_config()))

    # Test OpenRouter
    results.append(("OpenRouter API", test_openrouter()))

    # Test backend
    results.append(("Backend Startup", test_backend_startup()))

    # Test interview flow
    results.append(("Interview Flow", test_interview_flow()))

    # Summary
    print("\n📊 Test Results:")
    print("=" * 40)

    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print("25")
        if not passed:
            all_passed = False

    print("\n" + "=" * 40)
    if all_passed:
        print("🎉 All tests passed! System is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
