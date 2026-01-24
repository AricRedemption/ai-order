import { NextRequest, NextResponse } from 'next/server';
import { sendAnthropicMessage } from '@/lib/ai/anthropic';
import { sendOpenAIMessage } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, useAnthropic = true } = body;

    // Get API key from headers (for client-provided keys)
    const apiKey = request.headers.get('x-api-key') || undefined;

    let response: string;

    if (useAnthropic) {
      // Use Anthropic Claude
      response = await sendAnthropicMessage(
        messages,
        'You are a helpful AI assistant for cryptocurrency trading. Help users analyze meme coins, create conditional orders, and make informed trading decisions. Be concise and actionable.',
        apiKey
      );
    } else {
      // Use OpenAI GPT
      const openaiMessages = [
        {
          role: 'system' as const,
          content: 'You are a helpful AI assistant for cryptocurrency trading. Help users analyze meme coins, create conditional orders, and make informed trading decisions. Be concise and actionable.',
        },
        ...messages,
      ];
      response = await sendOpenAIMessage(openaiMessages, apiKey);
    }

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
