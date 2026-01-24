import { ChainType } from '@/types/trading';

// Chain configurations
export interface ChainConfig {
  id: string;
  name: string;
  type: ChainType;
  rpcUrl: string;
  explorer: string;
  nativeToken: {
    symbol: string;
    decimals: number;
  };
  swapRouter?: string; // DEX router address for swaps
}

// Solana configuration
export const SOLANA_CONFIG: ChainConfig = {
  id: 'solana-mainnet',
  name: 'Solana',
  type: 'solana',
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  explorer: 'https://solscan.io',
  nativeToken: {
    symbol: 'SOL',
    decimals: 9,
  },
};

// BNB Chain configuration
export const BNB_CONFIG: ChainConfig = {
  id: 'bsc-mainnet',
  name: 'BNB Smart Chain',
  type: 'bnb',
  rpcUrl: process.env.NEXT_PUBLIC_BNB_RPC || 'https://bsc-dataseed.binance.org',
  explorer: 'https://bscscan.com',
  nativeToken: {
    symbol: 'BNB',
    decimals: 18,
  },
  swapRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 Router
};

// All supported chains
export const SUPPORTED_CHAINS: ChainConfig[] = [SOLANA_CONFIG, BNB_CONFIG];

// Get chain config by type
export function getChainConfig(chainType: ChainType): ChainConfig {
  const config = SUPPORTED_CHAINS.find((c) => c.type === chainType);
  if (!config) {
    throw new Error(`Unsupported chain: ${chainType}`);
  }
  return config;
}
