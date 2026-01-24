import { NextRequest, NextResponse } from 'next/server';
import { sendAIMessage } from '@/lib/ai/client';
import type { AIConfig } from '@/types/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, config } = body;

    // Get config from headers (for client-provided config)
    const headerConfig = request.headers.get('x-api-config');
    const finalConfig: AIConfig = config || (headerConfig ? JSON.parse(headerConfig) : null);

    if (!finalConfig || !finalConfig.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI configuration is required. Please configure your API settings.',
        },
        { status: 400 }
      );
    }

    const systemPrompt = 'You are a helpful AI assistant for cryptocurrency trading. Help users analyze meme coins, create conditional orders, and make informed trading decisions. Be concise and actionable.';

    const response = await sendAIMessage(messages, finalConfig, systemPrompt);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('[API] Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chat request failed',
      },
      { status: 500 }
    );
  }
}
