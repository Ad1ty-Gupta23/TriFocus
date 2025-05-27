// src/hooks/useContract.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractConfig';

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const userAddress = await web3Signer.getAddress();
        
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          web3Signer
        );

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAddress(userAddress);
        setContract(contractInstance);
        setIsConnected(true);
        
        return { provider: web3Provider, signer: web3Signer, address: userAddress };
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setContract(null);
    setProvider(null);
    setSigner(null);
    setAddress('');
    setIsConnected(false);
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          connectWallet();
        }
      }
    };
    checkConnection();
  }, []);

  return {
    contract,
    provider,
    signer,
    address,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};