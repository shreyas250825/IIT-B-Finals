import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Mail, Heart, Rocket, Shield, Zap, TrendingUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Demo', href: '#demo' },
        { label: 'FAQ', href: '#faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Blog', href: '#blog' },
        { label: 'Press', href: '#press' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Help Center', href: '#help' },
        { label: 'Community', href: '#community' },
        { label: 'API', href: '#api' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'Disclaimer', href: '#disclaimer' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#twitter', color: 'from-blue-400 to-blue-600' },
    { icon: Linkedin, href: '#linkedin', color: 'from-blue-500 to-blue-700' },
    { icon: Github, href: '#github', color: 'from-gray-600 to-gray-800' },
    { icon: Mail, href: '#mail', color: 'from-purple-500 to-pink-500' }
  ];

  const features = [
    { icon: Shield, text: 'Enterprise Security' },
    { icon: Zap, text: 'Lightning Fast' },
    { icon: TrendingUp, text: '99.9% Uptime' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border-t border-white/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl transform group-hover:scale-110 transition-all duration-300 shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Intervize
                </span>
                <div className="text-xs text-gray-500">AI Interview Excellence</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
              Revolutionizing interview preparation with cutting-edge AI technology. 
              Practice, learn, and succeed with personalized feedback.
            </p>

            {/* Feature Badges */}
            <div className="space-y-2 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <feature.icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-gray-400">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${social.color} rounded-lg blur opacity-0 group-hover:opacity-75 transition-all duration-300`}></div>
                  <div className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-1">
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {section.title}
                </span>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center"
                    >
                      <span className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <Rocket className="w-6 h-6 mr-2 text-blue-400" />
                    Stay Updated
                  </h3>
                  <p className="text-gray-400">
                    Get the latest interview tips, AI insights, and product updates delivered to your inbox.
                  </p>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                    <button className="relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold text-white whitespace-nowrap transform group-hover:scale-105 transition-all duration-300">
                        Subscribe
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© {currentYear} Intervize.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Built for IIT Bombay Tech Fest with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex items-center space-x-6 text-sm">
              {['Privacy', 'Terms', 'Cookies', 'Contact'].map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </div>

          {/* Tech Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">
                Powered by Advanced AI • Real-time Analysis • Enterprise Grade Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;