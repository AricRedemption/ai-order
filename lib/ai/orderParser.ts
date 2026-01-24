import type { ConditionalOrder, OrderCondition, CreateOrderRequest } from '@/types/orders';

const SYSTEM_PROMPT = `You are an AI assistant that helps users create conditional orders for buying meme coins.

When a user expresses intent to buy a token with certain conditions, extract:
1. Token symbol/name
2. Amount to spend (in SOL or BNB)
3. Conditions (price, market cap, volume, time)

Respond in JSON format:
{
  "intent": "create_order",
  "tokenSymbol": "PEPE",
  "chain": "solana" or "bnb",
  "amount": 1.5,
  "conditions": [
    { "type": "price", "operator": "<", "value": 0.001, "label": "price below $0.001" }
  ]
}

Examples:
- "Buy $BONK when price drops below $0.0001" → price condition
- "Buy 2 SOL of $WIF when market cap hits $100M" → marketCap condition
- "Buy $PEPE in 1 hour" → time condition (add current time + 1 hour)
- "Buy when volume exceeds $500K" → volume condition

If unclear, ask for clarification instead of guessing.`;

/**
 * Parse user's natural language into a conditional order
 */
export async function parseOrderIntent(
  userMessage: string,
  aiResponse: string
): Promise<CreateOrderRequest | null> {
  try {
    // Try to extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.intent !== 'create_order') {
      return null;
    }

    // Validate and construct order request
    const orderRequest: CreateOrderRequest = {
      tokenAddress: '', // Will be resolved later by looking up token
      tokenSymbol: parsed.tokenSymbol,
      tokenName: parsed.tokenName || parsed.tokenSymbol,
      chain: parsed.chain || 'solana',
      amount: parsed.amount,
      conditions: parsed.conditions || [],
      createdBy: 'ai',
      aiPrompt: userMessage,
    };

    return orderRequest;
  } catch (error) {
    console.error('[OrderParser] Parse error:', error);
    return null;
  }
}

/**
 * Get the system prompt for order parsing
 */
export function getOrderParserSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/**
 * Validate if a message contains order intent
 */
export function hasOrderIntent(message: string): boolean {
  const keywords = [
    'buy',
    'purchase',
    'when',
    'if',
    'price',
    'market cap',
    'volume',
    'condition',
  ];

  const lowerMessage = message.toLowerCase();
  return keywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Format conditions into human-readable text
 */
export function formatConditions(conditions: OrderCondition[]): string {
  return conditions
    .map(c => {
      let valueStr: string;

      if (c.type === 'time') {
        valueStr = new Date(c.value).toLocaleString();
      } else if (c.type === 'price') {
        valueStr = `$${c.value}`;
      } else if (c.type === 'marketCap' || c.type === 'volume') {
        valueStr = `$${(c.value as number).toLocaleString()}`;
      } else {
        valueStr = String(c.value);
      }

      return `${c.type} ${c.operator} ${valueStr}`;
    })
    .join(' AND ');
}
