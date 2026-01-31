import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { ethers } from 'ethers';
import type { AIConfig, AIProvider } from '@/types/ai';
import { DEFAULT_MODELS, PRESET_PROVIDERS } from './constants';

const anthropicClients = new Map<string, Anthropic>();
const openaiClients = new Map<string, OpenAI>();
let zgBroker: any = null;

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

// Moved DEFAULT_MODELS to constants.ts

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
  } else if (config.provider === '0g-compute') {
    return await send0GComputeMessage(messages, systemPrompt, config);
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

async function getZGBroker(privateKey: string) {
  if (!zgBroker) {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZG_RPC || 'https://evmrpc-testnet.0g.ai');
    const signer = new ethers.Wallet(privateKey, provider);
    zgBroker = await createZGComputeNetworkBroker(signer);
  }
  return zgBroker;
}

async function send0GComputeMessage(
  messages: AIMessage[],
  systemPrompt?: string,
  config?: AIConfig
): Promise<string> {
  if (!config || !config.apiKey) {
    throw new Error('0G Compute private key (apiKey) is required');
  }

  const broker = await getZGBroker(config.apiKey);
  const serviceName = config.model || DEFAULT_MODELS['0g-compute'];
  
  // List services to find the provider
  const services = await broker.inference.listService();
  const service = services.find((s: any) => s.model === serviceName);
  
  if (!service) {
    throw new Error(`Service ${serviceName} not found on 0G Compute Network`);
  }

  const providerAddress = service.provider;
  const serviceUrl = service.url;

  // Initializing headers for OpenAI compatible API
  const content = JSON.stringify({
    model: serviceName,
    messages: systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages
  });

  const headers = await broker.inference.getRequestHeaders(
    providerAddress,
    content
  );

  const response = await fetch(`${serviceUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: content
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`0G Compute request failed: ${response.status} ${errorBody}`);
  }

  const result = await response.json();
  
  // Optional: Verify response
  if (result.id) {
    await broker.inference.processResponse(providerAddress, result.id, result.choices[0]?.message?.content);
  }

  return result.choices[0]?.message?.content || '';
}

export async function get0GBalance(privateKey: string, modelName?: string) {
  const broker = await getZGBroker(privateKey);
  const ledger = await broker.ledger.getLedger();
  
  let subAccountBalance = '0';
  if (modelName) {
    const services = await broker.inference.listService();
    const service = services.find((s: any) => s.model === modelName);
    if (service) {
      const subAccount = await broker.inference.getAccount(service.provider);
      subAccountBalance = ethers.formatEther(subAccount.balance);
    }
  }

  return {
    total: ethers.formatEther(ledger.totalBalance),
    available: ethers.formatEther(ledger.availableBalance),
    subAccount: subAccountBalance,
  };
}

export async function* streamAIMessage(
  messages: AIMessage[],
  config: AIConfig,
  systemPrompt?: string
): AsyncGenerator<string> {
  if (config.provider === 'anthropic') {
    yield* streamAnthropicMessage(messages, systemPrompt, config);
  } else if (config.provider === '0g-compute') {
    // 0G Compute SDK might not support streaming via broker headers easily in this version
    // Falling back to non-streaming for now or implementing if SDK allows
    const result = await send0GComputeMessage(messages, systemPrompt, config);
    yield result;
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

// Moved PRESET_PROVIDERS to constants.ts
