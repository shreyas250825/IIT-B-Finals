import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mic, BarChart3, Home, Info, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'interview', label: 'Start Interview', icon: Mic, href: '/setup' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 'about', label: 'About', icon: Info, href: '/about' }
  ];

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 ${
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
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
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-sm"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/30"></div>
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
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ${
                    activeLink === link.id ? 'w-3/4' : 'w-0 group-hover:w-1/2'
                  }`}></div>
                </button>
              ))}
            </div>

            {/* Right Side - Login/Profile Button */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="relative group overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Button Content */}
                <div className="relative flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Login</span>
                </div>
              </button>
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
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </button>
            ))}
            
            {/* Mobile Login Button */}
            <button onClick={() => navigate('/login')} className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl font-semibold text-white shadow-lg">
              <User className="w-5 h-5" />
              <span>Login / Sign Up</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;