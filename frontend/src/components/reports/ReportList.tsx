// src/components/reports/ReportList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { getScoreColor, getScoreBgColor } from '../../utils/helpers';
import { FileText, Calendar, User, Search } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface Report {
  session_id: string;
  role: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  created_at: string;
}

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await interviewApi.listReports();
        setIsLoading(false);
        setReports(response.reports || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report =>
    report.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Reports
          </h1>
          <p className="text-gray-600">
            Review your past interview performances and track your progress
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports by role or session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Link
                key={report.session_id}
                to={`/feedback/${report.session_id}`}
                className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {report.role}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreBgColor(report.overall_score)} ${getScoreColor(report.overall_score)}`}>
                      {Math.round(report.overall_score)}%
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Technical</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(report.technical_score)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Communication</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(report.communication_score)}%
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>Session</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'No reports match your search criteria'
                : "You haven't completed any interviews yet"
              }
            </p>
            {!searchTerm && (
              <Link
                to="/setup"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your First Interview
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        {reports.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progress Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reports.length}
                </div>
                <div className="text-sm text-blue-800">Total Interviews</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(reports.reduce((acc, r) => acc + r.overall_score, 0) / reports.length)}%
                </div>
                <div className="text-sm text-green-800">Average Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...reports.map(r => r.overall_score))}%
                </div>
                <div className="text-sm text-purple-800">Best Score</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(reports.map(r => r.role)).size}
                </div>
                <div className="text-sm text-orange-800">Roles Practiced</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;