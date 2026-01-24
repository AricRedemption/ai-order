import { NextRequest, NextResponse } from 'next/server';
import { getTrendingMemeTokens } from '@/lib/data/mockMemeData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') as 'solana' | 'bnb' | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    const tokens = getTrendingMemeTokens(limit, chain || undefined);

    return NextResponse.json({
      success: true,
      tokens,
      lastUpdated: new Date(),
      totalCount: tokens.length,
    });
  } catch (error) {
    console.error('[API] Trending memes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending memes' },
      { status: 500 }
    );
  }
}
