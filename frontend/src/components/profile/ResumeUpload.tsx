import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ResumeReview from './ResumeReview';
import { API_BASE_URL } from '../../services/api';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFile(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend using new parse endpoint
      const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload resume' }));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.parsed_data) {
        // Check if resume is complete
        if (!data.complete) {
          const missingFields = data.missing || [];
          setError(
            `Please upload a proper resume. Some essential details are missing: ${missingFields.join(', ')}.`
          );
          setIsUploading(false);
          return;
        }
        
        // Store parsed data and show review screen
        setParsedData(data.parsed_data);
        setUploadedFile(file.name);
        // Also store in localStorage for persistence
        localStorage.setItem('resumeParsedData', JSON.stringify(data.parsed_data));
        setShowReview(true);
      } else {
        throw new Error('Failed to parse resume data');
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setError(err.message || 'Failed to upload and parse resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (isUploading) {
    return <LoadingSpinner size="xl" text="Processing Your Resume..." />;
  }

  // Show resume review after successful upload
  if (showReview && parsedData) {
    return (
      <ResumeReview
        parsedData={parsedData}
        onContinue={() => {
          // Store in localStorage and navigate
          console.log('Continue clicked, navigating to /setup with parsedData:', parsedData);
          localStorage.setItem('resumeParsedData', JSON.stringify(parsedData));
          // Navigate with state
          navigate('/setup', { 
            state: { parsedData },
            replace: false 
          });
        }}
      />
    );
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
          Upload Your Resume
        </h2>
        <p className="text-gray-400 text-lg">
          We'll extract your skills and experience to personalize your interview
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
          dragActive
            ? 'border-sky-400 bg-sky-400/10 scale-105'
            : 'border-white/20 hover:border-sky-400/50 hover:bg-sky-400/5'
        }`}
      >
      <input
        type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="resume-upload"
      />
      <label 
        htmlFor="resume-upload"
          className={`inline-flex flex-col items-center cursor-pointer transition-all duration-300 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-r from-sky-400 to-cyan-500 p-6 rounded-2xl transform hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-white" />
            </div>
          </div>
          <span className="text-white font-bold text-xl mb-3">Click or Drag & Drop</span>
          <span className="text-gray-400 text-base">PDF, DOCX, or TXT (Max 10MB)</span>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </span>
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>DOCX</span>
            </span>
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>TXT</span>
            </span>
          </div>
      </label>
      </div>

      {/* Success Message */}
      {uploadedFile && !error && (
        <div className="mt-8 p-6 bg-green-500/20 border border-green-500/50 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-green-300 font-bold text-lg mb-1">Successfully Uploaded!</h3>
              <p className="text-green-200 text-sm mb-2">{uploadedFile}</p>
              <p className="text-gray-400 text-sm">Redirecting to interview...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-8 p-6 bg-red-500/20 border border-red-500/50 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-red-300 font-bold text-lg mb-2">Upload Failed</h3>
              <p className="text-red-200 text-sm mb-3">{error}</p>
              <p className="text-gray-400 text-sm">
                Don't worry, we'll use a default profile and you can still proceed to the interview.
              </p>
              <button
                onClick={() => {
                  setError(null);
                  const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="mt-4 text-red-300 hover:text-red-200 text-sm font-semibold flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // Navigate to manual setup
            navigate('/setup');
          }}
          className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Skip and configure manually</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;
