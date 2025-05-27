import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("meditation");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userInfo));
    }

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);
    checkWalletConnection();

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, []);

  const checkWalletConnection = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const handleWalletConnected = () => setIsWalletConnected(true);
  const handleWalletDisconnected = () => setIsWalletConnected(false);
  const handleSectionChange = (section) => setActiveSection(section);

  // Professional color scheme
  const colors = {
    primary: "from-indigo-600 to-purple-600",
    secondary: "from-blue-500 to-cyan-500",
    accent: "from-emerald-500 to-teal-500",
    dark: "bg-gray-900",
    light: "bg-gray-50"
  };

  return (
    <div className="max-h-screen max-w-screen bg-gray-50 font-sans antialiased">
      {/* Modern Navbar */}
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        activeSection={activeSection}
        handleSectionChange={handleSectionChange}
        colors={colors}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Elevate Your Mind with
              <span className="block mt-3 bg-gradient-to-r from-indigo-300 to-purple-200 bg-clip-text text-transparent">
                Trifocus
              </span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              The Web3-powered platform that combines AI-guided meditation, biometric verification, 
              and token rewards for sustainable mental wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/register" 
                    className="px-8 py-3.5 text-lg font-medium bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-8 py-3.5 text-lg font-medium border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className={`px-8 py-3.5 text-lg font-medium bg-gradient-to-r ${colors.primary} text-white rounded-lg hover:shadow-xl transition-all duration-300`}
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
            
            {!isWalletConnected && isLoggedIn && (
              <div className="pt-4">
                <div className="inline-flex items-center px-4 py-2 bg-indigo-800 bg-opacity-50 rounded-lg text-indigo-100 text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Connect your wallet to unlock all features
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeSection === "meditation" && "Meditation Reinvented"}
              {activeSection === "mood" && "Emotional Intelligence"}
              {activeSection === "resources" && "Mindfulness Resources"}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeSection === "meditation" && "Biometrically verified sessions with tangible rewards"}
              {activeSection === "mood" && "Data-driven insights into your emotional patterns"}
              {activeSection === "resources" && "Curated knowledge to deepen your practice"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(activeSection === "meditation" ? [
              {
                icon: (
                  <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3-3.134 3-7 3zm0-10c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3-3.134 3-7 3zm0 6.5c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3-3.134 3-7 3z" />
                  </svg>
                ),
                title: "Guided Sessions",
                description: "AI-curated meditation journeys with real-time biometric verification",
                gradient: colors.primary
              },
              
              {
                icon: (
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                ),
                title: "Ambient Soundscapes",
                description: "Scientifically-designed audio environments for deep focus",
                gradient: colors.accent
              }
            ] : activeSection === "mood" ? [
              {
                icon: (
                  <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Mood Analytics",
                description: "Visualize emotional patterns with AI-powered insights",
                gradient: colors.primary
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "Reflection Journal",
                description: "Secure, encrypted entries with sentiment analysis",
                gradient: colors.secondary
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Progress Tracking",
                description: "Correlate meditation habits with mood improvements",
                gradient: colors.accent
              }
            ] : [
              {
                icon: (
                  <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
                title: "Expert Articles",
                description: "Research-backed content on mindfulness and mental wellness",
                gradient: colors.primary
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "Learning Paths",
                description: "Structured courses for beginners to advanced practitioners",
                gradient: colors.secondary
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Community Hub",
                description: "Connect with like-minded individuals on similar journeys",
                gradient: colors.accent
              }
            ]).map((feature, index) => (
              <div key={index} className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 rounded-xl"></div>
                <div className="relative h-full bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className="mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed flex-grow">{feature.description}</p>
                  
                  {isLoggedIn && isWalletConnected ? (
                    <Link 
                      to={activeSection === "meditation" ? "/meditate" : "/dashboard"} 
                      className={`mt-auto px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 text-center`}
                    >
                      {activeSection === "resources" ? "Explore" : "Begin"}
                    </Link>
                  ) : !isLoggedIn ? (
                    <Link 
                      to="/login" 
                      className={`mt-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 text-center`}
                    >
                      Sign In to Access
                    </Link>
                  ) : (
                    <button 
                      onClick={() => toast.warning("Connect your wallet to access this feature")}
                      className={`mt-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300`}
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "500K+", label: "Sessions Completed" },
              { value: "95%", label: "Retention Rate" },
              { value: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Wellness Seekers</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from our community members who've transformed their mental wellness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Trifocus' biometric verification finally made me consistent with meditation. The token rewards are just icing on the cake.",
                name: "Dr. Sarah Chen",
                role: "Neuroscientist",
                avatar: "SC"
              },
              {
                quote: "As a crypto enthusiast, I love how Trifocus merges Web3 with mental health. The data ownership model is revolutionary.",
                name: "Mark Williams",
                role: "Blockchain Developer",
                avatar: "MW"
              },
              {
                quote: "The mood tracking correlations helped me identify stress triggers I never noticed before. Life-changing platform.",
                name: "Lisa Rodriguez",
                role: "UX Designer",
                avatar: "LR"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start mb-6">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? "bg-indigo-500" : index === 1 ? "bg-purple-500" : "bg-emerald-500"}`}>
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full filter blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white bg-opacity-10 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Mental Wellness?</h2>
            <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
              Join thousands who've improved focus, reduced stress, and built sustainable habits with Trifocus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/register" 
                    className="px-8 py-3.5 text-lg font-medium bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-8 py-3.5 text-lg font-medium border-2 border-white text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="px-8 py-3.5 text-lg font-medium bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">Trifocus</h3>
              <p className="text-gray-400 leading-relaxed">
                The future of accountable mental wellness, powered by Web3 and AI.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-200">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleSectionChange("meditation")} className="text-gray-400 hover:text-white transition-colors">Meditation</button></li>
                <li><button onClick={() => handleSectionChange("mood")} className="text-gray-400 hover:text-white transition-colors">Mood Tracking</button></li>
                <li><button onClick={() => handleSectionChange("resources")} className="text-gray-400 hover:text-white transition-colors">Resources</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-200">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-200">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">© 2024 Trifocus. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="https://github.com/" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default Home;