import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Video, BarChart3, Brain, Zap, Users, Sparkles, TrendingUp, Award, User } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const featuresRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>



      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">AI-Powered Interview Excellence</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Master Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Interview Skills
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the future of interview preparation with AI-powered analysis, 
              real-time feedback, and personalized coaching that adapts to your performance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button onClick={() => navigate('/setup')} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <Mic className="w-6 h-6" />
                  <span>Start Free Interview</span>
                </div>
              </button>

              <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center space-x-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <Video className="w-6 h-6" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 3D AI Avatar Card */}
            <div 
              className="relative max-w-md mx-auto perspective-1000"
              style={{
                transform: `rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="text-8xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Interview Coach
                </h3>
                <p className="text-gray-400">
                  Ready to elevate your performance?
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
            {[
              { value: '10K+', label: 'Interviews Conducted', icon: Users },
              { value: '95%', label: 'Success Rate', icon: TrendingUp },
              { value: '4.9/5', label: 'User Rating', icon: Award }
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center transform group-hover:scale-105 transition-all duration-300">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience cutting-edge technology designed to transform your interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Advanced neural networks evaluate your technical knowledge and soft skills with unprecedented accuracy.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Video,
                title: "Real-time Feedback",
                description: "Instant insights on body language, facial expressions, and non-verbal communication patterns.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Mic,
                title: "Voice Analysis",
                description: "Comprehensive speech analytics tracking pace, clarity, filler words, and vocal confidence.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: BarChart3,
                title: "Detailed Reports",
                description: "In-depth performance analytics with actionable recommendations and progress tracking.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Zap,
                title: "Adaptive Learning",
                description: "Dynamic difficulty adjustment that evolves with your skill level for optimal growth.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Users,
                title: "Role-Specific Training",
                description: "Customized question sets for Software Engineering, Data Science, PM, and 20+ other roles.",
                gradient: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                  <div className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default LandingPage;