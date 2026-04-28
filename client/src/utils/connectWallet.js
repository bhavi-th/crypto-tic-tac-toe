import { ethers } from 'ethers';
import contractAbi from '../constants/ticTacToeAbi.json';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Authenticate against backend with a freshly signed message and store JWT.
export const authenticate = async (signer, account) => {
  const signature = await signer.signMessage('Welcome to TicTacToe Arena');
  const url = `${API_URL}/api/authentication?address=${account}`;
  const res = await axios.post(url, { signature });
  localStorage.setItem('token', res.data.token);
  return res.data.token;
};

// Build provider/signer/contract for a given account and read live network + balance.
export const buildWeb3State = async (account) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const balanceWei = await provider.getBalance(account);
  const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

  return {
    contractInstance,
    selectedAccount: account,
    chainId: Number(network.chainId),
    balance: ethers.formatEther(balanceWei),
    signer,
  };
};

// Full connect flow — prompts user, signs message, gets JWT, builds state.
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const state = await buildWeb3State(account);
    await authenticate(state.signer, account);

    return state;
  } catch (error) {
    toast.error(error.message || 'Wallet connection failed');
    console.error(error);
    return null;
  }
};
