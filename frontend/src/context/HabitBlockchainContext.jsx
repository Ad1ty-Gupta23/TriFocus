// src/context/HabitBlockchainContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";

// Replace with your deployed HabitStaking contract address
const CONTRACT_ADDRESS = "0x7F26aa7E482f0d7737Dd886e77FBa4a3B786b62E"


// HabitStaking Contract ABI
const HABIT_STAKING_ABI = [
  "function owner() view returns (address)",
  "function users(address) view returns (uint256 stakedTokens, uint256 habitStreak, uint256 earnedTokens)",
  "function therapists(address) view returns (address therapistAddress, string name, bool verified)",
  "function stakeTokens(uint256 amount)",
  "function completeTask(uint256 reward)",
  "function redeemTokens(uint256 amount)",
  "function registerTherapist(string name)",
  "function bookTherapist(address therapistAddr, uint256 sessionFee)",
  "function uploadEncryptedReport(address user, string ipfsCID)",
  "function getMyBookings() view returns (tuple(address user, uint256 timestamp, uint256 sessionFee, string encryptedReportCID)[])",
  "function getUserTokens(address user) view returns (uint256)",
  "event TokensStaked(address indexed user, uint256 amount)",
  "event TaskCompleted(address indexed user, uint256 reward)",
  "event TokensRedeemed(address indexed user, uint256 amount)",
  "event TherapistRegistered(address therapist, string name)",
  "event SessionBooked(address user, address therapist, uint256 sessionFee)",
  "event ReportUploaded(address therapist, address user, string ipfsCID)"
];

// Create the context
const HabitBlockchainContext = createContext();

