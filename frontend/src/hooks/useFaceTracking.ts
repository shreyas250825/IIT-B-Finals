// src/hooks/useFaceTracking.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface FaceMetrics {
  eyeContact: number; // 0-100
  confidence: number; // 0-100
  engagement: number; // 0-100
  headMovement: number; // 0-100 (stability)
}

interface FaceTrackingState {
  isTracking: boolean;
  metrics: FaceMetrics;
  error: string | null;
}

export const useFaceTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [state, setState] = useState<FaceTrackingState>({
    isTracking: false,
    metrics: {
      eyeContact: 50,
      confidence: 50,
      engagement: 50,
      headMovement: 50
    },
    error: null
  });

  // Simulate face tracking (in real implementation, use MediaPipe or similar)
  const simulateFaceTracking = useCallback(() => {
    if (!videoRef.current || !state.isTracking) return;

    // Simulate metrics based on time and random variations
    const time = Date.now() / 1000;
    
    const newMetrics: FaceMetrics = {
      eyeContact: 60 + Math.sin(time) * 20 + Math.random() * 10,
      confidence: 65 + Math.cos(time * 0.7) * 15 + Math.random() * 8,
      engagement: 70 + Math.sin(time * 0.5) * 10 + Math.random() * 6,
      headMovement: 40 + Math.cos(time * 0.3) * 30 + Math.random() * 12
    };

    // Normalize metrics to 0-100 range
    Object.keys(newMetrics).forEach(key => {
      (newMetrics as any)[key] = Math.max(0, Math.min(100, (newMetrics as any)[key]));
    });

    setState(prev => ({
      ...prev,
      metrics: newMetrics
    }));

    // Continue tracking
    animationFrameRef.current = requestAnimationFrame(simulateFaceTracking);
  }, [state.isTracking]);

  // Start face tracking
  const startTracking = useCallback(() => {
    if (!videoRef.current) {
      setState(prev => ({ ...prev, error: 'Video element not available' }));
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null }));
    animationFrameRef.current = requestAnimationFrame(simulateFaceTracking);
  }, [simulateFaceTracking]);

  // Stop face tracking
  const stopTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: false }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return state.metrics;
  }, [state.metrics]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: {
        eyeContact: 50,
        confidence: 50,
        engagement: 50,
        headMovement: 50
      }
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    ...state,
    startTracking,
    stopTracking,
    getMetrics,
    resetMetrics
  };
};