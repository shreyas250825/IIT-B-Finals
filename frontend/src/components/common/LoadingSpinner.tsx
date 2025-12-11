import React from 'react';
import { Sparkles, Zap, Brain } from 'lucide-react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; text?: string }> = ({ size = 'lg', text = 'Loading...' }) => {
  const sizes = {
    sm: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    md: { container: 'w-24 h-24', icon: 'w-12 h-12' },
    lg: { container: 'w-40 h-40', icon: 'w-20 h-20' },
    xl: { container: 'w-56 h-56', icon: 'w-28 h-28' }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 relative">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-sky-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Spinner Container */}
      <div className="relative">
        {/* Outer Rotating Ring */}
        <div className={`${sizes[size].container} relative animate-spin`}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 border-r-cyan-400"></div>
        </div>

        {/* Middle Rotating Ring - Opposite Direction */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-reverse`}>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-400 border-l-sky-300"></div>
        </div>

        {/* Inner Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-4 bg-gradient-to-r from-sky-500/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-lg blur-lg opacity-75"></div>
            <div className="relative bg-gradient-to-br from-sky-500 to-cyan-500 p-3 rounded-lg animate-pulse">
              <Brain className={`${sizes[size].icon} text-white`} />
            </div>
          </div>
        </div>

        {/* Orbiting Particles */}
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow`}>
          <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
        </div>
        <div className={`${sizes[size].container} absolute inset-0 animate-spin-slow-reverse`}>
          <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 text-yellow-400" />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="mt-12 text-center relative z-10 px-4">
          <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
            {text}
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-4 h-4 bg-sky-300 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}


    </div>
  );
};

export default LoadingSpinner;

