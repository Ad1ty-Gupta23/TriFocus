import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import EyeDetectionTimer from './components/EyeMonitor'
import Game from './pages/game1'
import PokemonBattle from "./brawl/PokemonBattle.jsx";
import Journal from './components/Journal';
import TherapistList from './components/TherapistList';
import GamesHub from './pages/Games.jsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/" element={<Home />}></Route>
        <Route path="/meditate" element={<EyeDetectionTimer />}></Route>
        <Route path="/fruit" element={<Game />}></Route>
        <Route path="/pokemon" element={<PokemonBattle />}></Route>
        <Route path="/therapist" element={<TherapistList />}></Route>
        <Route path="/games" element={<GamesHub />}></Route>
        <Route 
            path="/journal" 
            element={ <Journal user={user} />} 
          />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
