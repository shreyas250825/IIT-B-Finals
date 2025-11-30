// src/hooks/useWebcam.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface WebcamState {
  isActive: boolean;
  isRecording: boolean;
  stream: MediaStream | null;
  recordedChunks: Blob[];
  error: string | null;
}

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [state, setState] = useState<WebcamState>({
    isActive: false,
    isRecording: false,
    stream: null,
    recordedChunks: [],
    error: null
  });

  // Initialize webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          frameRate: 30
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setState(prev => ({
        ...prev,
        isActive: true,
        stream,
        error: null
      }));

      return stream;
    } catch (err: any) {
      const error = 'Failed to access webcam: ' + err.message;
      setState(prev => ({ ...prev, error }));
      throw err;
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }

    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      isRecording: false,
      stream: null,
      recordedChunks: []
    }));
  }, [state.stream, state.isRecording]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!state.stream) {
      throw new Error('Webcam not active');
    }

    const mediaRecorder = new MediaRecorder(state.stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      setState(prev => ({
        ...prev,
        recordedChunks: chunks,
        isRecording: false
      }));
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Collect data every second

    setState(prev => ({ ...prev, isRecording: true }));
  }, [state.stream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  // Get recorded video blob
  const getRecordedVideo = useCallback(() => {
    if (state.recordedChunks.length === 0) {
      return null;
    }

    return new Blob(state.recordedChunks, { type: 'video/webm' });
  }, [state.recordedChunks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    isActive: state.isActive,
    isRecording: state.isRecording,
    error: state.error,
    startWebcam,
    stopWebcam,
    startRecording,
    stopRecording,
    getRecordedVideo
  };
};