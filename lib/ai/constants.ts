import type { AIProvider } from '@/types/ai';

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4-turbo-preview',
  '0g-compute': 'deepseek-chat',
};

export const PRESET_PROVIDERS = [
  {
    id: 'anthropic-official',
    name: 'Anthropic Claude (官方)',
    provider: 'anthropic' as AIProvider,
    baseURL: '',
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  {
    id: 'zhipu-anthropic',
    name: '智谱 AI (Anthropic 协议)',
    provider: 'anthropic' as AIProvider,
    baseURL: 'https://open.bigmodel.cn/api/anthropic',
    defaultModel: 'glm-4',
  },
  {
    id: 'minimax-anthropic',
    name: 'MiniMax (Anthropic 协议)',
    provider: 'anthropic' as AIProvider,
    baseURL: 'https://api.minimaxi.com/anthropic',
    defaultModel: 'abab6.5s-chat',
  },
  {
    id: 'deepseek-anthropic',
    name: 'DeepSeek (Anthropic 协议)',
    provider: 'anthropic' as AIProvider,
    baseURL: 'https://api.deepseek.com/anthropic',
    defaultModel: 'deepseek-chat',
  },
  {
    id: 'moonshot-anthropic',
    name: 'Moonshot (Kimi, Anthropic 协议)',
    provider: 'anthropic' as AIProvider,
    baseURL: 'https://api.moonshot.cn/anthropic',
    defaultModel: 'moonshot-v1-8k',
  },
  {
    id: 'openai-official',
    name: 'OpenAI GPT (官方)',
    provider: 'openai' as AIProvider,
    baseURL: '',
    defaultModel: 'gpt-4-turbo-preview',
  },
  {
    id: 'zhipu-openai',
    name: '智谱 AI (OpenAI 兼容)',
    provider: 'openai' as AIProvider,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
  },
  {
    id: 'minimax-openai',
    name: 'MiniMax (OpenAI 兼容)',
    provider: 'openai' as AIProvider,
    baseURL: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5s-chat',
  },
  {
    id: 'deepseek-openai',
    name: 'DeepSeek (OpenAI 兼容)',
    provider: 'openai' as AIProvider,
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
  },
  {
    id: 'moonshot-openai',
    name: 'Moonshot (Kimi, OpenAI 兼容)',
    provider: 'openai' as AIProvider,
    baseURL: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
  },
  {
    id: 'custom',
    name: '自定义',
    provider: 'openai' as AIProvider,
    baseURL: '',
    defaultModel: '',
  },
  {
    id: '0g-compute',
    name: '0G Compute Network',
    provider: '0g-compute' as AIProvider,
    baseURL: 'https://evm-storage-testnet.0g.ai',
    defaultModel: 'deepseek-chat',
  },
];
