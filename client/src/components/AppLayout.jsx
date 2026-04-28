import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useWeb3Context } from '../contexts/useWeb3Context';
import Sidebar from './Sidebar';
import NetworkGuard from './NetworkGuard';

const AppLayout = () => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const navigate = useNavigate();

  // Bounce back to wallet connect if no account.
  useEffect(() => {
    // Give Web3Provider a moment to restore from MetaMask before redirecting.
    const t = setTimeout(() => {
      if (!selectedAccount) navigate('/');
    }, 600);
    return () => clearTimeout(t);
  }, [selectedAccount, navigate]);

  return (
    <div className="min-h-screen bg-surface-a0 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <NetworkGuard>
          <Outlet />
        </NetworkGuard>
      </main>
    </div>
  );
};

export default AppLayout;
