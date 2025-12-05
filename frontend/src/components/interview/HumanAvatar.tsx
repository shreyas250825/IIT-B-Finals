// src/components/interview/HumanAvatar.tsx
import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface HumanAvatarProps {
  isSpeaking: boolean;
  currentQuestion: string | null;
}

const HumanAvatar: React.FC<HumanAvatarProps> = ({ isSpeaking, currentQuestion }) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Animate mouth when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 200); // Blink mouth animation

    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Avatar Container */}
      <div className="relative">
        {/* Glow Effect */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full blur-2xl opacity-50 animate-pulse" />
        )}

        {/* Main Avatar Circle */}
        <div
          className={`relative w-48 h-48 bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 ${
            isSpeaking ? 'scale-110 ring-4 ring-sky-400' : 'scale-100'
          }`}
        >
          {/* Face Container */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="w-6 h-6 bg-white rounded-full relative">
                <div className="absolute top-1 left-1 w-3 h-3 bg-sky-900 rounded-full" />
              </div>
              <div className="w-6 h-6 bg-white rounded-full relative">
                <div className="absolute top-1 left-1 w-3 h-3 bg-sky-900 rounded-full" />
              </div>
            </div>

            {/* Nose */}
            <div className="w-2 h-4 bg-sky-800/30 rounded-full mb-3" />

            {/* Mouth - Animated when speaking */}
            <div className="relative">
              {isSpeaking && mouthOpen ? (
                <div className="w-12 h-6 bg-white rounded-full border-2 border-sky-800/50" />
              ) : (
                <div className="w-8 h-2 bg-sky-800/50 rounded-full" />
              )}
            </div>
          </div>

          {/* Hair/Head Accessory */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-sky-700 to-sky-600 rounded-t-full" />
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
            isSpeaking
              ? 'bg-green-500/20 border-green-400 text-green-300'
              : 'bg-sky-500/20 border-sky-400 text-sky-300'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isSpeaking ? 'Speaking...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Question Text Overlay */}
      {currentQuestion && (
        <div className="absolute -bottom-20 left-0 right-0">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              {currentQuestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanAvatar;

