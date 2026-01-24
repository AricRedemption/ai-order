import type { MemeToken } from '@/types/meme';
import { MOCK_TOKEN_COUNT } from '@/config/constants';

// Popular meme coin names and symbols for realistic mock data
const MEME_NAMES = [
  { name: 'Pepe', symbol: 'PEPE' },
  { name: 'Bonk', symbol: 'BONK' },
  { name: 'Dogwifhat', symbol: 'WIF' },
  { name: 'Popcat', symbol: 'POPCAT' },
  { name: 'Book of Meme', symbol: 'BOME' },
  { name: 'Cat in a Dogs World', symbol: 'MEW' },
  { name: 'Myro', symbol: 'MYRO' },
  { name: 'Slerf', symbol: 'SLERF' },
  { name: 'Wen', symbol: 'WEN' },
  { name: 'Jeo Boden', symbol: 'BODEN' },
  { name: 'Smog', symbol: 'SMOG' },
  { name: 'Coq Inu', symbol: 'COQ' },
  { name: 'Ponke', symbol: 'PONKE' },
  { name: 'Silly Dragon', symbol: 'SILLY' },
  { name: 'Daddy Tate', symbol: 'DADDY' },
];

// More meme themes for generating additional tokens
const MEME_THEMES = [
  'Moon', 'Rocket', 'Diamond', 'Hands', 'Ape', 'Shiba', 'Floki', 'Doge',
  'Cat', 'Frog', 'Bear', 'Bull', 'Chad', 'Wojak', 'Cope', 'Hopium',
  'Giga', 'Based', 'Cringe', 'Snek', 'Monke', 'Chonk', 'Honk', 'Stonk',
  'Pumpy', 'Dumpy', 'Lambo', 'Rekt', 'Wagmi', 'Ngmi', 'Gm', 'Gn',
  'Sirs', 'Frens', 'Jeet', 'Bagholder', 'Shill', 'Fud', 'Wen', 'Ser'
];

// Generate random token address
function generateAddress(chain: 'solana' | 'bnb'): string {
  if (chain === 'solana') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let addr = '';
    for (let i = 0; i < 44; i++) {
      addr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return addr;
  } else {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) {
      addr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return addr;
  }
}

// Generate a single mock token
function generateMockToken(index: number): MemeToken {
  const chain = index % 2 === 0 ? 'solana' : 'bnb';

  let name: string, symbol: string;

  if (index < MEME_NAMES.length) {
    // Use predefined meme coins
    name = MEME_NAMES[index].name;
    symbol = MEME_NAMES[index].symbol;
  } else {
    // Generate random meme coin
    const theme1 = MEME_THEMES[Math.floor(Math.random() * MEME_THEMES.length)];
    const theme2 = MEME_THEMES[Math.floor(Math.random() * MEME_THEMES.length)];
    name = `${theme1} ${theme2}`;
    symbol = (theme1.slice(0, 2) + theme2.slice(0, 2)).toUpperCase();
  }

  // Generate realistic price ranges
  const priceMultiplier = Math.random();
  let price: number;
  if (priceMultiplier < 0.6) {
    price = Math.random() * 0.001; // Micro cap
  } else if (priceMultiplier < 0.85) {
    price = Math.random() * 0.01; // Small cap
  } else {
    price = Math.random() * 0.1; // Medium cap
  }

  const marketCap = price * (Math.random() * 1000000000 + 50000);
  const volume24h = marketCap * (Math.random() * 0.5 + 0.1);
  const priceChange24h = (Math.random() - 0.5) * 200; // -100% to +100%

  return {
    id: `mock-${chain}-${index}`,
    symbol,
    name,
    chain,
    address: generateAddress(chain),
    price,
    marketCap,
    volume24h,
    priceChange24h,
    liquidity: volume24h * (Math.random() * 0.3 + 0.2),
    holders: Math.floor(Math.random() * 50000 + 100),
    score: Math.floor(Math.random() * 100),
    description: `${name} is a community-driven meme token on ${chain === 'solana' ? 'Solana' : 'BNB Chain'}`,
    imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${symbol}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    isVerified: Math.random() > 0.7,
  };
}

// Generate all mock tokens
let mockTokensCache: MemeToken[] | null = null;

export function getMockMemeTokens(): MemeToken[] {
  if (mockTokensCache) {
    return mockTokensCache;
  }

  mockTokensCache = Array.from({ length: MOCK_TOKEN_COUNT }, (_, i) => generateMockToken(i));

  // Sort by market cap (descending)
  mockTokensCache.sort((a, b) => b.marketCap - a.marketCap);

  return mockTokensCache;
}

// Get trending tokens (top by volume)
export function getTrendingMemeTokens(limit: number = 20, chain?: 'solana' | 'bnb'): MemeToken[] {
  let tokens = getMockMemeTokens();

  if (chain) {
    tokens = tokens.filter(t => t.chain === chain);
  }

  // Sort by 24h volume
  const sorted = [...tokens].sort((a, b) => b.volume24h - a.volume24h);

  return sorted.slice(0, limit);
}

// Simulate price updates
export function simulatePriceUpdate(token: MemeToken): MemeToken {
  const changePercent = (Math.random() - 0.5) * 5; // -2.5% to +2.5%
  const newPrice = token.price * (1 + changePercent / 100);

  return {
    ...token,
    price: newPrice,
    priceChange24h: token.priceChange24h + changePercent,
  };
}

// Get token by address
export function getMockTokenByAddress(address: string): MemeToken | undefined {
  return getMockMemeTokens().find(t => t.address === address);
}

// Search tokens
export function searchMockTokens(query: string): MemeToken[] {
  const tokens = getMockMemeTokens();
  const lowerQuery = query.toLowerCase();

  return tokens.filter(
    t =>
      t.symbol.toLowerCase().includes(lowerQuery) ||
      t.name.toLowerCase().includes(lowerQuery) ||
      t.address.toLowerCase().includes(lowerQuery)
  );
}
