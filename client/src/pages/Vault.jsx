import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import {
  Trophy,
  Loader2,
  ExternalLink,
  Clock,
  Users,
  Gamepad2,
  Inbox,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useWeb3Context } from '../contexts/useWeb3Context';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 5;

const Vault = () => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const { games, loading, fetchPlayerGames } = useGame();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageGames = games.slice(startIdx, startIdx + PAGE_SIZE);

  useEffect(() => {
    if (selectedAccount) {
      fetchPlayerGames();
    }
  }, [selectedAccount, fetchPlayerGames]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Player1Won':
      case 'Player2Won':
        return <Trophy className="w-4 h-4 text-warning-a0" />;
      case 'Draw':
        return <AlertCircle className="w-4 h-4 text-surface-a40" />;
      case 'Active':
        return <Gamepad2 className="w-4 h-4 text-success-a10" />;
      default:
        return <Clock className="w-4 h-4 text-surface-a40" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Player1Won':
      case 'Player2Won':
        return 'text-warning-a0 bg-warning-a0/10';
      case 'Draw':
        return 'text-surface-a40 bg-surface-a40/10';
      case 'Active':
        return 'text-success-a10 bg-success-a10/10';
      default:
        return 'text-surface-a40 bg-surface-a40/10';
    }
  };

  const isWinner = (game) => {
    if (!selectedAccount) return false;
    if (game.status === 'Player1Won' && game.player1.toLowerCase() === selectedAccount.toLowerCase()) return true;
    if (game.status === 'Player2Won' && game.player2.toLowerCase() === selectedAccount.toLowerCase()) return true;
    return false;
  };

  const isMyGame = (game) => {
    if (!selectedAccount) return false;
    return game.player1.toLowerCase() === selectedAccount.toLowerCase() || 
           game.player2.toLowerCase() === selectedAccount.toLowerCase();
  };

  const totalWagered = games.reduce((sum, game) => sum + parseFloat(game.wager), 0);
  const totalWon = games.filter(game => isWinner(game)).reduce((sum, game) => sum + parseFloat(game.wager), 0);
  const winRate = games.filter(game => game.status.includes('Won') && isMyGame(game)).length > 0 
    ? (games.filter(game => isWinner(game)).length / games.filter(game => game.status.includes('Won') && isMyGame(game)).length * 100)
    : 0;

  return (
    <div className="flex-1 px-6 md:px-10 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="lobby-header">
          <h1 className="font-heading font-bold text-5xl accent-text mb-4">
            🏆 My Games Vault
          </h1>
          <p className="font-body text-gray-400 text-xl max-w-2xl">
            {games.length === 0
              ? '🎮 You haven\'t played any games yet. Start your journey now!'
              : `⚡ ${games.length} epic game${games.length === 1 ? '' : 's'} played on-chain`}
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="game-stats">
              <Trophy className="w-4 h-4 text-accent" />
              <span>Game History</span>
            </div>
            <div className="game-stats">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Track Performance</span>
            </div>
            <div className="game-stats">
              <Clock className="w-4 h-4 text-accent" />
              <span>Timeline View</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="game-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-label">Total Wagered</p>
                  <p className="text-2xl font-bold accent-text">{totalWagered.toFixed(4)} ETH</p>
                  <p className="text-xs text-gray-500 mt-1">💎 Total stakes</p>
                </div>
              </div>
            </div>
            <div className="game-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-400 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-label">Total Won</p>
                  <p className="text-2xl font-bold text-warning">{totalWon.toFixed(4)} ETH</p>
                  <p className="text-xs text-gray-500 mt-1">🏆 Prize money</p>
                </div>
              </div>
            </div>
            <div className="game-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-label">Win Rate</p>
                  <p className="text-2xl font-bold text-success">{winRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">⚡ Victory ratio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Loading skeleton */}
        {loading && pageGames.length === 0 && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="game-card animate-pulse"
              >
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-surface-tonal-a20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-surface-tonal-a20 rounded w-1/3" />
                    <div className="h-4 bg-surface-tonal-a20 rounded w-2/3" />
                    <div className="h-4 bg-surface-tonal-a20 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-surface-tonal-a20 rounded w-20" />
                      <div className="h-8 bg-surface-tonal-a20 rounded w-24" />
                      <div className="h-8 bg-surface-tonal-a20 rounded w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Empty state */}
        {!loading && games.length === 0 && (
          <div className="game-card text-center py-16">
            <Inbox className="w-24 h-24 mx-auto mb-6 text-surface-a40" />
            <h3 className="font-heading font-bold text-2xl text-primary-a40 mb-4">
              🎮 No games yet
            </h3>
            <p className="font-body text-lg text-surface-a50 mb-8 max-w-md mx-auto">
              ⚡ Start playing Tic-Tac-Toe to build your epic game history and track your performance!
            </p>
            <Link
              to="/lobby"
              className="connect-wallet-btn inline-flex items-center gap-3 text-lg"
            >
              <Gamepad2 className="w-5 h-5" />
              Go to Lobby
            </Link>
          </div>
        )}

        {/* Enhanced Game cards */}
        {!loading && pageGames.length > 0 && (
          <div className="space-y-6">
            {pageGames.map((game) => (
              <div
                key={game.id}
                className="game-card"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Enhanced Game Icon */}
                  <div className="lg:w-20 w-full flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getStatusColor(game.status)}`}>
                      {getStatusIcon(game.status)}
                    </div>
                  </div>

                  {/* Enhanced Game Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="status-indicator active"></span>
                          <h3 className="font-heading font-bold text-xl accent-text">
                            Game #{game.id}
                          </h3>
                        </div>
                        <span className={`status-badge ${
                          game.status === 'Active' ? 'status-active' :
                          game.status.includes('Won') ? 'status-completed' :
                          'status-waiting'
                        }`}>
                          {game.status}
                        </span>
                        {isWinner(game) && (
                          <span className="px-3 py-1 rounded-full text-sm font-label bg-success-a10/20 text-success-a10 font-bold">
                            🏆 You Won!
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-accent" />
                          <span className="text-sm text-gray-400 font-label">Players:</span>
                          <span className="text-sm font-mono accent-text bg-surface-a10 px-3 py-1 rounded-lg">
                            {formatAddress(game.player1)} vs {game.player2 && game.player2 !== ethers.ZeroAddress ? formatAddress(game.player2) : 'Waiting...'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Trophy className="w-4 h-4 text-warning" />
                          <span className="text-sm text-gray-400 font-label">Wager:</span>
                          <div className="wager-badge">
                            <span>💎</span>
                            {game.wager} ETH
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="text-sm text-gray-400 font-label">Last move:</span>
                          <span className="text-sm accent-text font-semibold">{getTimeAgo(game.lastMoveTime)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-4 h-4 text-accent" />
                          <span className="text-sm text-gray-400 font-label">Created:</span>
                          <span className="text-sm accent-text font-semibold">{formatTime(game.lastMoveTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-6">
                      {game.status === 'Active' && (
                        <Link
                          to={`/game/${game.id}`}
                          className="px-6 py-3 bg-gradient-to-r from-success to-green-400 text-white rounded-lg font-label font-bold hover:shadow-lg transition-all"
                        >
                          🎮 Continue Playing
                        </Link>
                      )}
                      <Link
                        to={`/game/${game.id}`}
                        className="px-6 py-3 bg-gradient-to-r from-warning to-orange-400 text-white rounded-lg font-label font-bold hover:shadow-lg transition-all"
                      >
                        👁️ View Details
                      </Link>
                      <a
                        href={`https://sepolia.etherscan.io/address/${game.player1}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-3 skeleton-button hover:border-accent transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Loading overlay during page change */}
        {loading && pageGames.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Vault;
