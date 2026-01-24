import { ChainType } from './trading';

// Order condition types
export type ConditionType = 'price' | 'marketCap' | 'volume' | 'time';
export type ConditionOperator = '>' | '<' | '>=' | '<=' | '=';
export type OrderStatus = 'pending' | 'triggered' | 'executed' | 'cancelled' | 'failed';

// Single condition in an order
export interface OrderCondition {
  type: ConditionType;
  operator: ConditionOperator;
  value: number | Date;
  label?: string; // Human-readable description
}

// Conditional order structure
export interface ConditionalOrder {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: ChainType;
  amount: number; // Amount in native token to spend
  conditions: OrderCondition[];
  status: OrderStatus;
  createdAt: Date;
  triggeredAt?: Date;
  executedAt?: Date;
  txHash?: string;
  error?: string;
  createdBy: 'user' | 'ai'; // Track if created manually or via AI
  aiPrompt?: string; // Original AI prompt if created by AI
}

// Order creation request
export interface CreateOrderRequest {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  chain: ChainType;
  amount: number;
  conditions: OrderCondition[];
  createdBy?: 'user' | 'ai';
  aiPrompt?: string;
}

// Order execution result
export interface OrderExecutionResult {
  orderId: string;
  success: boolean;
  txHash?: string;
  error?: string;
  executedAt: Date;
}
