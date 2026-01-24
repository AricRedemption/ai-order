'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SolanaStrategy } from './strategies/SolanaStrategy';
import { BNBStrategy } from './strategies/BNBStrategy';
import type { TradingStrategy, BuyParams, TransactionResult, ChainType } from '@/types/trading';

interface TradingContextType {
  currentChain: ChainType;
  setCurrentChain: (chain: ChainType) => void;
  strategy: TradingStrategy;
  buyToken: (params: BuyParams) => Promise<TransactionResult>;
}

const TradingContext = createContext<TradingContextType | null>(null);

// Strategy instances (singleton pattern)
const strategies = {
  solana: new SolanaStrategy(),
  bnb: new BNBStrategy(),
};

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [currentChain, setCurrentChain] = useState<ChainType>('solana');

  // Get current strategy based on selected chain
  const strategy = strategies[currentChain];

  // Unified buy method that uses the current strategy
  const buyToken = useCallback(
    async (params: BuyParams): Promise<TransactionResult> => {
      console.log(`[TradingContext] Buying on ${currentChain}:`, params);
      return strategy.buyToken(params);
    },
    [currentChain, strategy]
  );

  const value = {
    currentChain,
    setCurrentChain,
    strategy,
    buyToken,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

// Custom hook to use trading context
export function useTradingStrategy() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingStrategy must be used within TradingProvider');
  }
  return context;
}

// Helper hook to get a specific chain strategy
export function useChainStrategy(chain: ChainType): TradingStrategy {
  return strategies[chain];
}
