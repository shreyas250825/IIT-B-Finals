# TODO: Implement OpenRouter Fixes

## FIX 1: HARD FAIL IF QUESTIONS ARE NOT AI-GENERATED
- Update generate_questions_from_profile() to fail loudly instead of silent fallback
- Add error prints for empty text, non-list parsed, less than 7 questions
- Return empty list on failures

## FIX 2: FORCE STRICT JSON FROM OPENROUTER
- Replace system_prompt completely with STRICT JSON GENERATOR prompt
- Prepend user_prompt with "BEGIN_NOW\n"

## FIX 3: PASS RESUME PROJECTS PROPERLY
- Update profile_json to include projects, technologies, tools, education
- Add MANDATORY instruction in user_prompt for at least 4 questions referencing projects

## FIX 4: DO THE SAME FOR EVALUATION (NO SILENT 70s)
- Update evaluate_answer() to fail loudly
- Add error prints for empty text and non-JSON parsed
- Return low scores on failure

## FIX 5: STOP CALLING FALLBACK QUESTIONS DURING DEMO
- Update interview_routes.py start() to raise HTTPException if no questions generated
- Remove fallback question generation for IIT Bombay demo
