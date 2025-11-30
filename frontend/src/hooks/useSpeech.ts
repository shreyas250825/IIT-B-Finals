// src/hooks/useSpeech.ts
import { useState, useRef, useCallback } from 'react';

interface SpeechState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  error: string | null;
}

export const useSpeech = () => {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: '',
    isSpeaking: false,
    error: null
  });

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({ 
        ...prev, 
        transcript: finalTranscript || interimTranscript 
      }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({ 
        ...prev, 
        error: `Speech recognition error: ${event.error}`,
        isListening: false 
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    try {
      const recognition = recognitionRef.current || initializeRecognition();
      setState(prev => ({ ...prev, transcript: '' }));
      recognition.start();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, [initializeRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      throw new Error('Text-to-speech not supported in this browser');
    }

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true, error: null }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      utterance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false,
          error: `Speech synthesis error: ${event.error}` 
        }));
        reject(event.error);
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript
  };
};