# AI Mock Interview Simulator

A comprehensive platform for simulating mock interviews using AI technologies. This project provides an interactive environment for users to practice interviews, receive feedback, and improve their skills through real-time analysis of technical and behavioral performance.

## Features

- **AI-Powered Interview Questions**: Dynamic question generation based on role and experience level
- **Real-time Feedback**: Instant evaluation of answers with detailed scoring
- **Resume Analysis**: Automated parsing and analysis of uploaded resumes
- **Behavioral Assessment**: Facial expression and speech pattern analysis
- **Technical Evaluation**: Code and technical knowledge assessment
- **Adaptive Questioning**: Questions adjust based on user performance
- **Comprehensive Reports**: Detailed feedback with improvement suggestions
- **Video Recording**: Session recording for review and analysis
- **Multi-modal Interface**: Voice and text input options

## Project Status

**Current Completion: 70%**

### ✅ Completed Components
- **Backend Infrastructure**: FastAPI server with SQLAlchemy ORM, database models, and core API endpoints
- **AI Integration**: OpenRouter LLM integration with fallback to local models, question generation service
- **Frontend Foundation**: React TypeScript setup with core components and routing
- **Database Schema**: Complete data models for users, interviews, responses, reports, and resumes
- **Authentication System**: JWT-based middleware and user management
- **API Documentation**: Comprehensive endpoint documentation with OpenAPI/Swagger

### 🔄 In Progress
- **Frontend UI Completion**: Finalizing interview interface and feedback dashboard components
- **Real-time Features**: WebSocket integration for live interview sessions
- **Video Processing**: Camera access and video recording capabilities
- **Testing Suite**: Unit and integration tests for backend services

### 📋 Remaining Tasks
- **Production Deployment**: Docker containerization and production environment setup
- **Performance Optimization**: Caching, database indexing, and API response optimization
- **Security Hardening**: Input validation, rate limiting, and security audits
- **Documentation**: User guides, API documentation, and deployment instructions

*Last updated: Current development phase - Week 2 completion with Week 3 frontend integration in progress*

## Development Timeline

### Week 1: Setup and Architecture Finalization
In Week 1, we will finalize the project architecture and select the appropriate technology stack for backend, frontend, and AI model components. We will define comprehensive system workflow diagrams including data flow, API flow, and AI inference flow. The GitHub repository will be set up with a clear folder structure, complete README.md documentation, and all necessary environment setup files such as requirements.txt, environment.yml, or package.json. Backend scaffolding will be initialized using FastAPI/Flask/Node.js as recommended. Basic database schema and connections will be created for both SQL and NoSQL options. A basic UI wireframe or landing page will be initialized to establish the visual foundation.
Deliverable: Initial architecture document + repository setup submitted for mentor review.

### Week 2: Core AI Model Integration & API Development
Week 2 focuses on implementing the main AI logic that forms the heart of the solution. We will integrate AI model(s) specifically designed for the chosen problem statement, such as Quiz Generator, Mentor Scoring, or AI Mock Interview systems. API endpoints will be built for all core functions including AI inference, data submission, scoring, and evaluation processes. The end-to-end flow from frontend through backend to AI pipeline will be ensured and validated. Internal testing will begin using mock data to verify system functionality.
Deliverable: Functional backend + AI inference pipeline with documented API calls (README/Postman collection).

### Week 3: Frontend and Workflow Integration
During Week 3, we will develop the complete frontend interface and establish seamless connections to all backend APIs. User workflows will be fully implemented, including login processes, quiz participation, video upload capabilities, and interview simulation features. Real-time and asynchronous communication will be integrated using WebSocket connections and audio streaming technologies. AI output visualization will be validated to ensure results, scores, and feedback are displayed clearly and effectively. The system will be made fully responsive with comprehensive error handling implemented throughout.
Deliverable: Fully connected frontend-backend prototype showing end-to-end flow.

## Project Structure

