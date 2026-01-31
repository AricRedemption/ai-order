import { NextRequest, NextResponse } from 'next/server';
import { getTrendingMemeTokens } from '@/lib/data/mockMemeData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const chain = searchParams.get('chain') as 'solana' | 'bnb' | null;
    const limitRaw = searchParams.get('limit');
    const limitParsed = limitRaw ? parseInt(limitRaw, 10) : NaN;
    const limit = Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 20;

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
