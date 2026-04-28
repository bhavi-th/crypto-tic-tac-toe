import { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Web3Context } from './createWeb3Context';
import { authenticate, buildWeb3State } from '../utils/connectWallet';
import { switchToSepolia as switchChain } from '../utils/network';

const initialState = {
  contractInstance: null,
  selectedAccount: null,
  chainId: null,
  balance: null,
};

const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState(initialState);
  const stateRef = useRef(web3State);
  stateRef.current = web3State;

  const updateWeb3State = useCallback((partial) => {
    setWeb3State((prev) => ({ ...prev, ...partial }));
  }, []);

  // Refresh on-chain balance for the currently selected account.
  const refreshBalance = useCallback(async () => {
    const account = stateRef.current.selectedAccount;
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(account);
      setWeb3State((prev) => ({ ...prev, balance: ethers.formatEther(balanceWei) }));
    } catch (error) {
      console.error('Balance refresh failed:', error);
    }
  }, []);

  // Re-authenticate against the backend with the new account and rebuild contract.
  const handleAccountSwitch = useCallback(async (account) => {
    try {
      toast.info('Account changed — re-signing authentication');
      const state = await buildWeb3State(account);
      await authenticate(state.signer, account);
      setWeb3State({
        contractInstance: state.contractInstance,
        selectedAccount: state.selectedAccount,
        chainId: state.chainId,
        balance: state.balance,
      });
      toast.success('Switched to new account');
    } catch (error) {
      console.error('Account switch failed:', error);
      toast.error('Failed to switch account');
    }
  }, []);

  // Trigger MetaMask account picker even if already authorized.
  const switchAccount = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      // accountsChanged listener will pick up the new account.
    } catch (error) {
      if (error.code !== 4001) {
        // 4001 = user rejected; not worth a toast
        console.error('Switch account failed:', error);
        toast.error('Could not switch account');
      }
    }
  }, []);

  // Programmatically switch to Sepolia (or add it if missing).
  const switchToSepolia = useCallback(async () => {
    try {
      await switchChain();
    } catch (error) {
      console.error('Switch to Sepolia failed:', error);
      toast.error('Could not switch network');
    }
  }, []);

  // Clear all local state and JWT. MetaMask itself stays authorized.
  const disconnect = useCallback(() => {
    localStorage.removeItem('token');
    setWeb3State(initialState);
  }, []);

  // Restore connection on page load if MetaMask is already authorized.
  useEffect(() => {
    const restore = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) return;
        const state = await buildWeb3State(accounts[0]);
        setWeb3State({
          contractInstance: state.contractInstance,
          selectedAccount: state.selectedAccount,
          chainId: state.chainId,
          balance: state.balance,
        });
      } catch (error) {
        console.error('Restore failed:', error);
      }
    };
    restore();
  }, []);

  // Listen for MetaMask events.
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask.
        disconnect();
      } else if (accounts[0].toLowerCase() !== stateRef.current.selectedAccount?.toLowerCase()) {
        handleAccountSwitch(accounts[0]);
      }
    };

    const onChainChanged = async (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      // Rebuild the contract instance against the new network.
      const account = stateRef.current.selectedAccount;
      if (account) {
        try {
          const state = await buildWeb3State(account);
          setWeb3State((prev) => ({
            ...prev,
            contractInstance: state.contractInstance,
            chainId: state.chainId,
            balance: state.balance,
          }));
        } catch {
          setWeb3State((prev) => ({ ...prev, chainId: newChainId }));
        }
      } else {
        setWeb3State((prev) => ({ ...prev, chainId: newChainId }));
      }
    };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', onChainChanged);
    };
  }, [disconnect, handleAccountSwitch]);

  const value = {
    web3State,
    updateWeb3State,
    refreshBalance,
    switchAccount,
    switchToSepolia,
    disconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Provider;
