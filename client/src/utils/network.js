// Sepolia testnet — chain ID is the source of truth for "are we on the right network?"
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Sepolia',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

const NETWORK_NAMES = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia',
  137: 'Polygon',
  80001: 'Polygon Mumbai',
  10: 'Optimism',
  42161: 'Arbitrum',
  8453: 'Base',
};

export const getNetworkName = (chainId) => {
  if (chainId == null) return 'Unknown';
  return NETWORK_NAMES[Number(chainId)] || `Chain ${chainId}`;
};

export const isSepolia = (chainId) => Number(chainId) === SEPOLIA_CHAIN_ID;

// Try to switch to Sepolia. If MetaMask doesn't have it configured, add it first.
export const switchToSepolia = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (error) {
    // 4902 = chain not added to MetaMask
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [SEPOLIA_PARAMS],
      });
    } else {
      throw error;
    }
  }
};
