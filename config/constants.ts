// App-wide constants

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/ai/chat',
  VOICE: '/api/ai/voice',
  ANALYZE: '/api/ai/analyze',
  BUY: '/api/trading/buy',
  ORDERS: '/api/trading/orders',
  TRENDING_MEMES: '/api/memes/trending',
  ANALYZE_MEME: '/api/memes/analyze',
} as const;

// Order monitoring interval (ms)
export const ORDER_CHECK_INTERVAL = 5000; // Check every 5 seconds

// Default slippage for trades
export const DEFAULT_SLIPPAGE = 1; // 1%

// Mock data settings
export const MOCK_TOKEN_COUNT = 60; // Number of mock tokens to generate
export const PRICE_UPDATE_INTERVAL = 3000; // Update mock prices every 3 seconds

// AI settings
export const DEFAULT_AI_PROVIDER: 'anthropic' | 'openai' = 'anthropic';
export const MAX_CHAT_HISTORY = 50; // Maximum messages to keep in chat

// TTS settings
export const TTS_VOICE = 'alloy'; // OpenAI TTS voice
export const TTS_MODEL = 'tts-1'; // OpenAI TTS model

// Whisper settings
export const WHISPER_MODEL = 'whisper-1';

// Local storage keys
export const STORAGE_KEYS = {
  API_KEYS: 'ai-meme-trader-api-keys',
  ORDERS: 'ai-meme-trader-orders',
  CHAT_HISTORY: 'ai-meme-trader-chat',
  SETTINGS: 'ai-meme-trader-settings',
} as const;

// Score thresholds for meme analysis
export const SCORE_THRESHOLDS = {
  STRONG_BUY: 80,
  BUY: 60,
  HOLD: 40,
  AVOID: 0,
} as const;
