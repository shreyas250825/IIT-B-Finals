// src/components/interview/InterviewInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, Square, Send } from 'lucide-react';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeech';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import HumanAvatar from './HumanAvatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { getReportSimple, startInterviewSimple, submitAnswerSimple } from '../../services/api';

const InterviewInterface: React.FC = () => {
  const navigate = useNavigate();
  
  // Interview state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStage, setInterviewStage] = useState<'not-started' | 'question' | 'answering' | 'analysis'>('not-started');
  const [isLoading, setIsLoading] = useState(false);

  // Media state
  const [isMediaEnabled, setIsMediaEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMetricsRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Webcam, speech, and face tracking hooks - MUST BE CALLED IN CONSISTENT ORDER
  const { videoRef, startWebcam, stopWebcam, isActive: webcamActive } = useWebcam();
  const speech = useSpeechRecognition();

  // Face tracking hook - MUST be called before useCallback and useEffect
  useFaceTracking(videoRef, (metrics) => {
    lastMetricsRef.current = metrics;
  });

  // Text-to-Speech for AI avatar with female voice - useCallback MUST come before useEffect
  const speakQuestion = React.useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any ongoing speech
    try {
      window.speechSynthesis.cancel();
      // Wait a bit for cancellation
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.85; // Slightly slower for clarity
          utterance.pitch = 1.2; // Higher pitch for female voice
          utterance.volume = 1.0; // Maximum volume

          // Try to find a female voice
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const femaleVoice = voices.find((voice) =>
              voice.name.toLowerCase().includes('zira') ||
              voice.name.toLowerCase().includes('samantha') ||
              voice.name.toLowerCase().includes('karen') ||
              voice.name.toLowerCase().includes('victoria') ||
              voice.name.toLowerCase().includes('susan') ||
              voice.name.toLowerCase().includes('hazel') ||
              voice.name.toLowerCase().includes('female')
            );
            
            if (femaleVoice) {
              utterance.voice = femaleVoice;
            }
          }

          utterance.onstart = () => {
            isSpeakingRef.current = true;
            setIsSpeaking(true);
            console.log('🔊 AI started speaking:', text);
          };

          utterance.onend = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
            console.log('✅ AI finished speaking');
          };

          utterance.onerror = (e: any) => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
            console.error('❌ Speech synthesis error:', e.error);
            // Try to speak again with default settings if error occurs
            if (e.error !== 'canceled') {
              setTimeout(() => {
                try {
                  const fallbackUtterance = new SpeechSynthesisUtterance(text);
                  fallbackUtterance.lang = 'en-US';
                  fallbackUtterance.rate = 0.9;
                  fallbackUtterance.volume = 1.0;
                  window.speechSynthesis.speak(fallbackUtterance);
                } catch (fallbackErr) {
                  console.error('Fallback speech also failed:', fallbackErr);
                }
              }, 500);
            }
          };

          speechSynthesisRef.current = utterance;
          
          // Ensure speech synthesis is ready
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
              window.speechSynthesis.speak(utterance);
            }, 100);
          } else {
            window.speechSynthesis.speak(utterance);
          }
          
          // Verify it's actually speaking
          setTimeout(() => {
            if (window.speechSynthesis.speaking) {
              console.log('✅ Speech is playing - you should hear audio');
            } else {
              console.warn('⚠️ Speech may not be playing. Check:');
              console.warn('  1. System volume is up');
              console.warn('  2. Browser tab is not muted');
              console.warn('  3. Browser has audio permissions');
            }
          }, 200);
        } catch (err) {
          console.error('Failed to create utterance:', err);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      }, 300);
    } catch (e) {
      // Ignore
    }
  }, []);

  // Ensure video plays when stream is ready
  useEffect(() => {
    if (videoRef.current && (isMediaEnabled || webcamActive)) {
      const video = videoRef.current;
      if (video.srcObject && video.paused) {
        video.play().catch(() => {
          setTimeout(() => {
            video.play().catch(() => {});
          }, 100);
        });
      }
    }
  }, [isMediaEnabled, webcamActive, videoRef]);

  // Load voices when component mounts and suppress speech synthesis errors
  useEffect(() => {
    // Suppress speech synthesis errors in console
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Filter out speech synthesis errors
      const firstArg = args[0];
      if (
        (typeof firstArg === 'string' && 
          (firstArg.includes('Speech synthesis') || firstArg.includes('SpeechSynthesisErrorEvent'))) ||
        (firstArg?.constructor?.name === 'SpeechSynthesisErrorEvent') ||
        (args[1]?.constructor?.name === 'SpeechSynthesisErrorEvent')
      ) {
        return; // Don't log speech synthesis errors
      }
      originalError.apply(console, args);
    };

    // Load voices (some browsers need this)
    const loadVoices = () => {
      window.speechSynthesis.getVoices(); // Just trigger voice loading
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      console.error = originalError; // Restore original console.error
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Start interview on mount
  useEffect(() => {
    const profileRaw = localStorage.getItem('interviewProfile');
    if (!profileRaw) {
      navigate('/setup');
      return;
    }

    const start = async () => {
      try {
        setIsLoading(true);
        const profile = JSON.parse(profileRaw);
        const role = profile.role || profile.estimated_role;
        const interviewType = profile.interviewType || profile.interview_type || 'mixed';
        const persona = profile.persona || 'male';
        const res = await startInterviewSimple(profile, role, interviewType, persona);
        setSessionId(res.session_id);
        const q = res.question;
        const questionText = q.text || q.question || 'Tell me about yourself';
        setCurrentQuestion(questionText);
        setCurrentQuestionId(q.id || 'q1');
        setCurrentQuestionIndex(0);
        setInterviewStage('question');
        
        // Store session data in localStorage for Dashboard and ReportList
        const sessionData = {
          session_id: res.session_id,
          role: role || 'Software Engineer',
          interview_type: interviewType,
          persona: persona,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        };
        
        // Add to interview history
        const history = localStorage.getItem('interviewHistory');
        const historyArray = history ? JSON.parse(history) : [];
        // Check if session already exists
        const existingIndex = historyArray.findIndex((h: any) => h.session_id === res.session_id);
        if (existingIndex >= 0) {
          historyArray[existingIndex] = { ...historyArray[existingIndex], ...sessionData };
        } else {
          historyArray.unshift(sessionData); // Add to beginning
        }
        localStorage.setItem('interviewHistory', JSON.stringify(historyArray));
        
        // Auto-speak the first question after a short delay (allow voices to load)
        // Also add a user interaction requirement for some browsers
        const speakAfterDelay = () => {
          // Some browsers require user interaction before TTS works
          // Try speaking immediately
          speakQuestion(questionText);
          
          // If that doesn't work, show a message
          setTimeout(() => {
            if (!isSpeakingRef.current) {
              console.warn('⚠️ TTS may require user interaction. Click anywhere on the page to enable audio.');
            }
          }, 1000);
        };
        
        setTimeout(speakAfterDelay, 2000);
      } catch (err) {
        console.error('Failed to start interview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    start();

    return () => {
      try {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        speechSynthesisRef.current = null;
      } catch (e) {
        // Ignore errors
      }
      stopWebcam();
    };
  }, [navigate, stopWebcam, speakQuestion]);

  // Toggle video and audio
  const toggleMedia = async () => {
    if (isMediaEnabled) {
      stopWebcam();
      speech.stop();
      setIsMediaEnabled(false);
      setIsRecording(false);
      setTranscript('');
    } else {
      try {
        await startWebcam({ video: true, audio: true });
        setIsMediaEnabled(true);
      } catch (err) {
        console.error('Failed to start media:', err);
        alert('Please allow camera and microphone permissions');
      }
    }
  };

  // Start recording answer
  const startAnswering = () => {
    if (!isMediaEnabled && !webcamActive) {
      alert('Please enable camera and microphone first');
      return;
    }

    setInterviewStage('answering');
    setTranscript(''); // Reset transcript completely
    setIsRecording(true);

    if (speech.supported) {
      // Completely reset speech recognition
      if ('reset' in speech && typeof speech.reset === 'function') {
        speech.reset();
      } else {
        speech.stop();
      }
      
      // Wait a moment then start fresh
      setTimeout(() => {
        speech.start((text) => {
          // Replace transcript instead of appending to prevent duplication
          setTranscript(text);
        });
      }, 200);
    }
  };

  // Stop recording and submit answer
  const submitAnswer = async () => {
    if (!sessionId || !transcript.trim()) {
      alert('Please provide an answer before submitting');
      return;
    }

    setIsRecording(false);
    speech.stop();
    setInterviewStage('analysis');
    setIsLoading(true);

    try {
      const res = await submitAnswerSimple({
        session_id: sessionId,
        question_id: currentQuestionId,
        transcript,
        metrics: lastMetricsRef.current || { eyeContact: null },
      });

      // If backend provides a next question, move to it; otherwise end interview
      if (res.next_question) {
        const q = res.next_question;
        const questionText = q.text || q.question || '';
        setCurrentQuestion(questionText);
        setCurrentQuestionId(q.id || `q${currentQuestionIndex + 2}`);
        setCurrentQuestionIndex((prev) => prev + 1);
        setInterviewStage('question');
        setTranscript(''); // Clear transcript completely
        
        // Stop any ongoing speech recognition
        speech.stop();
        
        // Auto-speak next question
        setTimeout(() => {
          speakQuestion(questionText);
        }, 1000);
      } else {
        // Interview completed - fetch report and update session data
        try {
          const reportData = await getReportSimple(sessionId);
          
          // Update session data with final scores
          const history = localStorage.getItem('interviewHistory');
          const historyArray = history ? JSON.parse(history) : [];
          const sessionIndex = historyArray.findIndex((h: any) => h.session_id === sessionId);
          
          if (sessionIndex >= 0 && reportData.evaluations && reportData.evaluations.length > 0) {
            const evals = reportData.evaluations;
            const tech = evals.reduce((sum: number, e: any) => sum + (e.technical || 0), 0) / evals.length;
            const comm = evals.reduce((sum: number, e: any) => sum + (e.communication || 0), 0) / evals.length;
            const conf = evals.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / evals.length;
            const overall = (tech + comm + conf) / 3;
            
            historyArray[sessionIndex] = {
              ...historyArray[sessionIndex],
              overall_score: overall,
              technical_score: tech,
              communication_score: comm,
              confidence_score: conf,
              questions_count: evals.length,
              completed_at: new Date().toISOString(),
            };
            localStorage.setItem('interviewHistory', JSON.stringify(historyArray));
    }
        } catch (err) {
          console.error('Failed to fetch report:', err);
        }
        
        navigate(`/report?sessionId=${sessionId}`);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setInterviewStage('question');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && interviewStage === 'not-started') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900">
        <LoadingSpinner size="lg" text="Starting your interview..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
            AI Mock Interview
          </h1>
          <div className="text-sm text-gray-400 bg-slate-800/50 px-4 py-2 rounded-lg">
            Question {currentQuestionIndex + 1} of 7
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Human AI Avatar */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[600px] relative">
            <HumanAvatar 
              isSpeaking={isSpeaking || interviewStage === 'question'}
              currentQuestion={currentQuestion}
            />
            
            {/* Status Message */}
            <div className="absolute bottom-4 left-4 right-4 text-center space-y-2">
              <p className="text-sm text-gray-400">
                {interviewStage === 'question' && '🎧 Listen to the question...'}
                {interviewStage === 'answering' && '🎤 Your turn to answer'}
                {interviewStage === 'analysis' && '⏳ Analyzing your response...'}
              </p>
              {interviewStage === 'question' && currentQuestion && (
                <button
                  onClick={() => {
                    speakQuestion(currentQuestion);
                  }}
                  className="text-xs bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 px-3 py-1 rounded-lg text-sky-300 transition-all"
                  title="Click to hear the question again"
                >
                  🔊 Play Question Again
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Video Feed */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Your Video</h3>
              <div className="flex items-center space-x-2">
                {isMediaEnabled || webcamActive ? (
                  <Video className="w-5 h-5 text-green-400" />
                ) : (
                  <VideoOff className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm text-gray-400">
                  {isMediaEnabled || webcamActive ? 'Camera On' : 'Camera Off'}
                </span>
              </div>
          </div>

            {/* Video Feed */}
            <div className="relative bg-black rounded-2xl overflow-hidden flex-1 flex items-center justify-center mb-4 min-h-[400px]">
              {isMediaEnabled || webcamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                  className="w-full h-full object-cover"
                  style={{ 
                    transform: 'scaleX(-1)',
                    backgroundColor: '#000',
                    minHeight: '400px'
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(() => {
                        setTimeout(() => video.play().catch(() => {}), 100);
                      });
                    }
                  }}
                  onCanPlay={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(() => {});
                    }
                  }}
                  onPlay={() => {
                    // Video is playing
                  }}
            />
              ) : (
                <div className="text-center text-gray-500">
                  <VideoOff className="w-20 h-20 mx-auto mb-4" />
                  <p>Enable camera to start</p>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">RECORDING</span>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcript}</p>
              </div>
            )}

            {/* Media Toggle Button */}
            <button
              onClick={toggleMedia}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 mb-4 ${
                isMediaEnabled || webcamActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white'
              }`}
            >
              {isMediaEnabled || webcamActive ? (
                <>
                  <VideoOff className="w-5 h-5" />
                  <span>Turn Off Camera & Audio</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>Turn On Camera & Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          {interviewStage === 'question' && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-400 text-center">
                Listen to the question, then enable your camera and microphone when ready to answer
              </p>
              <button
                onClick={startAnswering}
                disabled={!isMediaEnabled && !webcamActive}
                className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  isMediaEnabled || webcamActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>Start Answering</span>
              </button>
            </div>
          )}

        {interviewStage === 'answering' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 text-green-400 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-semibold">Recording your answer...</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setIsRecording(false);
                    speech.stop();
                    setInterviewStage('question');
                    setTranscript('');
                  }}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <Square className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!transcript.trim()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    transcript.trim()
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white transform hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Answer</span>
                </button>
              </div>
              {!speech.supported && (
            <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-32 p-4 bg-slate-700 text-white rounded-xl resize-none focus:ring-2 focus:ring-sky-500 border border-white/10"
            />
              )}
            </div>
          )}

          {interviewStage === 'analysis' && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 text-sky-400 mb-2">
                <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-lg">Analyzing your response...</span>
            </div>
              <p className="text-gray-400 text-sm">This may take a few seconds</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;

