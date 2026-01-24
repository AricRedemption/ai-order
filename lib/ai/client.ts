import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AIConfig, AIProvider } from '@/types/ai';

const anthropicClients = new Map<string, Anthropic>();
const openaiClients = new Map<string, OpenAI>();

function getAnthropicClient(config: AIConfig): Anthropic {
  const cacheKey = config.apiKey;
  
  if (!anthropicClients.has(cacheKey)) {
    const clientOptions: any = { apiKey: config.apiKey };
    
    if (config.baseURL) {
      clientOptions.baseURL = config.baseURL;
    }
    
    anthropicClients.set(cacheKey, new Anthropic(clientOptions));
  }
  
  return anthropicClients.get(cacheKey)!;
}

function getOpenAIClient(config: AIConfig): OpenAI {
  const cacheKey = `${config.apiKey}:${config.baseURL || 'default'}`;
  
  if (!openaiClients.has(cacheKey)) {
    const clientOptions: any = { apiKey: config.apiKey };
    
    if (config.baseURL) {
      clientOptions.baseURL = config.baseURL;
    }
    
    openaiClients.set(cacheKey, new OpenAI(clientOptions));
  }
  
  return openaiClients.get(cacheKey)!;
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4-turbo-preview',
};

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendAIMessage(
  messages: AIMessage[],
  config: AIConfig,
  systemPrompt?: string
): Promise<string> {
  if (config.provider === 'anthropic') {
    return await sendAnthropicMessage(messages, systemPrompt, config);
  } else {
    return await sendOpenAIMessage(messages, systemPrompt, config);
  }
}

async function sendAnthropicMessage(
  messages: AIMessage[],
  systemPrompt?: string,
  config?: AIConfig
): Promise<string> {
  if (!config) {
    throw new Error('Anthropic config is required');
  }
  
  const client = getAnthropicClient(config);
  const model = config.model || DEFAULT_MODELS.anthropic;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt || 'You are a helpful AI assistant for cryptocurrency trading.',
    messages: messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Anthropic');
}

async function sendOpenAIMessage(
  messages: AIMessage[],
  systemPrompt?: string,
  config?: AIConfig
): Promise<string> {
  if (!config) {
    throw new Error('OpenAI config is required');
  }
  
  const client = getOpenAIClient(config);
  const model = config.model || DEFAULT_MODELS.openai;

  const allMessages = systemPrompt 
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model,
    messages: allMessages,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}

export async function* streamAIMessage(
  messages: AIMessage[],
  config: AIConfig,
  systemPrompt?: string
): AsyncGenerator<string> {
  if (config.provider === 'anthropic') {
    yield* streamAnthropicMessage(messages, systemPrompt, config);
  } else {
    yield* streamOpenAIMessage(messages, systemPrompt, config);
  }
}

async function* streamAnthropicMessage(
  messages: AIMessage[],
  systemPrompt?: string,
  config?: AIConfig
): AsyncGenerator<string> {
  if (!config) {
    throw new Error('Anthropic config is required');
  }
  
  const client = getAnthropicClient(config);
  const model = config.model || DEFAULT_MODELS.anthropic;

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt || 'You are a helpful AI assistant for cryptocurrency trading.',
    messages: messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}

async function* streamOpenAIMessage(
  messages: AIMessage[],
  systemPrompt?: string,
  config?: AIConfig
): AsyncGenerator<string> {
  if (!config) {
    throw new Error('OpenAI config is required');
  }
  
  const client = getOpenAIClient(config);
  const model = config.model || DEFAULT_MODELS.openai;

  const allMessages = systemPrompt 
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
    : messages;

  const stream = await client.chat.completions.create({
    model,
    messages: allMessages,
    max_tokens: 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

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
];
