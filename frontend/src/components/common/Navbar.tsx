import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mic, BarChart3, Home, Info, User, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAuthenticated(user.isAuthenticated === true);
          setUserName(user.name || user.email || 'User');
        } catch (e) {
          setIsAuthenticated(false);
          setUserName('');
        }
      } else {
        setIsAuthenticated(false);
        setUserName('');
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (e.g., when user logs in from another tab)
    window.addEventListener('storage', checkAuth);
    // Listen for custom auth change events (same tab)
    window.addEventListener('authChange', checkAuth);
    // Also check on focus
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.isAuthenticated = false;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('user');
    }
    setIsAuthenticated(false);
    setUserName('');
    // Trigger auth change event for Navbar update
    window.dispatchEvent(new Event('authChange'));
    navigate('/signin');
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'interview', label: 'Start Interview', icon: Mic, href: '/setup' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard', protected: true },
    { id: 'reports', label: 'Report', icon: BarChart3, href: '/report', protected: true },
    { id: 'about', label: 'About', icon: Info, href: '/about' }
  ].filter(link => !link.protected || isAuthenticated);

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 ${
        scrolled
          ? 'backdrop-blur-2xl shadow-2xl border-b border-white/10'
          : ''
      }`}>

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div onClick={() => navigate('/')} className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-sky-400 to-sky-500 p-2.5 rounded-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent tracking-tight">
                  Intervize
                </span>
                <div className="text-xs text-gray-500 -mt-1">AI Interview Coach</div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveLink(link.id);
                    navigate(link.href);
                  }}
                  className={`relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 group ${
                    activeLink === link.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Active Background */}
                  {activeLink === link.id && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-sky-500/20 rounded-xl blur-sm"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-sky-500/10 rounded-xl border border-sky-400/30"></div>
                    </>
                  )}
                  
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <span className="relative flex items-center space-x-2">
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </span>
                  
                  {/* Bottom Indicator */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-300 ${
                    activeLink === link.id ? 'w-3/4' : 'w-0 group-hover:w-1/2'
                  }`}></div>
                </button>
              ))}
            </div>

            {/* Right Side - Login/Sign Up or User Profile */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* User Profile */}
                  <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-gray-400">Signed in</p>
                    </div>
                  </div>
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl font-medium text-white hover:bg-white/10 transition-all duration-300">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Sign In Button */}
                  <button 
                    onClick={() => navigate('/signin')}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl font-medium text-white hover:bg-white/10 transition-all duration-300">
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </div>
                  </button>
                  {/* Sign Up Button */}
                  <button 
                    onClick={() => navigate('/signup')}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      <span>Sign Up</span>
                </div>
              </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveLink(link.id);
                  setMobileMenuOpen(false);
                  navigate(link.href);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeLink === link.id
                    ? 'bg-gradient-to-r from-sky-400/20 to-sky-500/20 text-white border border-sky-400/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </button>
            ))}
            
            {/* Mobile Auth Buttons */}
            {isAuthenticated ? (
              <>
                <div className="w-full mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{userName}</p>
                      <p className="text-xs text-gray-400">Signed in</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500/20 border border-red-500/30 px-6 py-3 rounded-xl font-semibold text-red-300 hover:bg-red-500/30 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full mt-4 space-y-2">
                <button 
                  onClick={() => {
                    navigate('/signin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
                >
              <User className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
                <button 
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
                >
                  <span>Sign Up</span>
            </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;