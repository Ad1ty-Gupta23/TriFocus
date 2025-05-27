import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

// Mock Navbar component since it's imported but not defined


function TherapistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ name: "Dr. Smith" });

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Mock data
  const mockAppointments = [
    {
      id: 1,
      patientName: "John Doe",
      patientEmail: "john.doe@email.com",
      patientWallet: "0x742d35Cc6635C0532925a3b8D84067C7c1c4D78E",
      appointmentDate: "2025-05-30",
      appointmentTime: "10:00 AM",
      duration: 60,
      status: "pending",
      sessionType: "Initial Consultation",
      notes: "First time patient, anxiety issues",
      tokensStaked: 50,
      createdAt: "2025-05-27T08:30:00Z",
      patientPhone: "+1-555-0123"
    },
    {
      id: 2,
      patientName: "Sarah Wilson",
      patientEmail: "sarah.wilson@email.com",
      patientWallet: "0x8ba1f109551bD432803012645Hac136c59C2F321",
      appointmentDate: "2025-05-28",
      appointmentTime: "2:00 PM",
      duration: 45,
      status: "confirmed",
      sessionType: "Follow-up Session",
      notes: "Progress check on depression treatment",
      tokensStaked: 35,
      createdAt: "2025-05-25T14:20:00Z",
      patientPhone: "+1-555-0456"
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      patientEmail: "mike.johnson@email.com",
      patientWallet: "0x9Cd8C28cB1E9F5F123456789123456789123456",
      appointmentDate: "2025-05-29",
      appointmentTime: "11:30 AM",
      duration: 60,
      status: "completed",
      sessionType: "Therapy Session",
      notes: "Completed - Good progress on stress management",
      tokensStaked: 50,
      createdAt: "2025-05-20T09:15:00Z",
      patientPhone: "+1-555-0789"
    },
    {
      id: 4,
      patientName: "Emma Davis",
      patientEmail: "emma.davis@email.com",
      patientWallet: "0xabc123def456789101112131415161718192021",
      appointmentDate: "2025-06-02",
      appointmentTime: "3:30 PM",
      duration: 60,
      status: "pending",
      sessionType: "Crisis Intervention",
      notes: "Urgent - referred from crisis detection system",
      tokensStaked: 75,
      createdAt: "2025-05-27T16:45:00Z",
      patientPhone: "+1-555-0321",
      priority: "high"
    }
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          High Priority
        </span>
      );
    }
    return null;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const matchesDate = !selectedDate || appointment.appointmentDate === selectedDate;
    const matchesSearch = !searchTerm || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.sessionType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesDate && matchesSearch;
  });

  const handleAppointmentAction = (appointment, action) => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedAppointment) return;

    try {
      let updatedStatus = selectedAppointment.status;

      switch (actionType) {
        case "confirm":
          updatedStatus = "confirmed";
          break;
        case "complete":
          updatedStatus = "completed";
          break;
        case "cancel":
          updatedStatus = "cancelled";
          break;
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: updatedStatus }
            : apt
        )
      );

      setShowModal(false);
      setSelectedAppointment(null);
      setActionType("");
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(apt => apt.status === "pending").length;
    const confirmed = appointments.filter(apt => apt.status === "confirmed").length;
    const completed = appointments.filter(apt => apt.status === "completed").length;
    const cancelled = appointments.filter(apt => apt.status === "cancelled").length;

    return { total, pending, confirmed, completed, cancelled };
  };

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading appointments...</p>
        </div>
      </div>
    );
  }

 return (
  <>
  <Navbar isLoggedIn={isLoggedIn} user={user} />
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
    {/* Navbar Section */}
     
    
    {/* Hero Section */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
    Patient Appointments
  </h1>
  <p className="text-xl text-white max-w-3xl mx-auto">
    Manage and track all your patient appointments with ease. Stay organized and provide the best care possible.
  </p>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Filter Appointments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Search</label>
            <input
              type="text"
              placeholder="Search by patient name, email, or session type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">No appointments match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-8 hover:bg-white/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {appointment.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900">{appointment.patientName}</h3>
                          {getPriorityBadge(appointment.priority)}
                        </div>
                        <p className="text-gray-500">{appointment.patientEmail}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="flex items-center text-gray-600">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{appointment.appointmentTime} ({appointment.duration}min)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Session Type</p>
                          <p className="font-medium">{appointment.sessionType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tokens Staked</p>
                          <p className="font-medium">{appointment.tokensStaked} tokens</p>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1 font-medium">Notes:</p>
                          <p className="text-gray-800">{appointment.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAppointmentAction(appointment, "confirm")}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment, "cancel")}
                            className="inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {appointment.status === "confirmed" && (
                        <button
                          onClick={() => handleAppointmentAction(appointment, "complete")}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                          Mark Complete
                        </button>
                      )}

                      <button className="inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {actionType === "confirm" && "Confirm Appointment"}
                {actionType === "complete" && "Mark as Complete"}
                {actionType === "cancel" && "Cancel Appointment"}
              </h3>
              <div className="mb-8">
                <p className="text-gray-600">
                  {actionType === "confirm" && `Are you sure you want to confirm the appointment with ${selectedAppointment?.patientName}?`}
                  {actionType === "complete" && `Mark this appointment with ${selectedAppointment?.patientName} as completed?`}
                  {actionType === "cancel" && `Are you sure you want to cancel the appointment with ${selectedAppointment?.patientName}? This action cannot be undone.`}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={confirmAction}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                    setActionType("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  </>
);
}

export default TherapistAppointments;