import { ChainType } from './trading';

// Meme token data structure
export interface MemeToken {
  id: string;
  symbol: string;
  name: string;
  chain: ChainType;
  address: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
  holders: number;
  score: number; // AI-generated value score (0-100)
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  isVerified?: boolean;
}

// Trending meme response
export interface TrendingMemesResponse {
  tokens: MemeToken[];
  lastUpdated: Date;
  totalCount: number;
}

// Meme analysis result
export interface MemeAnalysis {
  tokenAddress: string;
  score: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  reasons: string[];
  risks: string[];
  aiInsight: string;
}
