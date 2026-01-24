import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(apiKey?: string): Anthropic {
  if (!anthropicClient || apiKey) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Anthropic API key not configured');
    }
    anthropicClient = new Anthropic({ apiKey: key });
  }
  return anthropicClient;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendAnthropicMessage(
  messages: AnthropicMessage[],
  systemPrompt?: string,
  apiKey?: string
): Promise<string> {
  const client = getAnthropicClient(apiKey);

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt || 'You are a helpful AI assistant for cryptocurrency trading.',
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Anthropic');
}

export async function* streamAnthropicMessage(
  messages: AnthropicMessage[],
  systemPrompt?: string,
  apiKey?: string
): AsyncGenerator<string> {
  const client = getAnthropicClient(apiKey);

  const stream = await client.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt || 'You are a helpful AI assistant for cryptocurrency trading.',
    messages: messages.map(m => ({
      role: m.role,
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
