import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar"; // Import the separated Navbar component

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("meditation");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userInfo));
    }

    // Listen for wallet connection events from Navbar
    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    // Check if MetaMask is connected on load
    checkWalletConnection();

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, []);

  // Check if MetaMask is connected
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

  // Handle wallet connected event
  const handleWalletConnected = () => {
    setIsWalletConnected(true);
  };

  // Handle wallet disconnected event
  const handleWalletDisconnected = () => {
    setIsWalletConnected(false);
  };

  // Function to check wallet before accessing features
  const checkWalletBeforeAccess = (action) => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to access this feature");
      return;
    }
    action();
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        activeSection={activeSection}
        handleSectionChange={handleSectionChange}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Inner Peace
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              TriFocus helps you manage stress, improve focus, and enhance your mental well-being
              through guided meditation and mood tracking.
            </p>
            {!isLoggedIn && (
              <div className="space-y-4">
                <Link 
                  to="/register" 
                  className="inline-block px-8 py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Start Your Journey
                  <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                {!isWalletConnected && (
                  <p className="text-sm text-red-500 font-medium animate-pulse">
                    <svg className="inline-block mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Connect your wallet to access all features
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeSection === "meditation" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Meditation Sessions</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover inner peace through our expertly crafted meditation experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🧘",
                  title: "Guided Meditation",
                  description: "Follow along with our expert-led meditation sessions designed for all experience levels.",
                  gradient: "from-blue-400 to-indigo-600"
                },
                {
                  icon: "⏱️",
                  title: "Focus Timer",
                  description: "Customize your meditation duration with our adjustable focus timer.",
                  gradient: "from-purple-400 to-pink-600"
                },
                {
                  icon: "🎵",
                  title: "Ambient Sounds",
                  description: "Enhance your meditation with calming nature sounds and ambient music.",
                  gradient: "from-green-400 to-teal-600"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
                    <div className="text-5xl mb-6 text-center">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">{feature.description}</p>
                    {isLoggedIn && isWalletConnected ? (
                      <button className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                        Start Session
                      </button>
                    ) : !isLoggedIn ? (
                      <Link to="/login" className={`block w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center`}>
                        Login to Access
                      </Link>
                    ) : (
                      <button 
                        onClick={() => toast.error("Please connect your wallet to access this feature")}
                        className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 opacity-80`}
                      >
                        Connect Wallet to Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "mood" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Mood Tracking</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understand your emotional patterns and build better mental health habits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "📊",
                  title: "Daily Mood Log",
                  description: "Record your daily emotions and track patterns over time to gain insights into your mental well-being.",
                  gradient: "from-cyan-400 to-blue-600"
                },
                {
                  icon: "📝",
                  title: "Reflection Journal",
                  description: "Write daily reflections to process your thoughts and emotions in a structured way.",
                  gradient: "from-amber-400 to-orange-600"
                },
                {
                  icon: "📈",
                  title: "Progress Insights",
                  description: "Visualize your emotional patterns and meditation progress with detailed analytics.",
                  gradient: "from-emerald-400 to-green-600"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
                    <div className="text-5xl mb-6 text-center">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">{feature.description}</p>
                    {isLoggedIn && isWalletConnected ? (
                      <button className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                        Open Feature
                      </button>
                    ) : !isLoggedIn ? (
                      <Link to="/login" className={`block w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center`}>
                        Login to Access
                      </Link>
                    ) : (
                      <button 
                        onClick={() => toast.error("Please connect your wallet to access this feature")}
                        className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 opacity-80`}
                      >
                        Connect Wallet to Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "resources" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Mindfulness Resources</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Expand your knowledge with our curated collection of mindfulness content
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "📚",
                  title: "Articles & Guides",
                  description: "Explore our collection of articles on mindfulness, meditation techniques, and mental well-being.",
                  gradient: "from-violet-400 to-purple-600"
                },
                {
                  icon: "🎓",
                  title: "Beginner Courses",
                  description: "Start your meditation journey with our structured courses for beginners.",
                  gradient: "from-rose-400 to-pink-600"
                },
                {
                  icon: "👥",
                  title: "Community Support",
                  description: "Connect with like-minded individuals on your mindfulness journey through our community forums.",
                  gradient: "from-teal-400 to-cyan-600"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50">
                    <div className="text-5xl mb-6 text-center">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">{feature.description}</p>
                    {index === 0 ? (
                      <button 
                        onClick={() => isWalletConnected ? null : toast.error("Please connect your wallet to browse the library")}
                        className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${!isWalletConnected && 'opacity-80'}`}
                      >
                        {isWalletConnected ? "Browse Library" : "Connect Wallet to Browse"}
                      </button>
                    ) : isLoggedIn && isWalletConnected ? (
                      <button className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                        Access Feature
                      </button>
                    ) : !isLoggedIn && isWalletConnected ? (
                      <Link to="/login" className={`block w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center`}>
                        Login to Access
                      </Link>
                    ) : (
                      <button 
                        onClick={() => toast.error("Please connect your wallet to access this feature")}
                        className={`w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 opacity-80`}
                      >
                        Connect Wallet to Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Real stories from our mindfulness community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "TriFocus has transformed my daily routine. The guided meditations have helped me manage my anxiety and improve my focus at work.",
                author: "Sarah K.",
                rating: 5
              },
              {
                text: "The mood tracking feature has given me incredible insights into my emotional patterns. I've been able to make positive changes based on the data.",
                author: "Michael T.",
                rating: 5
              },
              {
                text: "As a beginner to meditation, I found the resources and guided sessions extremely helpful. The interface is intuitive and the community is supportive.",
                author: "Jamie L.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {testimonial.author.charAt(0)}
                  </div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                TriFocus
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your companion for mindfulness, focus, and emotional well-being.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">Quick Links</h3>
              <div className="space-y-2">
                {["meditation", "mood", "resources"].map((section) => (
                  <button
                    key={section}
                    onClick={() => handleSectionChange(section)}
                    className="block text-gray-400 hover:text-white transition-colors capitalize"
                  >
                    {section === "mood" ? "Mood Tracking" : section}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-400">Account</h3>
              <div className="space-y-2">
                {isLoggedIn && isWalletConnected ? (
                  <>
                    <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                    <button onClick={() => window.location.reload()} className="block text-gray-400 hover:text-white transition-colors">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TriFocus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;