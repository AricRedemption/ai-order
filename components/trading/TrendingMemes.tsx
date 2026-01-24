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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
