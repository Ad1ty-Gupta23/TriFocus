import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import HabitStakingABI from '../abi/HabitStaking.json';

// Contract configuration
const CONTRACT_CONFIG = {
  address: "0x4bEae51760C01A2C2a55BF1FBA9265E2f661c71a",
  chainId: 17000, // Holesky testnet
  network: "holesky",
  constants: {
    maxStakeAmount: "1000000000000000000000000", // 1M tokens
    minSessionFee: "10000000000000000000", // 10 tokens
    maxHabitReward: "100000000000000000000" // 100 tokens
  }
};

// Booking status enum
const BOOKING_STATUS = {
  0: 'Pending',
  1: 'Completed',
  2: 'Cancelled'
};

const HabitBlockchainContext = createContext();

export const useHabitBlockchain = () => {
  const context = useContext(HabitBlockchainContext);
  if (!context) {
    throw new Error('useHabitBlockchain must be used within a HabitBlockchainProvider');
  }
  return context;
};

export const HabitBlockchainProvider = ({ children }) => {
  // State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // User data
  const [userData, setUserData] = useState({
    stakedTokens: '0',
    earnedTokens: '0',
    habitStreak: 0,
    isActive: false
  });
  
  // Therapist data
  const [therapistData, setTherapistData] = useState({
    name: '',
    sessionCount: 0,
    isActive: false,
    totalEarnings: '0'
  });
  
  // Bookings
  const [userBookings, setUserBookings] = useState([]);
  const [therapistBookings, setTherapistBookings] = useState([]);
  
  // Contract stats
  const [contractStats, setContractStats] = useState({
    totalStaked: '0',
    totalRewards: '0',
    totalBookings: 0
  });

  // Initialize provider and contract
  const initializeContract = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const network = await web3Provider.getNetwork();
        if (Number(network.chainId) !== CONTRACT_CONFIG.chainId) {
          throw new Error(`Please switch to Holesky testnet (Chain ID: ${CONTRACT_CONFIG.chainId})`);
        }
        
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        
        // Handle different ABI formats
        let abiArray;
        if (Array.isArray(HabitStakingABI)) {
          abiArray = HabitStakingABI;
        } else if (HabitStakingABI.abi && Array.isArray(HabitStakingABI.abi)) {
          abiArray = HabitStakingABI.abi;
        } else if (typeof HabitStakingABI === 'object' && HabitStakingABI.default) {
          abiArray = Array.isArray(HabitStakingABI.default) ? HabitStakingABI.default : HabitStakingABI.default.abi;
        } else {
          throw new Error('Invalid ABI format. Expected an array or object with abi property.');
        }

        const habitContract = new ethers.Contract(
          CONTRACT_CONFIG.address,
          abiArray,
          web3Signer
        );
        setContract(habitContract);
        
        const address = await web3Signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        
        // Load initial data
        await loadUserData(habitContract, address);
        await loadContractStats(habitContract);
        
        setError(null);
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Contract initialization error:', err);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeContract();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data
  const loadUserData = async (contractInstance = contract, userAddress = account) => {
    if (!contractInstance || !userAddress) return;
    
    try {
      const [staked, earned, streak, active] = await contractInstance.getUserData(userAddress);
      setUserData({
        stakedTokens: staked.toString(),
        earnedTokens: earned.toString(),
        habitStreak: Number(streak),
        isActive: active
      });
      
      // Check if user is a therapist
      const [name, sessions, therapistActive] = await contractInstance.getTherapistData(userAddress);
      const rawTherapist = await contractInstance.therapists(userAddress);
      
      setTherapistData({
        name,
        sessionCount: Number(sessions),
        isActive: therapistActive,
        totalEarnings: rawTherapist.totalEarnings.toString()
      });
      
      // Load bookings
      const userBookingsData = await contractInstance.getUserBookings(userAddress);
      setUserBookings(userBookingsData.map(formatBooking));
      
      if (therapistActive) {
        const therapistBookingsData = await contractInstance.getTherapistBookings(userAddress);
        setTherapistBookings(therapistBookingsData.map(formatBooking));
      }
      
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Load contract stats
  const loadContractStats = async (contractInstance = contract) => {
    if (!contractInstance) return;
    
    try {
      const [totalStaked, totalRewards, totalBookings] = await contractInstance.getContractStats();
      setContractStats({
        totalStaked: totalStaked.toString(),
        totalRewards: totalRewards.toString(),
        totalBookings: Number(totalBookings)
      });
    } catch (err) {
      console.error('Error loading contract stats:', err);
    }
  };

  // Format booking data
  const formatBooking = (booking) => ({
    user: booking.user,
    therapist: booking.therapist,
    timestamp: Number(booking.timestamp),
    sessionFee: booking.sessionFee.toString(),
    encryptedReportCID: booking.encryptedReportCID,
    status: BOOKING_STATUS[booking.status]
  });

  // Contract interaction functions
  const stakeTokens = async (amount) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.stakeTokens(ethers.parseEther(amount.toString()));
      await tx.wait();
      await loadUserData();
      await loadContractStats();
      return tx.hash;
    } catch (err) {
      throw new Error(`Staking failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unstakeTokens = async (amount) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.unstakeTokens(ethers.parseEther(amount.toString()));
      await tx.wait();
      await loadUserData();
      await loadContractStats();
      return tx.hash;
    } catch (err) {
      throw new Error(`Unstaking failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (reward) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.completeTask(ethers.parseEther(reward.toString()));
      await tx.wait();
      await loadUserData();
      await loadContractStats();
      return tx.hash;
    } catch (err) {
      throw new Error(`Task completion failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemTokens = async (amount) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.redeemTokens(ethers.parseEther(amount.toString()));
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Token redemption failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const registerTherapist = async (name) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.registerTherapist(name);
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Therapist registration failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const bookTherapist = async (therapistAddress, sessionFee) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.bookTherapist(
        therapistAddress, 
        ethers.parseEther(sessionFee.toString())
      );
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Booking failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.cancelBooking(bookingId);
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Booking cancellation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadEncryptedReport = async (bookingId, ipfsCID) => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.uploadEncryptedReport(bookingId, ipfsCID);
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Report upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateTherapist = async () => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.deactivateTherapist();
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Deactivation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateTherapist = async () => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    try {
      const tx = await contract.reactivateTherapist();
      await tx.wait();
      await loadUserData();
      return tx.hash;
    } catch (err) {
      throw new Error(`Reactivation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const formatTokenAmount = (amount, decimals = 18) => {
    return ethers.formatUnits(amount, decimals);
  };

  const parseTokenAmount = (amount, decimals = 18) => {
    return ethers.parseUnits(amount.toString(), decimals);
  };

  // Handle account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
        setSigner(null);
        setContract(null);
      } else {
        initializeContract();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [initializeContract]);

  // Auto-connect on mount
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await initializeContract();
          }
        } catch (err) {
          console.error('Auto-connect failed:', err);
        }
      }
    };

    autoConnect();
  }, [initializeContract]);

  const contextValue = {
    // Connection state
    provider,
    signer,
    contract,
    account,
    isConnected,
    isLoading,
    error,
    
    // Data
    userData,
    therapistData,
    userBookings,
    therapistBookings,
    contractStats,
    
    // Contract constants
    constants: CONTRACT_CONFIG.constants,
    
    // Functions
    connectWallet,
    loadUserData,
    loadContractStats,
    
    // User functions
    stakeTokens,
    unstakeTokens,
    completeTask,
    redeemTokens,
    
    // Therapist functions
    registerTherapist,
    deactivateTherapist,
    reactivateTherapist,
    bookTherapist,
    cancelBooking,
    uploadEncryptedReport,
    
    // Utilities
    formatTokenAmount,
    parseTokenAmount,
    BOOKING_STATUS
  };

  return (
    <HabitBlockchainContext.Provider value={contextValue}>
      {children}
    </HabitBlockchainContext.Provider>
  );
};

export default HabitBlockchainProvider;