// src/hooks/useWebcam.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface WebcamState {
  isActive: boolean;
  isRecording: boolean;
  stream: MediaStream | null;
  recordedChunks: Blob[];
  error: string | null;
  extensionConnected: boolean;
}

declare global {
  interface Window {
    chrome?: any;
  }
}

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [state, setState] = useState<WebcamState>({
    isActive: false,
    isRecording: false,
    stream: null,
    recordedChunks: [],
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
        throw new Error('Chrome extension for video/camera not available. Please install the Intervize Video Extension.');
      }

      portRef.current = window.chrome.runtime.connect(extensionId);

      portRef.current.onMessage.addListener((message: any) => {
        switch (message.type) {
          case 'WEBCAM_STARTED':
            setState(prev => ({
              ...prev,
              isActive: true,
              error: null
            }));
            break;
          case 'WEBCAM_STOPPED':
            setState(prev => ({
              ...prev,
              isActive: false,
              isRecording: false,
              stream: null,
              recordedChunks: []
            }));
            break;
          case 'RECORDING_STARTED':
            setState(prev => ({
              ...prev,
              isRecording: true,
              error: null
            }));
            break;
          case 'RECORDING_STOPPED':
            setState(prev => ({
              ...prev,
              isRecording: false,
              recordedChunks: message.chunks || []
            }));
            break;
          case 'VIDEO_DATA':
            setState(prev => ({
              ...prev,
              recordedChunks: [...prev.recordedChunks, message.chunk]
            }));
            break;
          case 'WEBCAM_ERROR':
            setState(prev => ({
              ...prev,
              error: message.error,
              isActive: false,
              isRecording: false
            }));
            break;
          case 'STREAM_READY':
            // Extension provides stream URL or data
            if (message.streamUrl && videoRef.current) {
              videoRef.current.src = message.streamUrl;
            }
            break;
        }
      });

      portRef.current.onDisconnect.addListener(() => {
        setState(prev => ({
          ...prev,
          extensionConnected: false,
          isActive: false,
          isRecording: false,
          error: 'Video extension disconnected'
        }));
      });

      // Request extension to initialize
      portRef.current.postMessage({ type: 'INIT_VIDEO' });

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, [checkExtensionAvailability, extensionId]);

  // Initialize webcam via Chrome extension
  const startWebcam = useCallback(async () => {
    if (!portRef.current) {
      throw new Error('Video extension not connected');
    }

    try {
      portRef.current.postMessage({
        type: 'START_WEBCAM',
        constraints: {
          video: {
            width: 1280,
            height: 720,
            frameRate: 30
          },
          audio: true
        }
      });

      // Wait for webcam to be ready
      return new Promise<MediaStream>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for webcam'));
        }, 10000);

        const handleReady = (message: any) => {
          if (message.type === 'WEBCAM_STARTED') {
            portRef.current.onMessage.removeListener(handleReady);
            clearTimeout(timeout);
            // Create a mock stream for compatibility
            const mockStream = new MediaStream();
            resolve(mockStream);
          } else if (message.type === 'WEBCAM_ERROR') {
            portRef.current.onMessage.removeListener(handleReady);
            clearTimeout(timeout);
            reject(new Error(message.error));
          }
        };

        portRef.current.onMessage.addListener(handleReady);
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
      throw err;
    }
  }, []);

  // Stop webcam via Chrome extension
  const stopWebcam = useCallback(() => {
    if (!portRef.current) return;

    try {
      portRef.current.postMessage({ type: 'STOP_WEBCAM' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Start recording via Chrome extension
  const startRecording = useCallback(() => {
    if (!portRef.current) {
      throw new Error('Video extension not connected');
    }

    if (!state.isActive) {
      throw new Error('Webcam not active');
    }

    try {
      setState(prev => ({ ...prev, recordedChunks: [] }));
      portRef.current.postMessage({
        type: 'START_RECORDING',
        options: {
          mimeType: 'video/webm;codecs=vp9,opus'
        }
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
      throw err;
    }
  }, [state.isActive]);

  // Stop recording via Chrome extension
  const stopRecording = useCallback(() => {
    if (!portRef.current) return;

    try {
      portRef.current.postMessage({ type: 'STOP_RECORDING' });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Get recorded video blob
  const getRecordedVideo = useCallback(() => {
    if (state.recordedChunks.length === 0) {
      return null;
    }

    return new Blob(state.recordedChunks, { type: 'video/webm' });
  }, [state.recordedChunks]);

  // Initialize on mount
  useEffect(() => {
    initializeExtensionConnection();

    return () => {
      stopWebcam();
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, [initializeExtensionConnection, stopWebcam]);

  return {
    videoRef,
    isActive: state.isActive,
    isRecording: state.isRecording,
    error: state.error,
    extensionConnected: state.extensionConnected,
    startWebcam,
    stopWebcam,
    startRecording,
    stopRecording,
    getRecordedVideo,
    initializeExtensionConnection
  };
};
