import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
const FocusForestTimer = () => {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // After successful login:
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(prev => prev - 1), 1000);
    } else if (isRunning && seconds === 0) {
      clearInterval(interval);
      setIsRunning(false);
      setSessionComplete(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  const handleStart = () => {
    setSessionComplete(false);
    setSeconds(customMinutes * 60);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionComplete(false);
    setSeconds(customMinutes * 60);
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = ((customMinutes * 60 - seconds) / (customMinutes * 60)) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
     <Navbar isLoggedIn={isLoggedIn} user={user} />
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center px-4 py-10">
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center w-full max-w-lg border border-white/20">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 blur-xl opacity-30 rounded-3xl animate-pulse" />

        <h1 className="text-4xl font-bold mb-4 relative z-10">🌿 Focus Forest</h1>

        <div className="mb-4 relative z-10">
          <label className="text-sm mb-2 block">⏱ Set Timer (minutes):</label>
          <input
            type="number"
            min="1"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            disabled={isRunning}
            className="w-24 p-2 text-black text-center font-bold rounded-lg"
          />
        </div>

        <div className="relative w-40 h-40 mx-auto my-8 z-10">
          <svg className="absolute top-0 left-0 transform -rotate-90" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#4ade80"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="10"
              fill="none"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-mono">
            {formatTime(seconds)}
          </div>
        </div>

        {sessionComplete && (
          <p className="text-green-400 text-lg font-medium mb-4">🎉 Time's up! You’ve earned a token!</p>
        )}

        <div className="flex justify-center gap-4 mt-4 relative z-10">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-white font-semibold disabled:opacity-50"
          >
            Start
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl text-white font-semibold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default FocusForestTimer;
