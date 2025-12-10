import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import { 
  Video, Brain, Clock, Target, TrendingUp,
  Calendar, PlayCircle, BookOpen, Trophy, Zap, CheckCircle,
  Star, ArrowRight, Plus, History, ChevronRight, Activity, FileText
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  useState('overview'); // activeTab state kept for potential future use
  const [userProfile, setUserProfile] = useState<any>(null);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);

  // Load user profile and interview history
  useEffect(() => {
    const profile = localStorage.getItem('interviewProfile');
    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (e) {
        console.error('Failed to parse profile:', e);
      }
    }

    // Load interview history from both localStorage and API
    const loadHistory = async () => {
      // First load from localStorage
      const history = localStorage.getItem('interviewHistory');
      let localHistory: any[] = [];
      if (history) {
        try {
          localHistory = JSON.parse(history);
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }

      // Then try to fetch from API and merge
      try {
        const { interviewApi } = await import('../../services/api');
        const apiResponse = await interviewApi.listReports();
        const apiReports = apiResponse.reports || [];
        
        // Merge API data with localStorage, prioritizing API data
        const merged = apiReports.map((apiReport: any) => {
          const localMatch = localHistory.find((h: any) => h.session_id === apiReport.session_id);
          return {
            ...localMatch,
            ...apiReport,
            date: apiReport.created_at ? new Date(apiReport.created_at).toISOString().split('T')[0] : (localMatch?.date || new Date().toISOString().split('T')[0]),
          };
        });
        
        // Add any localStorage-only entries
        const apiSessionIds = new Set(apiReports.map((r: any) => r.session_id));
        const localOnly = localHistory.filter((h: any) => !apiSessionIds.has(h.session_id));
        
        setInterviewHistory([...merged, ...localOnly]);
      } catch (err) {
        // If API fails, use localStorage only
        console.error('Failed to fetch from API, using localStorage:', err);
        setInterviewHistory(localHistory);
      }
    };

    loadHistory();
  }, []);

  // Calculate stats from interview history
  const userStats = (() => {
    if (interviewHistory.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        improvementRate: 0,
        hoursSpent: 0
      };
    }

    const totalInterviews = interviewHistory.length;
    const scores = interviewHistory.map((i: any) => i.score || 0).filter((s: number) => s > 0);
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;
    
    // Calculate improvement rate (compare last 5 interviews with previous 5)
    let improvementRate = 0;
    if (scores.length >= 10) {
      const recent = scores.slice(-5);
      const previous = scores.slice(-10, -5);
      const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
      const previousAvg = previous.reduce((a: number, b: number) => a + b, 0) / previous.length;
      improvementRate = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
    }

    const hoursSpent = interviewHistory.reduce((total: number, i: any) => {
      const duration = i.duration || '0 min';
      const minutes = parseInt(duration) || 0;
      return total + minutes / 60;
    }, 0);

    return {
      totalInterviews,
      averageScore,
      improvementRate: improvementRate || 15, // fallback
      hoursSpent: Math.round(hoursSpent * 10) / 10
    };
  })();

  // Get recent interviews (last 3) from history
  const recentInterviews = interviewHistory.slice(0, 3).map((interview: any) => ({
    id: interview.session_id || interview.id,
    type: interview.interview_type || interview.type || "Technical Interview",
    role: interview.role || userProfile?.estimated_role || userProfile?.role || "Software Engineer",
    date: interview.date || new Date().toISOString().split('T')[0],
    score: interview.score || interview.overallScore || 0,
    duration: interview.duration || "45 min",
    status: "completed"
  }));

  const upcomingGoals = [
    { id: 1, title: "Complete 5 technical interviews", progress: Math.min(100, Math.round((userStats.totalInterviews / 5) * 100)), icon: Target },
    { id: 2, title: "Improve confidence score to 90+", progress: Math.min(100, Math.round((userStats.averageScore / 90) * 100)), icon: TrendingUp },
    { id: 3, title: "Practice 10 behavioral questions", progress: Math.min(100, Math.round((userStats.totalInterviews / 10) * 100)), icon: Brain }
  ];

  const recommendations = [
    {
      id: 1,
      title: "System Design Fundamentals",
      description: "Based on your recent interviews, focus on distributed systems",
      icon: BookOpen,
      gradient: "from-sky-400 to-cyan-400"
    },
    {
      id: 2,
      title: "Confidence Building",
      description: "Practice speaking more assertively in your responses",
      icon: Zap,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "STAR Method Practice",
      description: "Improve your behavioral interview answer structure",
      icon: Star,
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  const handleStartInterview = (interviewType?: string) => {
    if (interviewType) {
      // Store interview type preference
      const profile = userProfile || {};
      profile.interview_type = interviewType.toLowerCase();
      localStorage.setItem('interviewProfile', JSON.stringify(profile));
    }
    navigate('/setup');
  };

  const handleViewReport = (sessionId: string) => {
    navigate(`/report?sessionId=${sessionId}`);
  };

  const userName = userProfile?.name || userProfile?.estimated_role || "User";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h2>
            <p className="text-gray-400">Here's your interview preparation progress</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: "Total Interviews", 
                value: userStats.totalInterviews, 
                icon: Video, 
                gradient: "from-sky-400 to-cyan-400",
                change: interviewHistory.length > 0 ? `${interviewHistory.length} total` : "Start your first interview"
              },
              { 
                label: "Average Score", 
                value: userStats.averageScore > 0 ? `${userStats.averageScore}%` : "N/A", 
                icon: Trophy, 
                gradient: "from-purple-500 to-pink-500",
                change: userStats.improvementRate > 0 ? `+${userStats.improvementRate}% improvement` : "No data yet"
              },
              { 
                label: "Improvement Rate", 
                value: `${userStats.improvementRate > 0 ? userStats.improvementRate : 0}%`, 
                icon: TrendingUp, 
                gradient: "from-orange-500 to-yellow-500",
                change: "Last 30 days"
              },
              { 
                label: "Hours Practiced", 
                value: userStats.hoursSpent, 
                icon: Clock, 
                gradient: "from-blue-400 to-purple-500",
                change: "This month"
              }
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-sky-300 bg-sky-400/10 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Start New Interview */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Start New Interview</h3>
                        <p className="text-gray-400">Choose your interview type and begin practicing</p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {[
                        { name: "Technical", icon: Brain, color: "from-sky-400 to-cyan-400", type: "technical" },
                        { name: "Behavioral", icon: Target, color: "from-purple-500 to-pink-500", type: "behavioral" },
                        { name: "Case Study", icon: FileText, color: "from-orange-500 to-yellow-500", type: "case_study" },
                        { name: "System Design", icon: Activity, color: "from-blue-400 to-purple-500", type: "system_design" }
                      ].map((type, i) => (
                        <button
                          key={i}
                          onClick={() => handleStartInterview(type.type)}
                          className="group/btn relative"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${type.color} rounded-xl blur opacity-0 group-hover/btn:opacity-50 transition-all duration-300`}></div>
                          <div className="relative flex items-center space-x-3 bg-slate-700/30 border border-white/10 px-4 py-3 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                            <div className={`p-2 bg-gradient-to-r ${type.color} rounded-lg`}>
                              <type.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{type.name}</span>
                            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleStartInterview()}
                      className="w-full relative group/main"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover/main:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold transform group-hover/main:scale-105 transition-all duration-300">
                        <Plus className="w-5 h-5" />
                        <span>Start Practice Session</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-sky-300" />
                  Your Goals
                </h3>
                <div className="space-y-4">
                  {upcomingGoals.map((goal) => (
                    <div key={goal.id} className="group/goal">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300 group-hover/goal:text-white transition-colors">
                          {goal.title}
                        </span>
                        <span className="text-xs font-semibold text-sky-300">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Interviews & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Interviews */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <History className="w-5 h-5 mr-2 text-sky-300" />
                    Recent Interviews
                  </h3>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="text-sm text-sky-300 hover:text-sky-200 flex items-center transition-colors"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentInterviews.length > 0 ? (
                    recentInterviews.map((interview) => (
                      <div 
                        key={interview.id}
                        onClick={() => handleViewReport(interview.id)}
                        className="group/item relative cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover/item:opacity-100 transition-all duration-300"></div>
                        <div className="relative bg-slate-700/30 border border-white/10 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white group-hover/item:text-sky-300 transition-colors">
                                {interview.type}
                              </h4>
                              <p className="text-sm text-gray-400">{interview.role}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
                                {interview.score || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">Score</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-white/10">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {interview.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {interview.duration}
                            </span>
                            <span className="flex items-center text-sky-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No interviews yet</p>
                      <p className="text-sm mt-2">Start your first interview to see it here!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
              <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-sky-300" />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      onClick={() => handleStartInterview()}
                      className="group/rec relative cursor-pointer"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${rec.gradient} rounded-xl blur opacity-0 group-hover/rec:opacity-50 transition-all duration-300`}></div>
                      <div className="relative bg-slate-700/30 border border-white/10 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 bg-gradient-to-r ${rec.gradient} rounded-lg flex-shrink-0`}>
                            <rec.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1 group-hover/rec:text-sky-300 transition-colors">
                              {rec.title}
                            </h4>
                            <p className="text-sm text-gray-400">{rec.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover/rec:text-sky-300 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