```
ai-mock-interview-simulator/
├── backend/                          # Python FastAPI Backend
│   ├── app/                          # Main application code
│   │   ├── ai_engines/               # AI processing engines
│   │   │   ├── behavioral_engine.py  # Behavioral analysis engine
│   │   │   └── scoring_engine.py     # Technical scoring engine
│   │   ├── middleware/               # FastAPI middleware
│   │   │   ├── auth_middleware.py    # Authentication middleware
│   │   │   └── cors.py               # CORS configuration
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── interview.py          # Interview session model
│   │   │   ├── report.py             # Analysis report model
│   │   │   ├── response.py           # User response model
│   │   │   ├── resume.py             # Resume data model
│   │   │   └── user.py               # User profile model
│   │   ├── routes/                   # API route handlers
│   │   │   ├── health_check.py       # Health check endpoint
│   │   │   ├── interview_routes.py   # Interview management routes
│   │   │   ├── report_routes.py      # Report generation routes
│   │   │   └── resume_routes.py      # Resume processing routes
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── analysis_schema.py    # Analysis data schemas
│   │   │   ├── interview_schema.py   # Interview data schemas
│   │   │   └── user_schema.py        # User data schemas
│   │   ├── services/                 # Business logic services
│   │   │   ├── interview_service.py  # Interview orchestration
│   │   │   ├── llm.py                # LLM integration service
│   │   │   ├── question_service.py   # Question generation service
│   │   │   ├── report_service.py     # Report generation service
│   │   │   ├── resume_service.py     # Resume processing service
│   │   │   └── session_manager.py    # Session management service
│   │   ├── utils/                    # Utility functions
│   │   │   ├── http_utils.py         # HTTP utilities
│   │   │   ├── text_utils.py         # Text processing utilities
│   │   │   └── video_utils.py        # Video processing utilities
│   │   ├── config.py                 # Application configuration
│   │   ├── constants.py              # Application constants
│   │   ├── database.py               # Database configuration
│   │   └── main.py                   # FastAPI application entry point
│   ├── create_tables.py              # Database table creation script
│   ├── interview.db                  # SQLite database file
│   ├── pyproject.toml                # Python project configuration
│   ├── requirements.txt              # Python dependencies
│   └── logs/                         # Application logs directory
├── frontend/                         # React TypeScript Frontend
│   ├── public/                       # Static assets
│   │   └── vite.svg                  # Vite logo
│   ├── src/                          # Source code
│   │   ├── components/               # React components
│   │   │   ├── common/               # Shared components
│   │   │   │   ├── ErrorBoundary.tsx # Error boundary component
│   │   │   │   ├── Footer.tsx         # Footer component
│   │   │   │   ├── LoadingSpinner.tsx # Loading spinner component
│   │   │   │   └── Navbar.tsx         # Navigation bar component
│   │   │   ├── feedback/             # Feedback-related components
│   │   │   │   ├── BehavioralInsights.tsx # Behavioral analysis display
│   │   │   │   ├── FeedbackDashboard.tsx # Main feedback dashboard
│   │   │   │   ├── ImprovementPlan.tsx # Improvement suggestions
│   │   │   │   ├── RadarChart.tsx     # Skills radar chart
│   │   │   │   ├── TechnicalAnalysis.tsx # Technical analysis display
│   │   │   │   └── VideoReplay.tsx    # Video replay component
│   │   │   ├── interview/            # Interview interface components
│   │   │   │   ├── AIAvatar.tsx       # AI avatar component
│   │   │   │   ├── ControlsPanel.tsx  # Interview controls
│   │   │   │   ├── InterviewInterface.tsx # Main interview interface
│   │   │   │   ├── LiveMetrics.tsx    # Real-time metrics display
│   │   │   │   ├── QuestionDisplay.tsx # Question display component
│   │   │   │   └── VideoRecorder.tsx  # Video recording component
│   │   │   ├── landing/              # Landing page components
│   │   │   │   └── LandingPage.tsx    # Main landing page
│   │   │   ├── layout/               # Layout components
│   │   │   │   └── Layout.tsx         # Main layout wrapper
│   │   │   ├── profile/              # Profile setup components
│   │   │   │   ├── ManualSetup.tsx    # Manual profile setup
│   │   │   │   ├── ProfileSetup.tsx   # Profile setup interface
│   │   │   │   ├── ResumeUpload.tsx   # Resume upload component
│   │   │   │   └── RoleSelector.tsx   # Role selection component
│   │   │   └── reports/              # Report components
│   │   │       ├── ComparisonView.tsx # Report comparison view
│   │   │       ├── ReportList.tsx     # Report list component
│   │   │       └── ReportViewer.tsx   # Report viewer component
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAvatar.ts          # Avatar management hook
│   │   │   ├── useFaceTracking.ts    # Face tracking hook
│   │   │   ├── useInterview.ts       # Interview management hook
│   │   │   ├── useSpeech.ts          # Speech recognition hook
│   │   │   └── useWebcam.ts          # Webcam management hook
│   │   ├── services/                 # Service layer
│   │   │   ├── api.ts                # API service functions
│   │   │   ├── llm.ts                # LLM service integration
│   │   │   ├── metrics.ts            # Metrics collection service
│   │   │   └── socket.ts             # WebSocket service
│   │   ├── styles/                   # Stylesheets
│   │   │   ├── animations.css        # Animation styles
│   │   │   ├── components.css        # Component-specific styles
│   │   │   └── globals.css           # Global styles
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.ts          # Application constants
│   │   │   ├── formatters.ts         # Data formatting utilities
│   │   │   └── helpers.ts            # General helper functions
│   │   ├── App.tsx                   # Main React application component
│   │   └── main.tsx                  # React application entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node.js dependencies and scripts
│   ├── postcss.config.js             # PostCSS configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite build configuration
│   └── TODO.md                       # Frontend development tasks
├── docker-compose.dev.yml            # Development Docker Compose
├── docker-compose.prod.yml           # Production Docker Compose
├── Makefile                          # Build automation scripts
├── TODO.md                           # Project-wide development tasks
└── README.md                         # This file
```

