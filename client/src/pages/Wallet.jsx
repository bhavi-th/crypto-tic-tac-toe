import { useWeb3Context } from '../contexts/useWeb3Context';
import { connectWallet } from '../utils/connectWallet';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

const Wallet = () => {
  const navigateTo = useNavigate();
  const { updateWeb3State, web3State } = useWeb3Context();
  const { selectedAccount } = web3State;

  useEffect(() => {
    if (selectedAccount) {
      navigateTo('/lobby');
    }
  }, [selectedAccount, navigateTo]);

  const handleWalletConnection = async () => {
    const result = await connectWallet();
    if (result) {
      updateWeb3State(result);
    }
  };

  return (
    <div className="min-h-screen bg-surface-a0 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b181f_1px,transparent_1px),linear-gradient(to_bottom,#1b181f_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-40" />
      
      {/* Multiple radial glows for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_20%_30%,rgba(0,168,204,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_70%,rgba(0,212,255,0.1),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_50%,rgba(119,85,170,0.08),transparent)]" />

      <div className="relative z-10 flex flex-col items-center gap-16 px-4 max-w-2xl w-full">
        {/* Enhanced logo */}
        <div className="wallet-logo">
          <Gamepad2 className="w-16 h-16 text-white" />
        </div>

        {/* Enhanced title section */}
        <div className="text-center space-y-6">
          <h1 className="font-heading font-bold text-6xl md:text-8xl gradient-text">
            TicTacToe Arena
          </h1>
          <div className="space-y-4">
            <p className="text-surface-a30 font-body text-xl max-w-lg mx-auto leading-relaxed">
              ⚡ Wager-based Tic-Tac-Toe gaming on the blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="game-stats">
                <span className="text-accent">🎮</span>
                <span>Play & Earn</span>
              </div>
              <div className="game-stats">
                <span className="text-accent">⚡</span>
                <span>Fast Paced</span>
              </div>
              <div className="game-stats">
                <span className="text-accent">🔒</span>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced connect button */}
        <div className="space-y-6 w-full max-w-md">
          <button
            className="connect-wallet-btn w-full text-xl"
            onClick={handleWalletConnection}
          >
            🔗 Connect Wallet
          </button>
          
          {/* Additional info */}
          <div className="text-center space-y-3">
            <p className="text-surface-a30 font-label text-sm">
              🔒 Requires MetaMask on Sepolia testnet
            </p>
            <div className="flex justify-center gap-6 text-xs text-surface-a40">
              <span>💧 Low Gas Fees</span>
              <span>⚡ Instant Games</span>
              <span>🏆 Win ETH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
