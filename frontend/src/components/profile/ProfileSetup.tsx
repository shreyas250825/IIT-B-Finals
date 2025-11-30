import React, { useState } from 'react';
import ResumeUpload from './ResumeUpload';
import ManualSetup from './ManualSetup';
import { Upload, Settings } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const [mode, setMode] = useState<'resume' | 'manual'>('manual');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Setup Your Interview</h1>
        
        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            className={`p-6 border-2 rounded-xl flex flex-col items-center transition-all ${
              mode === 'resume' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setMode('resume')}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="font-semibold">Upload Resume</span>
          </button>
          <button
            className={`p-6 border-2 rounded-xl flex flex-col items-center transition-all ${
              mode === 'manual' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setMode('manual')}
          >
            <Settings className="w-8 h-8 mb-2" />
            <span className="font-semibold">Manual Setup</span>
          </button>
        </div>

        {mode === 'resume' && <ResumeUpload />}
        {mode === 'manual' && <ManualSetup />}
      </div>
    </div>
  );
};

export default ProfileSetup;