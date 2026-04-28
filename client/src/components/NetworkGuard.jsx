import { AlertTriangle } from 'lucide-react';
import { useWeb3Context } from '../contexts/useWeb3Context';
import { isSepolia, getNetworkName } from '../utils/network';

const NetworkGuard = ({ children }) => {
  const { web3State, switchToSepolia } = useWeb3Context();
  const { chainId, selectedAccount } = web3State;

  // No wallet yet — let parent handle it.
  if (!selectedAccount) return children;

  if (isSepolia(chainId)) return children;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center bg-surface-tonal-a10 border border-danger-a0/30 rounded-2xl p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-a0/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-danger-a10" />
        </div>
        <h2 className="font-heading font-bold text-xl text-danger-a10 mb-2">
          Wrong Network
        </h2>
        <p className="font-body text-sm text-surface-a50 mb-6">
          You are connected to <span className="font-semibold text-primary-a40">{getNetworkName(chainId)}</span>.
          CryptedVault requires the Sepolia testnet to operate.
        </p>
        <button
          onClick={switchToSepolia}
          className="px-6 py-3 bg-primary-a0 hover:bg-primary-a10 text-white rounded-xl font-label font-semibold transition-colors"
        >
          Switch to Sepolia
        </button>
      </div>
    </div>
  );
};

export default NetworkGuard;
