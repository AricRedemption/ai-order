import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(apiKey?: string): OpenAI {
  if (!openaiClient || apiKey) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function sendOpenAIMessage(
  messages: OpenAIMessage[],
  apiKey?: string
): Promise<string> {
  const client = getOpenAIClient(apiKey);

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || '';
}

export async function* streamOpenAIMessage(
  messages: OpenAIMessage[],
  apiKey?: string
): AsyncGenerator<string> {
  const client = getOpenAIClient(apiKey);

  const stream = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
