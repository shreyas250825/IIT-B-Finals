# OpenRouter Migration Guide

## Overview
This backend has been migrated from HuggingFace Transformers to OpenRouter API using Amazon Nova-2-Lite model.

## Environment Variables

Add these to your `.env` file:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=amazon/nova-2-lite-v1:free
OPENROUTER_BASE=https://api.openrouter.ai/v1/chat/completions
```

## Changes Made

### ✅ Created Files
- `backend/app/ai_engines/openrouter_engine.py` - Main OpenRouter integration
- `backend/data/demos/questions_fallback.json` - Fallback questions template
- `scripts/test_openrouter.py` - Test script for OpenRouter functions

### ✅ Modified Files
- `backend/app/ai_engines/cloud_llm_engine.py` - Now delegates to OpenRouter
- `backend/app/routes/interview_routes.py` - Uses OpenRouter for evaluation and reports
- `backend/app/config.py` - Added OpenRouter configuration
- `backend/requirements.txt` - Removed HuggingFace dependencies

### ✅ Deprecated Files (Still Present for Compatibility)
- `backend/app/services/llm.py` - Marked as deprecated, uses fallbacks
- `backend/app/ai_engines/scoring_engine.py` - Marked as deprecated
- `backend/app/ai_engines/behavioral_engine.py` - Marked as deprecated

## API Functions

### `generate_questions_from_profile(profile, persona, interview_type)`
- Generates exactly 7 questions
- Returns: List of question dicts with id, text, followups, type, difficulty, expected_keywords, expected_length

### `evaluate_answer(question_text, transcript, expected_keywords, profile)`
- Evaluates answer quality
- Returns: Dict with technical, communication, confidence, relevance (0-100), short_notes

### `improve_answer(question_text, transcript, profile)`
- Generates improved version
- Returns: String (40-70 words)

### `generate_final_report(session_data)`
- Generates comprehensive report
- Returns: Dict with overall_summary, technical_strengths, technical_gaps, scores, recommendations

## Testing

Run the test script:
```bash
python scripts/test_openrouter.py
```

## Token Optimization

- Question generation: max_tokens=600, temperature=0.0
- Evaluation: max_tokens=200, temperature=0.0
- Improvement: max_tokens=150, temperature=0.3
- Report: max_tokens=300, temperature=0.2

## Caching

All API calls are cached for 1 hour using SHA256 hash of messages.

## Fallbacks

If OpenRouter fails:
- Questions: Uses `data/demos/questions_fallback.json` or hardcoded template
- Evaluation: Returns baseline scores (70/70/70/70)
- Improvement: Returns original answer
- Report: Generates simple summary from averages

