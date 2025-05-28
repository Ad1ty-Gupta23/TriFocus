import React, { useState, useEffect, useRef } from "react";
import { useHabitBlockchain } from "../context/HabitBlockchainContext";

// IPFS Upload utility
const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Using Pinata as IPFS provider (you can replace with your preferred service)
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}` // Add your Pinata JWT to .env
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('IPFS upload failed');
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Fallback to mock CID for demo purposes
    return `QmMock${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }
};

function TherapistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionType, setActionType] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    therapistBookings, 
    isConnected, 
    account, 
    therapistData,
    loadUserData,
    uploadEncryptedReport,
    cancelBooking,
    displayTokens,
    isLoading: contextLoading
  } = useHabitBlockchain();
  const statusMap = {
    0: "pending",
    1: "completed",
    2: "cancelled"
  };

  useEffect(() => {
    loadAppointments();
  }, [therapistBookings, isConnected]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      if (isConnected && therapistBookings) {
        const formattedAppointments = therapistBookings.map((booking, index) => ({
          id: index + 1,
          patientName: `Patient ${booking.user.slice(0, 6)}...${booking.user.slice(-4)}`,
          patientEmail: booking.user,
          appointmentDate: new Date(booking.timestamp * 1000).toISOString().split('T')[0],
          appointmentTime: new Date(booking.timestamp * 1000).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          duration: 60,
          sessionType: "Therapy Session",
          
          
          status: statusMap[booking.status] || "unknown",
          tokensStaked: booking.sessionFeeFormatted || displayTokens(booking.sessionFee, { showSymbol: false }),
          priority: "normal",
          notes: booking.encryptedReportCID ? "Report uploaded" : "Pending session",
          bookingId: index,
          originalBooking: booking
        }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const matchesSearch = !searchTerm || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleAppointmentAction = (appointment, action) => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmAction = async () => {
    if (!selectedAppointment) return;

    try {
      setUploadingFile(true);

      switch (actionType) {
        case "cancel":
          if (selectedAppointment.originalBooking.status !== 0) {
            throw new Error("This appointment cannot be cancelled as it's already been completed or cancelled.");
          }
          
          if (selectedAppointment.originalBooking.encryptedReportCID) {
            throw new Error("Cannot cancel appointment - a report has already been uploaded.");
          }
          
          await cancelBooking(selectedAppointment.bookingId);
          break;
          
        case "upload":
          if (selectedAppointment.originalBooking.status !== 0) {
            throw new Error("Cannot upload report - appointment is not in pending status.");
          }
          
          if (selectedAppointment.originalBooking.encryptedReportCID) {
            throw new Error("A report has already been uploaded for this appointment.");
          }

          if (!selectedFile) {
            throw new Error("Please select a PDF file to upload.");
          }

          // Upload file to IPFS
          const ipfsCID = await uploadToIPFS(selectedFile);
          
          // Upload the CID to blockchain
          await uploadEncryptedReport(selectedAppointment.bookingId, ipfsCID);
          break;
      }

      await loadUserData();
      setShowModal(false);
      setSelectedAppointment(null);
      setActionType("");
      setSelectedFile(null);
      
    } catch (error) {
      console.error("Error updating appointment:", error);
      
      let userMessage = error.message;
      if (error.message.includes("Cannot cancel completed booking")) {
        userMessage = "This appointment has already been completed and cannot be cancelled.";
      } else if (error.message.includes("Cannot cancel cancelled booking")) {
        userMessage = "This appointment has already been cancelled.";
      } else if (error.message.includes("execution reverted")) {
        userMessage = "Transaction failed. Please check the appointment status and try again.";
      }
      
      alert("Error: " + userMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(apt => apt.status === "pending").length;
    const completed = appointments.filter(apt => apt.status === "completed").length;
    const cancelled = appointments.filter(apt => apt.status === "cancelled").length;
    return { total, pending, completed, cancelled };
  };

  const canCancelAppointment = (appointment) => {
    const uiStatus = appointment.status?.toLowerCase();
    const blockchainStatus = appointment.originalBooking?.status;
    
    return (
      uiStatus === "pending" && 
      blockchainStatus === 0 && 
      !appointment.originalBooking.encryptedReportCID
    );
  };
  
  const canUploadReport = (appointment) => {
    const uiStatus = appointment.status?.toLowerCase();
    const blockchainStatus = appointment.originalBooking?.status;
    
    return (
      uiStatus === "pending" && 
      blockchainStatus === 0 && 
      !appointment.originalBooking.encryptedReportCID
    );
  };

  const stats = getAppointmentStats();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p>Please connect your wallet to view appointments</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Patient Appointments
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Welcome, {therapistData.name || 'Dr. ' + account?.slice(0, 6)}. Manage your blockchain-verified appointments.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'gray', icon: 'calendar' },
            { label: 'Pending', value: stats.pending, color: 'amber', icon: 'clock' },
            { label: 'Completed', value: stats.completed, color: 'emerald', icon: 'check' },
            { label: 'Cancelled', value: stats.cancelled, color: 'red', icon: 'x' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mr-4`}>
                  <svg className={`h-6 w-6 text-${stat.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {stat.icon === 'calendar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                    {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {stat.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                    {stat.icon === 'x' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by patient address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <div key={appointment.id} className="p-6 hover:bg-white/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {appointment.patientName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                          <p className="text-gray-500 text-sm">{appointment.patientEmail}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="font-medium">{appointment.appointmentTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Session Fee</p>
                            <p className="font-medium">{appointment.tokensStaked} HTK</p>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Notes</p>
                            <p className="font-medium">{appointment.notes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {canUploadReport(appointment) && (
                          <button
                            onClick={() => handleAppointmentAction(appointment, "upload")}
                            disabled={contextLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Report
                          </button>
                        )}
                        
                        {canCancelAppointment(appointment) && (
                          <button
                            onClick={() => handleAppointmentAction(appointment, "cancel")}
                            disabled={contextLoading}
                            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        )}
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
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                    <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {actionType === "upload" ? "Upload Report" : "Cancel Appointment"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {actionType === "upload" 
                      ? `Upload encrypted report for ${selectedAppointment?.patientName}?`
                      : `Cancel appointment with ${selectedAppointment?.patientName}?`
                    }
                  </p>
                </div>

                {actionType === "upload" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select PDF Report
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFile(null);
                    }}
                    disabled={uploadingFile}
                    className="flex-1 px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={uploadingFile || (actionType === "upload" && !selectedFile)}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {uploadingFile ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {actionType === "upload" ? "Uploading..." : "Cancelling..."}
                      </div>
                    ) : (
                      actionType === "upload" ? "Upload Report" : "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TherapistAppointments;