import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../layout/Layout';
import { 
  Mail, Lock, Eye, EyeOff, Github, User, Zap, ChevronRight
} from 'lucide-react';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAuthenticated === true) {
          const from = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      } catch (e) {
        // Invalid user data, continue with sign up
      }
    }
  }, [navigate, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address!');
      return;
    }
    
    // Check if user already exists
    const existingUser = localStorage.getItem('user');
    if (existingUser) {
      try {
        const userData = JSON.parse(existingUser);
        if (userData.email === formData.email) {
          setError('An account with this email already exists. Please sign in instead.');
          return;
        }
      } catch (e) {
        // Continue with sign up
      }
    }
    
    // Create new user
    const newUser = {
      name: formData.name,
      email: formData.email,
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Store user info in localStorage for demo
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Store in interview profile if available
    const profileStr = localStorage.getItem('interviewProfile');
    if (profileStr) {
      try {
        const profileData = JSON.parse(profileStr);
        profileData.name = formData.name;
        profileData.email = formData.email;
        localStorage.setItem('interviewProfile', JSON.stringify(profileData));
      } catch (e) {
        // Continue without profile update
      }
    }
    
    // Trigger auth change event for Navbar update
    window.dispatchEvent(new Event('authChange'));
    
    // Navigate to intended destination or dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative flex items-center justify-center min-h-screen px-6 py-20">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div 
                    onClick={() => navigate('/')}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer"
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-white to-sky-300 bg-clip-text text-transparent">
                      Start Your Journey
                    </span>
                  </h1>
                  <p className="text-gray-400">Create your account and ace interviews</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}
                  
                  {/* Name Input */}
                  <div className="relative group/input">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-sky-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="relative group/input">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-sky-400 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group/input">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-sky-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative group/input">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-sky-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start space-x-3 cursor-pointer group/check">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 mt-1 rounded border-white/10 bg-slate-900/50 text-sky-500 focus:ring-sky-400/20"
                      required
                    />
                    <span className="text-sm text-gray-400 group-hover/check:text-gray-300 transition-colors">
                      I agree to the <button type="button" className="text-sky-400 hover:text-sky-300">Terms of Service</button> and <button type="button" className="text-sky-400 hover:text-sky-300">Privacy Policy</button>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative w-full group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-cyan-500 py-3 rounded-xl font-bold hover:shadow-2xl transform group-hover/btn:scale-[1.02] transition-all duration-300">
                      <span>Create Account</span>
                      <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-800/40 text-gray-400">Or sign up with</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => alert('GitHub sign up coming soon!')}
                      className="flex items-center justify-center space-x-2 bg-slate-900/50 border border-white/10 py-3 rounded-xl hover:bg-slate-900 hover:border-white/20 transition-all duration-300 group/social"
                    >
                      <Github className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
                      <span className="font-medium">GitHub</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Google sign up coming soon!')}
                      className="flex items-center justify-center space-x-2 bg-slate-900/50 border border-white/10 py-3 rounded-xl hover:bg-slate-900 hover:border-white/20 transition-all duration-300 group/social"
                    >
                      <Mail className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
                      <span className="font-medium">Google</span>
                    </button>
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="mt-8 text-center text-sm">
                  <span className="text-gray-400">Already have an account? </span>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;