## File Details

### Backend Components

#### Core Application (`backend/app/`)
- **`main.py`**: FastAPI application entry point with route registration and middleware setup
- **`config.py`**: Environment-based configuration management
- **`database.py`**: SQLAlchemy database connection and session management
- **`constants.py`**: Application-wide constants and enumerations

#### Models (`backend/app/models/`)
- **`interview.py`**: Interview session data model with relationships
- **`response.py`**: User response storage with analysis data
- **`report.py`**: Generated report storage with detailed metrics
- **`resume.py`**: Resume data extraction and storage
- **`user.py`**: User profile and authentication data

#### API Routes (`backend/app/routes/`)
- **`interview_routes.py`**: Interview lifecycle management (start, submit, complete)
- **`report_routes.py`**: Report generation and retrieval
- **`resume_routes.py`**: Resume upload and processing
- **`health_check.py`**: Application health monitoring

#### Services (`backend/app/services/`)
- **`interview_service.py`**: Core interview orchestration logic
- **`question_service.py`**: Dynamic question generation and management
- **`llm.py`**: Large Language Model integration for AI responses
- **`report_service.py`**: Report generation with analytics
- **`resume_service.py`**: Resume parsing and analysis
- **`session_manager.py`**: Interview session state management

#### AI Engines (`backend/app/ai_engines/`)
- **`scoring_engine.py`**: Technical answer evaluation and scoring
- **`behavioral_engine.py`**: Behavioral analysis from video/audio data

#### Utilities (`backend/app/utils/`)
- **`http_utils.py`**: HTTP request/response utilities
- **`text_utils.py`**: Text processing and analysis functions
- **`video_utils.py`**: Video processing and analysis utilities

