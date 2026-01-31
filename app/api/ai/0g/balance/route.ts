import { NextRequest, NextResponse } from 'next/server';
import { get0GBalance } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privateKey, modelName, providerAddress } = body;

    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Private key is required' },
        { status: 400 }
      );
    }

    const balance = await get0GBalance(privateKey, modelName, providerAddress);

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('[API] 0G Balance error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch 0G balance',
      },
      { status: 500 }
    );
  }
}
