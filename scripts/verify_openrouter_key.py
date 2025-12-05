#!/usr/bin/env python3
"""
Quick script to verify OpenRouter API key is loaded correctly.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import get_settings
from app.ai_engines.openrouter_engine import OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_BASE

print("=" * 60)
print("OpenRouter Configuration Check")
print("=" * 60)

settings = get_settings()

print(f"\n📋 Settings from config.py:")
print(f"   OPENROUTER_API_KEY: {'✅ Set' if settings.OPENROUTER_API_KEY else '❌ Not set'}")
print(f"   OPENROUTER_MODEL: {settings.OPENROUTER_MODEL}")
print(f"   OPENROUTER_BASE: {settings.OPENROUTER_BASE}")

print(f"\n🔑 OpenRouter Engine Configuration:")
print(f"   OPENROUTER_API_KEY: {'✅ Set' if OPENROUTER_API_KEY else '❌ Not set'}")
if OPENROUTER_API_KEY:
    # Show first 10 chars and last 4 chars for security
    masked_key = OPENROUTER_API_KEY[:10] + "..." + OPENROUTER_API_KEY[-4:] if len(OPENROUTER_API_KEY) > 14 else "***"
    print(f"   Key preview: {masked_key}")
print(f"   OPENROUTER_MODEL: {OPENROUTER_MODEL}")
print(f"   OPENROUTER_BASE: {OPENROUTER_BASE}")

print(f"\n🌍 Environment Variables:")
env_key = os.getenv("OPENROUTER_API_KEY")
print(f"   os.getenv('OPENROUTER_API_KEY'): {'✅ Set' if env_key else '❌ Not set'}")

print("\n" + "=" * 60)
if OPENROUTER_API_KEY:
    print("✅ OpenRouter is properly configured!")
    print("=" * 60)
    sys.exit(0)
else:
    print("❌ OpenRouter API key is missing!")
    print("\n💡 Make sure you have OPENROUTER_API_KEY in:")
    print("   - ai-mock-interview-simulator/.env (project root)")
    print("   - Or backend/.env")
    print("   - Or as an environment variable")
    print("=" * 60)
    sys.exit(1)

