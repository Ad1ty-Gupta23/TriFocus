import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Mail, UserCheck, AlertCircle, Loader2 } from "lucide-react";

const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use your actual API endpoint - note the correct path structure
        const res = await axios.get("http://localhost:5000/api/user/therapists");
        
        // Since your getTherapists controller should return only therapists
        setTherapists(res.data);
      } catch (err) {
        console.error("Failed to fetch therapists:", err);
        setError("Failed to load therapists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const UserCard = ({ user, roleColor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${roleColor}`}>
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.username}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <Mail className="w-4 h-4 mr-1" />
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, count, icon: Icon }) => (
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-green-100 rounded-lg">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{count} {count === 1 ? 'member' : 'members'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Our Professional Therapists</h1>
            <p className="text-green-100">Connect with qualified mental health professionals</p>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading therapists...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Community Support Team</h1>
            <p className="text-green-100">Meet our Volunteers and Therapists</p>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Community Support Team</h1>
          <p className="text-green-100">Meet our Volunteers and Therapists</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SectionHeader 
          title="Available Therapists" 
          count={therapists.length}
          icon={UserCheck}
        />
        {therapists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {therapists.map((therapist) => (
              <UserCard 
                key={therapist._id} 
                user={therapist} 
                roleColor="bg-green-500"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No therapists available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistList;