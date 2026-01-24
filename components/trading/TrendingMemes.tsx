'use client';

import React, { useState, useEffect } from 'react';
import { MemeTokenCard } from '@/components/trading/MemeTokenCard';
import type { MemeToken } from '@/types/meme';
import { Loader2 } from 'lucide-react';

interface TrendingMemesProps {
  onBuy?: (token: MemeToken) => void;
  onCreateOrder?: (token: MemeToken) => void;
}

export function TrendingMemes({ onBuy, onCreateOrder }: TrendingMemesProps) {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  async function fetchTrending() {
    try {
      const response = await fetch('/api/memes/trending?limit=20');
      const data = await response.json();

      if (data.success) {
        setTokens(data.tokens);
      }
    } catch (error) {
      console.error('Failed to fetch trending memes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <MemeTokenCard
          key={token.id}
          token={token}
          onBuy={onBuy}
          onCreateOrder={onCreateOrder}
        />
      ))}
    </div>
  );
}