### Frontend Components

#### Components (`frontend/src/components/`)
- **Common Components**: Reusable UI elements (LoadingSpinner, ErrorBoundary, Navbar)
- **Interview Components**: Core interview interface (AIAvatar, VideoRecorder, LiveMetrics)
- **Feedback Components**: Analysis display (RadarChart, TechnicalAnalysis, BehavioralInsights)
- **Profile Components**: User setup (ResumeUpload, RoleSelector, ProfileSetup)
- **Report Components**: Report viewing and comparison tools

#### Hooks (`frontend/src/hooks/`)
- **`useInterview.ts`**: Interview state management and API integration
- **`useWebcam.ts`**: Webcam access and video recording
- **`useSpeech.ts`**: Speech recognition and synthesis
- **`useFaceTracking.ts`**: Facial expression analysis
- **`useAvatar.ts`**: AI avatar animation control

#### Services (`frontend/src/services/`)
- **`api.ts`**: REST API client with error handling
- **`llm.ts`**: Frontend LLM service integration
- **`socket.ts`**: Real-time communication via WebSockets
- **`metrics.ts`**: Performance metrics collection

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **AI/ML**: Custom engines for behavioral and technical analysis
- **Authentication**: JWT-based auth middleware
- **API Documentation**: Automatic OpenAPI/Swagger generation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks and context
- **Real-time Features**: WebSocket integration
- **Media Processing**: WebRTC for video/audio

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development/production
- **Build Automation**: Makefile for common tasks

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-mock-interview-simulator
   ```

2. **Install Chrome Extension (Required for Video/Camera)**
   ```bash
   # Load the Chrome extension in developer mode
   # 1. Open Chrome and go to chrome://extensions/
   # 2. Enable "Developer mode" in the top right
   # 3. Click "Load unpacked" and select the chrome-extension folder
   # 4. Note the extension ID from the extension card
   # 5. Update the extensionId in frontend/src/hooks/useWebcam.ts with the actual ID
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python create_tables.py
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   - Copy `.env.example` to `.env` and configure environment variables
   - Set up API keys for AI services (OpenAI, etc.)

5. **Run Development Environment**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose -f docker-compose.dev.yml up

   # Or run manually
   # Backend: cd backend && uvicorn app.main:app --reload
   # Frontend: cd frontend && npm run dev
   ```

### Production Deployment

1. **Build Production Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## API Documentation

### Interview Endpoints (simplified mock-interview flow)

- `POST /api/interview/start` - Start new interview session (returns `session_id` and first `question`)
- `POST /api/interview/answer` - Submit `{ session_id, question_id, transcript, metrics }` for evaluation
- `POST /api/metrics` - (Optional) Push extra metrics blobs
- `GET /api/interview/report/{session_id}` - Get final summary report for a session

### Report Endpoints

- `GET /api/v1/reports` - List user reports
- `GET /api/v1/reports/{session_id}` - Get specific report

### Resume Endpoints

- `POST /api/v1/resume/upload` - Upload resume for analysis
- `GET /api/v1/resume/{id}` - Get resume analysis

## Usage

1. **User Registration**: Create account and set up profile
2. **Resume Upload**: Upload resume for initial analysis
3. **Interview Setup**: Select role and experience level
4. **Interview Session**: Answer AI-generated questions
5. **Real-time Feedback**: Receive immediate analysis and suggestions
6. **Final Report**: Review comprehensive performance report

## Development

### Running Tests
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

### Code Quality
```bash
# Backend linting
cd backend && flake8

# Frontend linting
cd frontend && npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure cross-browser compatibility

## License

This project is under the GUVI HCL and IIT Bombay.

## Acknowledgments

- Built with FastAPI and React
- AI capabilities powered by Hugging Face Transformer models
- UI components styled with Tailwind CSS
- Icons from Lucide React
