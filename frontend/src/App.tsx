import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';
import ProfileSetup from './components/profile/ProfileSetup';
import InterviewInterface from './components/interview/InterviewInterface';
import FeedbackDashboard from './components/feedback/FeedbackDashboard';
import ReportList from './components/reports/ReportList';
import ReportViewer from './components/reports/ReportViewer';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<ProfileSetup />} />
          <Route path="/interview" element={<InterviewInterface />} />
          <Route path="/feedback" element={<FeedbackDashboard />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:sessionId" element={<ReportViewer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;