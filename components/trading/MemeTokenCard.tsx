'use client';

import React from 'react';
import type { MemeToken } from '@/types/meme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatCurrency, formatPercentage, truncateAddress } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface MemeTokenCardProps {
  token: MemeToken;
  onBuy?: (token: MemeToken) => void;
  onCreateOrder?: (token: MemeToken) => void;
}

export function MemeTokenCard({ token, onBuy, onCreateOrder }: MemeTokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
  const PriceIcon = token.priceChange24h >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {token.imageUrl && (
              <img
                src={token.imageUrl}
                alt={token.symbol}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <CardTitle className="text-xl">{token.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <Badge variant={token.chain === 'solana' ? 'default' : 'secondary'}>
            {token.chain === 'solana' ? 'SOL' : 'BNB'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price & Change */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{formatPrice(token.price)}</div>
            <div className={`flex items-center gap-1 text-sm ${priceChangeColor}`}>
              <PriceIcon className="w-4 h-4" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">AI Score</div>
            <div className={`text-xl font-bold ${token.score >= 70 ? 'text-green-500' : token.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {token.score}/100
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Market Cap</div>
            <div className="font-semibold">{formatCurrency(token.marketCap)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Volume</div>
            <div className="font-semibold">{formatCurrency(token.volume24h)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Liquidity</div>
            <div className="font-semibold">{formatCurrency(token.liquidity)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Holders</div>
            <div className="font-semibold">{token.holders.toLocaleString()}</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{truncateAddress(token.address, 6)}</span>
          <ExternalLink className="w-3 h-3" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onBuy?.(token)}
            className="flex-1"
            size="sm"
          >
            Quick Buy
          </Button>
          <Button
            onClick={() => onCreateOrder?.(token)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Create Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
