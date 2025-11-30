# TODO for AI Mock Interview Simulator Setup

- [x] Create all necessary subdirectories using Windows md command
- [x] Create root-level files: README.md, .gitignore, .env.example, docker-compose.dev.yml, docker-compose.prod.yml, Makefile
- [x] Create backend-level files: create_tables.py, interview.db, render.yaml, requirements.txt, start.sh, pyproject.toml
- [x] Create app/__init__.py
- [x] Create app/main.py with basic FastAPI app
- [x] Create app/config.py with basic settings
- [x] Create app/constants.py (empty)
- [x] Create app/database.py with basic SQLAlchemy setup
- [x] Create routes/__init__.py and all route files: interview_routes.py, resume_routes.py, report_routes.py, auth_routes.py, health_check.py
- [x] Create services/__init__.py and all service files: interview_service.py, question_service.py, resume_service.py, evaluation_service.py, report_service.py, session_manager.py
- [x] Create ai_engines/__init__.py and all engine files: cloud_llm_engine.py, stt_engine.py, behavioral_engine.py, scoring_engine.py, adaptive_engine.py, improvement_engine.py
- [x] Create models/__init__.py and all model files: user.py, interview.py, resume.py, response.py, report.py, metrics.py
- [x] Create schemas/__init__.py and all schema files: user_schema.py, interview_schema.py, resume_schema.py, analysis_schema.py
- [x] Create middleware/__init__.py and all middleware files: cors.py, auth_middleware.py, rate_limiter.py
- [x] Create utils/__init__.py and all util files: http_utils.py, text_utils.py, audio_utils.py, video_utils.py, cache.py
- [x] Verify the folder structure matches the specification
