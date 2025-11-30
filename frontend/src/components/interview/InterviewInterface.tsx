// src/components/interview/InterviewInterface.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../../hooks/useInterview';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeech } from '../../hooks/useSpeech';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import AIAvatar from './AIAvatar';
import VideoRecorder from './VideoRecorder';
import LiveMetrics from './LiveMetrics';
import QuestionDisplay from './QuestionDisplay';
import ControlsPanel from './ControlsPanel';
import LoadingSpinner from '../common/LoadingSpinner';

const InterviewInterface: React.FC = () => {
  const navigate = useNavigate();
  
  // Hooks
  const interview = useInterview();
  const webcam = useWebcam();
  const speech = useSpeech();
  const faceTracking = useFaceTracking();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewStage, setInterviewStage] = useState<'not-started' | 'question' | 'answering' | 'analysis'>('not-started');

  // Load profile from localStorage
  useEffect(() => {
    const profile = localStorage.getItem('interviewProfile');
    if (!profile) {
      navigate('/setup');
      return;
    }

    // Start interview with profile
    const startInterviewWithProfile = async () => {
      try {
        await interview.startInterview(JSON.parse(profile));
        await webcam.startWebcam();
        faceTracking.startTracking();
        setInterviewStage('question');
        await getNextQuestion();
      } catch (error) {
        console.error('Failed to start interview:', error);
      }
    };

    startInterviewWithProfile();
  }, []);

  // Get next question
  const getNextQuestion = async () => {
    setInterviewStage('question');
    setCurrentAnswer('');
    speech.clearTranscript();
    
    try {
      const questionData = await interview.getNextQuestion();
      await speech.speak(questionData.question);
    } catch (error) {
      console.error('Failed to get next question:', error);
    }
  };

  // Start answering
  const startAnswering = () => {
    setInterviewStage('answering');
    webcam.startRecording();
    speech.startListening();
  };

  // Submit answer
  const submitAnswer = async () => {
    setInterviewStage('analysis');
    webcam.stopRecording();
    speech.stopListening();

    try {
      const answerText = currentAnswer || speech.transcript;
      const behavioralMetrics = faceTracking.getMetrics();
      
      await interview.submitAnswer(answerText, behavioralMetrics);
      
      // Check if we should continue or end interview
      if (interview.currentQuestionIndex >= 4) { // 5 questions total
        await interview.completeInterview();
        navigate(`/feedback/${interview.sessionId}`);
      } else {
        // Continue to next question after a delay
        setTimeout(() => {
          getNextQuestion();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // Handle speech transcript update
  useEffect(() => {
    if (speech.transcript && interviewStage === 'answering') {
      setCurrentAnswer(speech.transcript);
    }
  }, [speech.transcript, interviewStage]);

  if (interview.isLoading && interviewStage === 'not-started') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Starting your interview..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Mock Interview</h1>
          <div className="text-sm text-gray-400">
            Question {interview.currentQuestionIndex + 1} of 5
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
          {/* Left Panel - AI Avatar & Question */}
          <div className="flex flex-col space-y-6">
            <AIAvatar 
              isSpeaking={speech.isSpeaking}
              currentQuestion={interview.currentQuestion}
            />
            <QuestionDisplay 
              question={interview.currentQuestion}
              stage={interviewStage}
            />
          </div>

          {/* Right Panel - Video & Metrics */}
          <div className="flex flex-col space-y-6">
            <VideoRecorder 
              videoRef={webcam.videoRef}
              isRecording={webcam.isRecording}
              isActive={webcam.isActive}
            />
            <LiveMetrics 
              faceMetrics={faceTracking.metrics}
              speechMetrics={{
                isListening: speech.isListening,
                transcript: speech.transcript
              }}
              stage={interviewStage}
            />
          </div>
        </div>

        {/* Controls */}
        <ControlsPanel
          stage={interviewStage}
          onStartAnswering={startAnswering}
          onSubmitAnswer={submitAnswer}
          onNextQuestion={getNextQuestion}
          isAnswering={interviewStage === 'answering'}
          hasAnswer={currentAnswer.length > 0 || speech.transcript.length > 0}
        />

        {/* Answer Input */}
        {interviewStage === 'answering' && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here or use voice recognition..."
              className="w-full h-32 p-4 bg-gray-700 text-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 text-sm text-gray-400">
              {speech.isListening ? '🎤 Listening...' : 'Click "Start Answering" to use voice'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewInterface;