import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useWeb3Context } from '../contexts/useWeb3Context';

const RewardPoolAdmin = () => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const { fundRewardPool, getRewardPoolBalance } = useGame();
  
  const [poolBalance, setPoolBalance] = useState('0');
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Replace with actual owner address from contract
  const OWNER_ADDRESS = '0x1234567890123456789012345678901234567890'; // Update this

  useEffect(() => {
    fetchPoolBalance();
    const interval = setInterval(fetchPoolBalance, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPoolBalance = async () => {
    try {
      const balance = await getRewardPoolBalance();
      setPoolBalance(balance);
    } catch (error) {
      console.error('Error fetching pool balance:', error);
    }
  };

  const handleFundPool = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const success = await fundRewardPool(parseFloat(fundAmount));
      if (success) {
        setFundAmount('');
        await fetchPoolBalance();
      }
    } finally {
      setLoading(false);
    }
  };

  const isOwner = selectedAccount?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  if (!isOwner) {
    return (
      <div className="game-card text-center py-8">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-warning" />
        <h3 className="font-heading font-bold text-xl text-warning mb-2">
          Admin Access Required
        </h3>
        <p className="text-surface-a50">
          Only the contract owner can manage the reward pool.
        </p>
      </div>
    );
  }

  return (
    <div className="game-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-400 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl accent-text">
          Reward Pool Admin
        </h2>
      </div>

      {/* Pool Balance Display */}
      <div className="minimal-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Pool Balance</p>
            <p className="text-2xl font-bold text-success">
              {parseFloat(poolBalance).toFixed(4)} ETH
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-success" />
        </div>
      </div>

      {/* Fund Pool Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-primary-a0 mb-3 font-label">
            💰 Fund Reward Pool (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="0.1"
            className="enhanced-input w-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter amount to add to the reward pool
          </p>
        </div>

        <button
          onClick={handleFundPool}
          disabled={loading || !fundAmount}
          className="connect-wallet-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="loading-spinner mx-auto" />
          ) : (
            `Fund Pool with ${fundAmount || '0'} ETH`
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-surface-a10 rounded-lg">
        <h3 className="font-semibold text-sm mb-2 text-primary-a40">
          📊 Reward Pool Info
        </h3>
        <div className="space-y-1 text-xs text-surface-a50">
          <p>• Base reward: 0.01 ETH per win</p>
          <p>• Bonus reward: 10% of wager</p>
          <p>• Minimum wager for rewards: 0.005 ETH</p>
          <p>• Rewards only for wins (no draws)</p>
        </div>
      </div>
    </div>
  );
};

export default RewardPoolAdmin;
