import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions
export interface InterviewProfile {
  role: string;
  experience_level: string;
  resume_text?: string;
}

export interface AnswerSubmission {
  session_id: string;
  question_index: number;
  answer_text: string;
  behavioral_metrics?: any;
}

export interface AnalysisResult {
  technical_score: number;
  behavioral_score: number;
  feedback: string;
  suggestions: string[];
}

export const apiService = {
  startInterview: async (profile: any) => {
    const response = await api.post('/api/v1/interview/start', profile);
    return response.data;
  },

  submitAnswer: async (sessionId: string, answer: string) => {
    const response = await api.post('/api/v1/interview/submit-answer', {
      session_id: sessionId,
      answer_text: answer,
    });
    return response.data;
  },

  endInterview: async (sessionId: string) => {
    const response = await api.post(`/api/v1/interview/${sessionId}/complete`);
    return response.data;
  },

  getReport: async (sessionId: string) => {
    const response = await api.get(`/api/v1/reports/${sessionId}`);
    return response.data;
  },
};

export const interviewApi = {
  startInterview: async (profile: InterviewProfile) => {
    const response = await api.post('/api/v1/interview/start', profile);
    return response.data;
  },

  getNextQuestion: async (sessionId: string) => {
    const response = await api.get(`/api/v1/interview/${sessionId}/next-question`);
    return response.data;
  },

  submitAnswer: async (submission: AnswerSubmission) => {
    const response = await api.post('/api/v1/interview/submit-answer', submission);
    return response.data;
  },

  completeInterview: async (sessionId: string) => {
    const response = await api.post(`/api/v1/interview/${sessionId}/complete`);
    return response.data;
  },

  listReports: async () => {
    const response = await api.get('/api/v1/reports');
    return response.data;
  },
};

export { api };
