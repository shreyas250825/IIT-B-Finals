// src/components/interview/VideoRecorder.tsx
import React from 'react';
import { Video, VideoOff, Circle } from 'lucide-react';

interface VideoRecorderProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
  isActive: boolean;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  videoRef, 
  isRecording, 
  isActive 
}) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 h-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Video</h3>
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Video className="w-5 h-5 text-green-500" />
          ) : (
            <VideoOff className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm text-gray-400">
            {isActive ? 'Camera Active' : 'Camera Off'}
          </span>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative bg-black rounded-xl overflow-hidden h-64 flex items-center justify-center">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-500">
            <VideoOff className="w-16 h-16 mx-auto mb-2" />
            <p>Camera not active</p>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm font-medium">REC</span>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isRecording 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            <Circle className="w-3 h-3 fill-current" />
            <span>
              {isRecording ? 'Recording' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          {isRecording 
            ? 'Speaking and recording in progress...' 
            : 'Camera is active and ready for recording'
          }
        </p>
      </div>
    </div>
  );
};

export default VideoRecorder;