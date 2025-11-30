import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate resume processing
    setTimeout(() => {
      setIsUploading(false);
      // For now, we'll use a default profile
      const profile = {
        role: 'Software Engineer',
        interviewType: 'Technical',
        round: 'Technical Round'
      };
      localStorage.setItem('interviewProfile', JSON.stringify(profile));
      navigate('/interview');
    }, 2000);
  };

  return (
    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">Upload your resume (PDF or DOCX)</p>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
        id="resume-upload"
      />
      <label 
        htmlFor="resume-upload"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer disabled:bg-blue-400"
      >
        {isUploading ? 'Processing...' : 'Choose File'}
      </label>
      <p className="text-sm text-gray-500 mt-2">
        We'll automatically extract your skills and experience
      </p>
    </div>
  );
};

export default ResumeUpload;