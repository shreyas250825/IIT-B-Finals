import React from 'react';
import { Sparkles, Zap, Brain } from 'lucide-react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    md: { container: 'w-24 h-24', icon: 'w-12 h-12' },
    lg: { container: 'w-32 h-32', icon: 'w-16 h-16' }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main Spinner Container */}
      <div className="relative">
        {/* Outer Rotating Ring */}
        <div className={`${sizes[size].container} relative animate-spin`}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
        </div>

        {/* Middle Rotating Ring - Opposite Direction */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-reverse`}>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-500 border-l-pink-500"></div>
        </div>

        {/* Inner Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-75"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-lg animate-pulse">
              <Brain className={`${sizes[size].icon} text-white`} />
            </div>
          </div>
        </div>

        {/* Orbiting Particles */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow`}>
          <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
        </div>
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow-reverse`}>
          <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 text-purple-400" />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="mt-12 text-center relative z-10">
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {text}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      )}


    </div>
  );
};

export default LoadingSpinner;

