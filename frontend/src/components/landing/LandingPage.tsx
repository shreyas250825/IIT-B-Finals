import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, BarChart3, Brain, Users, Sparkles, TrendingUp, Award,
  CheckCircle, Star, BookOpen, Trophy, GraduationCap, ArrowRight,
  PlayCircle, Target
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-sky-400/10 border border-sky-400/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-sky-300" />
                <span className="text-sm text-sky-200">AI-Powered Interview Excellence</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
                  Master Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Interview Skills
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                Experience the future of interview preparation with AI-powered analysis, 
                real-time feedback, and personalized coaching that adapts to your performance.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => navigate('/setup')} 
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                    <PlayCircle className="w-6 h-6" />
                    <span>Start Free Trial</span>
                  </div>
                </button>

                <button 
                  onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} 
                  className="flex items-center space-x-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <Video className="w-6 h-6" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-sky-400" />
                  <span>Used by 500+ job seekers</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Star className="w-5 h-5 text-sky-400" />
                  <span>4.9/5 from 100+ reviews</span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500 border border-white/10">
                <img 
                  src="/assets/hero2.png" 
                  alt="Intervize Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '10K+', label: 'Interviews Conducted', icon: Users },
              { value: '95%', label: 'Success Rate', icon: TrendingUp },
              { value: '4.9/5', label: 'User Rating', icon: Award }
            ].map((stat, index) => (
              <div key={index} className="relative group text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform group-hover:scale-105 transition-all duration-300">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-sky-300" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-sky-400/10 border border-sky-400/30 rounded-full text-sm text-sky-300 mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything you need to Ace your Interview
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform provides comprehensive tools to help you prepare, practice, and perfect your interview skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Interview Simulator",
                description: "Practice with our realistic AI interviewer that adapts to your responses and provides follow-up questions.",
                gradient: "from-sky-400 to-cyan-400"
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Get comprehensive feedback on your speech patterns, confidence levels, and answer structure.",
                gradient: "from-cyan-400 to-blue-400"
              },
              {
                icon: Video,
                title: "Video Recording",
                description: "Record your practice sessions to review your body language, facial expressions, and tone.",
                gradient: "from-blue-400 to-purple-500"
              },
              {
                icon: GraduationCap,
                title: "Personalized Coaching",
                description: "Receive tailored recommendations based on your performance to improve specific areas.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: BookOpen,
                title: "Question Library",
                description: "Access 1,000+ interview questions categorized by industry, role, and difficulty level.",
                gradient: "from-pink-500 to-red-500"
              },
              {
                icon: Trophy,
                title: "Progress Tracking",
                description: "Monitor your improvement over time with detailed metrics and historical data.",
                gradient: "from-orange-500 to-yellow-500"
              }
            ].map((feature, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                  <div className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{feature.description}</p>
                  <a href="#" className="inline-flex items-center text-sky-300 hover:text-sky-200 transition-colors text-sm font-medium">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-sky-400/10 border border-sky-400/30 rounded-full text-sm text-sky-300 mb-4">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                How Intervize Works
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get interview-ready in just a few simple steps
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                number: "01",
                title: "Select Your Interview Type",
                description: "Choose from various interview formats (technical, behavioral, case study) and industries.",
                image: "/assets/step1.png",
                icon: Target
              },
              {
                number: "02",
                title: "Practice with AI Interviewer",
                description: "Our AI conducts a realistic interview, asking relevant questions and responding naturally.",
                image: "/assets/step2.png",
                icon: Brain
              },
              {
                number: "03",
                title: "Receive Instant Feedback",
                description: "Get comprehensive analysis on your answers, tone, confidence, and body language.",
                image: "/assets/step3.png",
                icon: BarChart3
              },
              {
                number: "04",
                title: "Improve with Personalized Tips",
                description: "Access tailored recommendations and practice materials based on your performance.",
                image: "/assets/step4.png",
                icon: TrendingUp
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center group"
              >
                {/* Left Side - Content */}
                <div className={`text-left ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl mb-6 text-3xl font-bold shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {step.number}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-sky-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Right Side - Image */}
                <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-sky-400/10 border border-sky-400/30 rounded-full text-sm text-sky-300 mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                What Our Users Say
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from candidates who landed their dream jobs with Intervize
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Aayushi Verma",
                role: "Software Engineer at Microsoft",
                text: "Intervize completely transformed my interview skills. The AI feedback helped me identify areas I didn't even know needed improvement. I went from struggling with interviews to receiving multiple offers!",
                rating: 5,
                image: "/assets/testimonial1.png"
              },
              {
                name: "Siddhi Tiwari",
                role: "Product Manager at Amazon",
                text: "The behavioral interview practice was incredibly realistic. When I did my actual interviews, I felt completely prepared because I had already practiced with similar questions and scenarios.",
                rating: 5,
                image: "/assets/testimonial2.png"
              },
              {
                name: "Arya Salian",
                role: "CFO at Microsoft",
                text: "As someone transitioning careers, the personalized feedback was invaluable. The AI pointed out when I was using too much jargon from my previous industry, which I hadn't even realized I was doing.",
                rating: 5,
                image: "/assets/testimonial3.png"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform group-hover:scale-105 group-hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                  {/* Background Image Effect */}
                  <div 
                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                      backgroundImage: `url(${testimonial.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  
                  <div className="relative z-10">
                    {/* Rating Stars */}
                    <div className="flex mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 group-hover:text-yellow-300 transition-colors" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-300 mb-6 leading-relaxed group-hover:text-white transition-colors text-base">
                      "{testimonial.text}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="relative w-14 h-14 rounded-full object-cover border-2 border-sky-400/50 group-hover:border-sky-400 transition-all duration-300 transform group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
              Ready to ace your next interview?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of job seekers who landed their dream roles with Intervize.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/setup')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <PlayCircle className="w-6 h-6" />
                <span>Start Free Trial</span>
              </div>
            </button>
            <button
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <Video className="w-6 h-6" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