// Provider component that will wrap your app
export const HabitBlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userStats, setUserStats] = useState({
    stakedTokens: 0,
    habitStreak: 0,
    earnedTokens: 0
  });
  const [therapistInfo, setTherapistInfo] = useState({
    address: '',
    name: '',
    verified: false
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Connect wallet and initialize provider/contract
  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask not found");
      return;
    }
    try {
      // Create a read-only provider using ethers v6
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setProvider(_provider);

      // Get the connected account
      const accounts = await _provider.send("eth_accounts", []);
      setAccount(accounts[0]);

      // Create a signer-based contract instance for transactions
      const signer = await _provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, HABIT_STAKING_ABI, signer);
      setContract(_contract);

      // Check if connected account is owner
      const owner = await _contract.owner();
      setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async (userAddress = null) => {
    if (!provider) return;
    const address = userAddress || account;
    if (!address) return;

    try {
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, HABIT_STAKING_ABI, provider);
      const userInfo = await readContract.users(address);
      
      setUserStats({
        stakedTokens: Number(userInfo.stakedTokens),
        habitStreak: Number(userInfo.habitStreak),
        earnedTokens: Number(userInfo.earnedTokens)
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Fetch therapist information
  const fetchTherapistInfo = async (therapistAddress = null) => {
    if (!provider) return;
    const address = therapistAddress || account;
    if (!address) return;

    try {
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, HABIT_STAKING_ABI, provider);
      const therapistData = await readContract.therapists(address);
      
      setTherapistInfo({
        address: therapistData.therapistAddress,
        name: therapistData.name,
        verified: therapistData.verified
      });
    } catch (error) {
      console.error("Error fetching therapist info:", error);
    }
  };

  // Fetch therapist bookings
  const fetchBookings = async () => {
    if (!contract || !therapistInfo.verified) return;

    try {
      const bookingsData = await contract.getMyBookings();
      const formattedBookings = bookingsData.map(booking => ({
        user: booking.user,
        timestamp: Number(booking.timestamp),
        sessionFee: Number(booking.sessionFee),
        encryptedReportCID: booking.encryptedReportCID
      }));
      setBookings(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Stake tokens
  const stakeTokens = async (amount) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.stakeTokens(amount);
      await tx.wait();
      setLoading(false);
      await fetchUserStats();
    } catch (error) {
      console.error("Error staking tokens:", error);
      setLoading(false);
      throw error;
    }
  };

  // Complete task and earn reward
  const completeTask = async (reward) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.completeTask(reward);
      await tx.wait();
      setLoading(false);
      await fetchUserStats();
    } catch (error) {
      console.error("Error completing task:", error);
      setLoading(false);
      throw error;
    }
  };

  // Redeem earned tokens
  const redeemTokens = async (amount) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.redeemTokens(amount);
      await tx.wait();
      setLoading(false);
      await fetchUserStats();
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      setLoading(false);
      throw error;
    }
  };

  // Register as therapist
  const registerTherapist = async (name) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.registerTherapist(name);
      await tx.wait();
      setLoading(false);
      await fetchTherapistInfo();
    } catch (error) {
      console.error("Error registering therapist:", error);
      setLoading(false);
      throw error;
    }
  };

  // Book therapist session
  const bookTherapist = async (therapistAddress, sessionFee) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.bookTherapist(therapistAddress, sessionFee);
      await tx.wait();
      setLoading(false);
      await fetchUserStats();
    } catch (error) {
      console.error("Error booking therapist:", error);
      setLoading(false);
      throw error;
    }
  };

  // Upload encrypted report (therapist only)
  const uploadEncryptedReport = async (userAddress, ipfsCID) => {
    if (!contract || !therapistInfo.verified) return;
    try {
      setLoading(true);
      const tx = await contract.uploadEncryptedReport(userAddress, ipfsCID);
      await tx.wait();
      setLoading(false);
      await fetchBookings();
    } catch (error) {
      console.error("Error uploading report:", error);
      setLoading(false);
      throw error;
    }
  };

  // Get user tokens (public view function)
  const getUserTokens = async (userAddress) => {
    if (!provider) return 0;
    try {
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, HABIT_STAKING_ABI, provider);
      const tokens = await readContract.getUserTokens(userAddress);
      return Number(tokens);
    } catch (error) {
      console.error("Error getting user tokens:", error);
      return 0;
    }
  };

  // Listen to contract events
  const listenToEvents = () => {
    if (!contract) return;

    contract.on("TokensStaked", (user, amount) => {
      if (user.toLowerCase() === account?.toLowerCase()) {
        fetchUserStats();
      }
    });

    contract.on("TaskCompleted", (user, reward) => {
      if (user.toLowerCase() === account?.toLowerCase()) {
        fetchUserStats();
      }
    });

    contract.on("TokensRedeemed", (user, amount) => {
      if (user.toLowerCase() === account?.toLowerCase()) {
        fetchUserStats();
      }
    });

    contract.on("TherapistRegistered", (therapist, name) => {
      if (therapist.toLowerCase() === account?.toLowerCase()) {
        fetchTherapistInfo();
      }
    });

    contract.on("SessionBooked", (user, therapist, sessionFee) => {
      if (therapist.toLowerCase() === account?.toLowerCase()) {
        fetchBookings();
      }
      if (user.toLowerCase() === account?.toLowerCase()) {
        fetchUserStats();
      }
    });

    contract.on("ReportUploaded", (therapist, user, ipfsCID) => {
      if (therapist.toLowerCase() === account?.toLowerCase()) {
        fetchBookings();
      }
    });
  };

  // Clean up event listeners
  const removeEventListeners = () => {
    if (contract) {
      contract.removeAllListeners();
    }
  };

  // Fetch data automatically when account/contract changes
  useEffect(() => {
    if (provider && account) {
      fetchUserStats();
      fetchTherapistInfo();
    }
  }, [provider, account]);

  useEffect(() => {
    if (contract && therapistInfo.verified) {
      fetchBookings();
    }
  }, [contract, therapistInfo.verified]);

  useEffect(() => {
    listenToEvents();
    return () => removeEventListeners();
  }, [contract, account]);

  return (
    <HabitBlockchainContext.Provider
      value={{
        // Connection state
        account,
        provider,
        contract,
        loading,
        isOwner,
        
        // Data state
        userStats,
        therapistInfo,
        bookings,
        
        // Connection functions
        connectWallet,
        
        // User functions
        stakeTokens,
        completeTask,
        redeemTokens,
        fetchUserStats,
        
        // Therapist functions
        registerTherapist,
        bookTherapist,
        uploadEncryptedReport,
        fetchTherapistInfo,
        fetchBookings,
        
        // Utility functions
        getUserTokens,
        
        // Event management
        listenToEvents,
        removeEventListeners
      }}
    >
      {children}
    </HabitBlockchainContext.Provider>
  );
};

// Custom hook for using the habit blockchain context
export const useHabitBlockchain = () => {
  const context = useContext(HabitBlockchainContext);
  if (!context) {
    throw new Error('useHabitBlockchain must be used within a HabitBlockchainProvider');
  }
  return context;
};