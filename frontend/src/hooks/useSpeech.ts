// src/hooks/useSpeech.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  error: string | null;
  extensionConnected: boolean;
}

declare global {
  interface Window {
    chrome?: any;
  }
}

export const useSpeech = () => {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: '',
    isSpeaking: false,
    error: null,
    extensionConnected: false
  });

  const portRef = useRef<any>(null);
  const extensionId = 'your-chrome-extension-id'; // Replace with actual extension ID

  // Check if Chrome extension is available
  const checkExtensionAvailability = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (!window.chrome || !window.chrome.runtime) {
        resolve(false);
        return;
      }

      try {
        const port = window.chrome.runtime.connect(extensionId);
        port.onDisconnect.addListener(() => {
          setState(prev => ({ ...prev, extensionConnected: false }));
          resolve(false);
        });

        port.onMessage.addListener((message: any) => {
          if (message.type === 'EXTENSION_READY') {
            setState(prev => ({ ...prev, extensionConnected: true }));
            resolve(true);
          }
        });

        // Give it a moment to connect
        setTimeout(() => resolve(false), 1000);
      } catch (error) {
        resolve(false);
      }
    });
  }, [extensionId]);

  // Initialize connection to Chrome extension
  const initializeExtensionConnection = useCallback(async () => {
    try {
      const isAvailable = await checkExtensionAvailability();
      if (!isAvailable) {
        throw new Error('Chrome extension for speech recognition not available. Please install the Intervize Voice Extension.');
      }

      portRef.current = window.chrome.runtime.connect(extensionId);

      portRef.current.onMessage.addListener((message: any) => {
        switch (message.type) {
          case 'SPEECH_RESULT':
            setState(prev => ({
              ...prev,
              transcript: message.transcript,
              error: null
            }));
            break;
          case 'SPEECH_START':
            setState(prev => ({
              ...prev,
              isListening: true,
              error: null
            }));
            break;
          case 'SPEECH_END':
            setState(prev => ({
              ...prev,
              isListening: false
            }));
            break;
          case 'SPEECH_ERROR':
            setState(prev => ({
              ...prev,
              error: message.error,
              isListening: false
            }));
            break;
          case 'TTS_START':
            setState(prev => ({
              ...prev,
              isSpeaking: true,
              error: null
            }));
            break;
          case 'TTS_END':
            setState(prev => ({
              ...prev,
              isSpeaking: false
            }));
            break;
          case 'TTS_ERROR':
            setState(prev => ({
              ...prev,
              isSpeaking: false,
              error: message.error
            }));
            break;
        }
      });

      portRef.current.onDisconnect.addListener(() => {
        setState(prev => ({
          ...prev,
          extensionConnected: false,
          isListening: false,
          isSpeaking: false,
          error: 'Extension disconnected'
        }));
      });

      // Request extension to initialize
      portRef.current.postMessage({ type: 'INIT_SPEECH' });

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, [checkExtensionAvailability, extensionId]);

  // Start listening via Chrome extension
  const startListening = useCallback(() => {
    if (!portRef.current) {
      setState(prev => ({ ...prev, error: 'Speech extension not connected' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, transcript: '', error: null }));
      portRef.current.postMessage({ type: 'START_LISTENING' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Stop listening via Chrome extension
  const stopListening = useCallback(() => {
    if (!portRef.current) return;

    try {
      portRef.current.postMessage({ type: 'STOP_LISTENING' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Speak text via Chrome extension
  const speak = useCallback((text: string) => {
    if (!portRef.current) {
      return Promise.reject(new Error('Speech extension not connected'));
    }

    return new Promise<void>((resolve, reject) => {
      try {
        portRef.current.postMessage({
          type: 'SPEAK_TEXT',
          text: text,
          options: {
            rate: 0.9,
            pitch: 1,
            volume: 1
          }
        });

        // Set up one-time listener for completion
        const handleCompletion = (message: any) => {
          if (message.type === 'TTS_END') {
            portRef.current.onMessage.removeListener(handleCompletion);
            resolve();
          } else if (message.type === 'TTS_ERROR') {
            portRef.current.onMessage.removeListener(handleCompletion);
            reject(new Error(message.error));
          }
        };

        portRef.current.onMessage.addListener(handleCompletion);

      } catch (err: any) {
        reject(err);
      }
    });
  }, []);

  // Stop speaking via Chrome extension
  const stopSpeaking = useCallback(() => {
    if (!portRef.current) return;

    try {
      portRef.current.postMessage({ type: 'STOP_SPEAKING' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeExtensionConnection();

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, [initializeExtensionConnection]);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    initializeExtensionConnection
  };
};
