import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Clock, Users, Trophy, ExternalLink, Settings } from 'lucide-react';
import { ethers } from 'ethers';
import { useGame } from '../hooks/useGame';
import { useWeb3Context } from '../contexts/useWeb3Context';
import RewardPoolAdmin from '../components/RewardPoolAdmin';

const GameLobby = () => {
  const navigate = useNavigate();
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const { 
    availableGames, 
    games, 
    loading, 
    createGame, 
    joinGame, 
    fetchAvailableGames, 
    fetchPlayerGames,
    getGasCostInfo
  } = useGame(navigate);
  
  const [wagerAmount, setWagerAmount] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [gasCostInfo, setGasCostInfo] = useState({ moveCost: '0', totalGameCost: '0' });

  useEffect(() => {
    fetchAvailableGames();
    fetchPlayerGames();
  }, [fetchAvailableGames, fetchPlayerGames]);

  useEffect(() => {
    // Fetch gas cost info
    const fetchGasInfo = async () => {
      const info = await getGasCostInfo();
      setGasCostInfo(info);
    };
    
    fetchGasInfo();
  }, [getGasCostInfo]);

  const handleCreateGame = async () => {
    if (!wagerAmount || parseFloat(wagerAmount) <= 0) {
      toast.error('Please enter a valid wager amount');
      return;
    }

    const gameId = await createGame(parseFloat(wagerAmount));
    if (gameId) {
      setWagerAmount('');
      setShowCreateForm(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    const success = await joinGame(gameId);
    if (success) {
      navigate(`/game/${gameId}`);
    }
  };

  
  
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMyGame = (player1, player2) => {
    return selectedAccount && (player1.toLowerCase() === selectedAccount.toLowerCase() || 
           player2.toLowerCase() === selectedAccount.toLowerCase());
  };

  const isGameExpired = (lastMoveTime) => {
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
    return (Date.now() - (lastMoveTime * 1000)) > FIVE_MINUTES;
  };

  return (
    <div className="flex-1 px-6 md:px-10 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-6">
          {/* Header and Create Game Side by Side */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Header Section - Takes more space */}
            <div className="flex-1 lobby-header">
              <h1 className="font-heading font-bold text-4xl lg:text-5xl accent-text mb-4">
                Tic-Tac-Toe Arena
              </h1>
              <p className="font-body text-gray-400 text-xl max-w-2xl">
                ⚡ Stake Sepolia ETH and battle opponents in on-chain Tic-Tac-Toe. Winner takes all! ⚡
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="game-stats">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span>Win Big</span>
                </div>
                <div className="game-stats">
                  <Users className="w-4 h-4 text-accent" />
                  <span>Real Players</span>
                </div>
                <div className="game-stats">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Fast Games</span>
                </div>
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="game-stats hover:border-accent transition-all"
                >
                  <Settings className="w-4 h-4 text-accent" />
                  <span>Reward Pool</span>
                </button>
              </div>
            </div>
            
            {/* Create Game Section - Fixed width */}
            <div className="create-game-card max-w-md lg:max-w-sm xl:max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl accent-text">
                Create New Game
              </h2>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="connect-wallet-btn w-full flex items-center justify-center gap-3 text-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Game
              </button>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-primary-a0 mb-3 font-label">
                    💰 Wager Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    placeholder="0.01"
                    className="enhanced-input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">Minimum: 0.001 ETH</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateGame}
                    disabled={loading || !wagerAmount}
                    className="flex-1 connect-wallet-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <div className="loading-spinner mx-auto" /> : 'Create Game'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setWagerAmount('');
                    }}
                    className="skeleton-button px-6"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Your Games - Full Width */}
          <div className="game-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl accent-text">
                Your Games
              </h2>
            </div>

            {games.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-surface-a40" />
                <p className="text-surface-a40 text-lg mb-2">No games yet</p>
                <p className="text-surface-a50 text-sm">
                  Create one or join an existing game to start playing!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="game-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="status-indicator active"></span>
                        <span className="font-label text-lg font-bold accent-text">
                          Game #{game.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {Math.floor((Date.now() / 1000 - game.lastMoveTime) / 60)}m ago
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Host:</span>
                        <span className="text-sm font-mono accent-text bg-surface-a10 px-3 py-1 rounded-lg">
                          {formatAddress(game.player1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Wager:</span>
                        <div className="wager-badge">
                          <span>💎</span>
                          {game.wager} ETH
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/game/${game.id}`)}
                      className={`w-full py-3 font-bold rounded-lg transition-all ${
                        game.status === 'Active' 
                          ? 'bg-gradient-to-r from-success to-green-400 text-white hover:shadow-lg' 
                          : 'bg-gradient-to-r from-warning to-orange-400 text-white hover:shadow-lg'
                      }`}
                    >
                      {game.status === 'Active' ? '🎮 Continue Game' : 'View Details'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Panel - Only show when toggled */}
          {showAdminPanel && (
            <RewardPoolAdmin />
          )}

          {/* Available Games - Full Width */}
          <div className="game-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl accent-text">
                Available Games
              </h2>
            </div>

            {availableGames.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-20 h-20 mx-auto mb-6 text-surface-a40" />
                <p className="text-surface-a40 text-xl mb-3">No available games</p>
                <p className="text-surface-a50 text-base max-w-md mx-auto">
                  🚀 Be the first to create a game and wait for an opponent to join!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableGames.filter(game => !isGameExpired(game.lastMoveTime)).map((game) => (
                  <div
                    key={game.id}
                    className="game-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="status-indicator waiting"></span>
                        <span className="font-label text-lg font-bold accent-text">
                          Game #{game.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {Math.floor((Date.now() / 1000 - game.lastMoveTime) / 60)}m ago
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Host:</span>
                        <span className="text-sm font-mono accent-text bg-surface-a10 px-3 py-1 rounded-lg">
                          {formatAddress(game.player1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Wager:</span>
                        <div className="wager-badge">
                          <span>💎</span>
                          {game.wager} ETH
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading || isMyGame(game.player1, game.player2)}
                      className={`w-full py-3 font-bold rounded-lg transition-all ${
                        isMyGame(game.player1, game.player2)
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {isMyGame(game.player1, game.player2) ? '👑 Your Game' : '⚔️ Join Game'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
