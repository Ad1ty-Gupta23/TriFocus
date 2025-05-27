import React, { useState, useEffect } from 'react';
import { Mail, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const books = [
  {
    id: 1,
    title: 'Atomic Habits',
    author: 'James Clear',
    tokens: 30,
    cover: '📘',
    description: 'An easy & proven way to build good habits & break bad ones.',
    pdfLink: '/books/atomic-habits.pdf'
  },
  {
    id: 2,
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    tokens: 25,
    cover: '📗',
    description: 'A guide to spiritual enlightenment and being present.',
    pdfLink: '/books/power-of-now.pdf'
  },
  {
    id: 3,
    title: 'Deep Work',
    author: 'Cal Newport',
    tokens: 20,
    cover: '📙',
    description: 'Rules for focused success in a distracted world.',
    pdfLink: '/books/deep-work.pdf'
  }
];

const RedeemStore = () => {
  const [userTokens, setUserTokens] = useState(50);
  const [purchased, setPurchased] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:5000/api/user/therapists");
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setTherapists(data);
      } catch (err) {
        console.error("Failed to fetch therapists:", err);
        setError("Failed to load therapists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleRedeem = (book) => {
    if (userTokens < book.tokens) {
      alert('Not enough tokens to redeem this book!');
      return;
    }
    if (purchased.includes(book.id)) {
      alert('You have already redeemed this book.');
      return;
    }
    setUserTokens(userTokens - book.tokens);
    setPurchased([...purchased, book.id]);
    alert(`Successfully redeemed "${book.title}"!`);
  };

  const UserCard = ({ user, roleColor }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${roleColor} shadow-lg`}>
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg">{user.username}</h3>
          <div className="flex items-center text-white/80 text-sm mt-2">
            <Mail className="w-4 h-4 mr-2" />
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, count, icon: Icon }) => (
    <div className="flex items-center space-x-4 mb-8">
      <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="text-white/70 text-lg">{count} {count === 1 ? 'member' : 'members'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🎁 Redeem Store</h1>
        <p className="text-center text-white/80 mb-6">Available Tokens: <span className="font-bold">{userTokens}</span></p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {books.map(book => (
            <div key={book.id} className="bg-white/10 p-6 rounded-2xl shadow-lg">
              <div className="text-5xl mb-4">{book.cover}</div>
              <h2 className="text-2xl font-bold mb-1">{book.title}</h2>
              <p className="text-sm text-white/70 mb-2">by {book.author}</p>
              <p className="text-sm text-white/80 mb-4">{book.description}</p>
              <p className="text-white/90 mb-4">🔑 {book.tokens} Tokens</p>
              {purchased.includes(book.id) ? (
                <a
                  href={book.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white inline-block"
                >
                  📥 Download
                </a>
              ) : (
                <button
                  onClick={() => handleRedeem(book)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white"
                >
                  Redeem
                </button>
              )}
            </div>
          ))}
        </div>

        <SectionHeader title="Available Therapists" count={therapists.length} icon={UserCheck} />
        {loading ? (
          <div className="flex items-center justify-center space-x-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xl">Loading therapists...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 rounded-xl p-6 flex items-center space-x-4">
            <AlertCircle className="w-8 h-8 text-red-300" />
            <div>
              <h3 className="font-semibold text-red-200 text-lg">Error Loading Data</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        ) : therapists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {therapists.map((therapist) => (
              <UserCard 
                key={therapist._id} 
                user={therapist} 
                roleColor="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/70">
            <UserCheck className="w-16 h-16 mx-auto mb-6 text-white/40" />
            <p className="text-xl">No therapists available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemStore;
