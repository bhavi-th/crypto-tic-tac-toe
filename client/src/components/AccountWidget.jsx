import { useEffect, useRef, useState } from 'react';
import { useWeb3Context } from '../contexts/useWeb3Context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ChevronDown,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { getNetworkName, isSepolia } from '../utils/network';

const AccountWidget = () => {
  const { web3State, switchAccount, switchToSepolia, disconnect } = useWeb3Context();
  const { selectedAccount, chainId, balance } = web3State;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();

  const onCorrectNetwork = isSepolia(chainId);
  const networkName = getNetworkName(chainId);
  const truncated = selectedAccount
    ? `${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`
    : '';
  const balanceFmt = balance ? Number(balance).toFixed(4) : '0.0000';

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(selectedAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setOpen(false);
    navigate('/');
  };

  if (!selectedAccount) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="account-widget-trigger w-full text-left"
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`network-indicator ${
              onCorrectNetwork ? 'correct' : 'incorrect'
            }`}
          />
          <span className="font-label text-xs text-surface-a50">{networkName}</span>
          <ChevronDown className="w-4 h-4 text-surface-a40 ml-auto" />
        </div>
        <div className="font-heading text-sm font-semibold accent-text">
          {balanceFmt} ETH
        </div>
        <div className="font-label text-xs text-gray-500 mt-1">{truncated}</div>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="account-popover absolute bottom-full mb-2 left-0 right-0 z-50"
        >
          {/* Enhanced Network section */}
          <div className="popover-section">
            <p className="section-title">
              Network
            </p>
            <div className={`network-status ${
              onCorrectNetwork ? 'correct' : 'incorrect'
            }`}>
              {onCorrectNetwork ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{networkName}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Wrong network</span>
                </>
              )}
            </div>
            {!onCorrectNetwork && (
              <button
                onClick={switchToSepolia}
                className="switch-network-btn"
              >
                Switch to Sepolia
              </button>
            )}
          </div>

          {/* Enhanced Account section */}
          <div className="popover-section">
            <p className="section-title">
              Account
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="account-address">
                {selectedAccount}
              </span>
              <button
                onClick={copyAddress}
                className={`copy-btn ${copied ? 'copied' : ''}`}
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <span className="font-body text-sm text-gray-400">
              Balance: <span className="accent-text font-semibold">{balanceFmt} ETH</span>
            </span>
            <a
              href={`https://sepolia.etherscan.io/address/${selectedAccount}`}
              target="_blank"
              rel="noreferrer"
              className="etherscan-link"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Enhanced Actions */}
          <div className="popover-section">
            <button
              onClick={() => {
                setOpen(false);
                switchAccount();
              }}
              className="action-btn"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Switch Account
            </button>
            <button
              onClick={handleDisconnect}
              className="action-btn danger"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountWidget;
