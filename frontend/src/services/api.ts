import axios from 'axios';

// For development, use localhost:8000, for production use Render URL
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  return 'https://iit-b-finals.onrender.com';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { API_BASE_URL };

// Existing types and clients (kept for compatibility with other screens)
export interface InterviewProfile {
  role: string;
  interview_type: string;
  round_type: string;
  resume_data?: any;
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
    const response = await fetch(`${BASE}/api/interview/reports`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }
    return response.json();
  },
};

export { api };

// New lightweight REST helpers for the simplified interview flow

const BASE = API_BASE_URL;

export async function startInterviewSimple(profile: any, role?: string, interviewType?: string, persona?: string) {
  const body = {
    profile,
    role: role || profile?.role || profile?.estimated_role,
    interview_type: interviewType || profile?.interview_type || 'mixed',
    persona: persona || profile?.persona || 'male',
  };
  const res = await fetch(`${BASE}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to start interview: ${res.status}`);
  }
  return res.json();
}

export async function submitAnswerSimple(payload: {
  session_id: string;
  question_id: string;
  transcript: string;
  metrics: any;
}) {
  const res = await fetch(`${BASE}/api/interview/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit answer: ${res.status}`);
  }
  return res.json();
}

export async function sendMetricsSimple(metrics: any) {
  await fetch(`${BASE}/api/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });
}

export async function getReportSimple(sessionId: string) {
  const res = await fetch(`${BASE}/api/interview/report/${sessionId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch report: ${res.status}`);
  }
  return res.json();
}
