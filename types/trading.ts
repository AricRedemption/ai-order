// Trading related types
export type ChainType = 'solana' | 'bnb';

export interface BuyParams {
  tokenAddress: string;
  amount: number; // Amount in native token (SOL/BNB)
  slippage?: number; // Percentage (e.g., 1 for 1%)
  walletAddress: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  amountReceived?: number;
}

export interface Balance {
  native: number; // SOL or BNB balance
  token?: number; // Specific token balance if queried
}

export interface GasEstimate {
  estimatedGas: number;
  gasPrice: number;
  totalCost: number; // in native token
}

// Abstract trading strategy interface
export interface TradingStrategy {
  buyToken(params: BuyParams): Promise<TransactionResult>;
  getBalance(address: string): Promise<Balance>;
  estimateGas(params: BuyParams): Promise<GasEstimate>;
  getChainType(): ChainType;
}
