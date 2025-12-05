import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import ProfileSetup from './components/profile/ProfileSetup';
import InterviewInterface from './components/interview/InterviewInterface';
import FeedbackDashboard from './components/feedback/FeedbackDashboard';
import ReportList from './components/reports/ReportList';
import ReportViewer from './components/reports/ReportViewer';
import Report from './components/reports/Report';
import Dashboard from './components/dashboard/Dashboard';
import AboutPage from './components/about/AboutPage';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/report" 
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute>
              <Layout><ProfileSetup /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interview" 
          element={
            <ProtectedRoute>
              <Layout><InterviewInterface /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <Layout><FeedbackDashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Layout><ReportList /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/:sessionId" 
          element={
            <ProtectedRoute>
              <Layout><ReportViewer /></Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;