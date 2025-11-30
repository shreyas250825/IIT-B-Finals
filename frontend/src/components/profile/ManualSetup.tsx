import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManualSetup: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    role: 'Software Engineer',
    interviewType: 'Technical',
    round: 'Technical Round'
  });

  const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Product Manager'];
  const interviewTypes = ['Behavioral', 'Technical', 'Mixed'];
  const rounds = ['HR Round', 'Technical Round', 'Final Round'];

  const handleStartInterview = () => {
    // Save profile to localStorage and navigate to interview
    localStorage.setItem('interviewProfile', JSON.stringify(profile));
    navigate('/interview');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Role
        </label>
        <select
          value={profile.role}
          onChange={(e) => setProfile({...profile, role: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Type
        </label>
        <select
          value={profile.interviewType}
          onChange={(e) => setProfile({...profile, interviewType: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {interviewTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Round
        </label>
        <select
          value={profile.round}
          onChange={(e) => setProfile({...profile, round: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {rounds.map(round => (
            <option key={round} value={round}>{round}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleStartInterview}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg mt-8 transition-colors"
      >
        Start Interview
      </button>
    </div>
  );
};

export default ManualSetup;