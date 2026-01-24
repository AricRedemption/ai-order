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
    <Card className="hover:shadow-xl transition-all duration-300 border-muted/60 overflow-hidden group">
      <CardHeader className="pb-3 bg-muted/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {token.imageUrl ? (
              <img
                src={token.imageUrl}
                alt={token.symbol}
                className="w-12 h-12 rounded-full ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold ring-2 ring-background shadow-sm">
                {token.symbol[0]}
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">{token.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{token.name}</p>
            </div>
          </div>
          <Badge 
            variant={token.chain === 'solana' ? 'default' : 'secondary'}
            className={`${token.chain === 'solana' ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white border-0 shadow-sm`}
          >
            {token.chain === 'solana' ? 'SOL' : 'BNB'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {/* Price & Change */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black tracking-tight">{formatPrice(token.price)}</div>
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${priceChangeColor} bg-muted/30 px-2 py-0.5 rounded-md w-fit mt-1`}>
              <PriceIcon className="w-4 h-4" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">AI Score</div>
            <div className={`text-xl font-black ${token.score >= 70 ? 'text-green-500' : token.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {token.score}<span className="text-sm text-muted-foreground font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/10 p-3 rounded-xl border border-border/50">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Market Cap</div>
            <div className="font-semibold tracking-tight">{formatCurrency(token.marketCap)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">24h Volume</div>
            <div className="font-semibold tracking-tight">{formatCurrency(token.volume24h)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Liquidity</div>
            <div className="font-semibold tracking-tight">{formatCurrency(token.liquidity)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Holders</div>
            <div className="font-semibold tracking-tight">{token.holders.toLocaleString()}</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full w-fit hover:bg-muted/30 transition-colors cursor-pointer" title="Click to copy">
          <span className="font-mono">{truncateAddress(token.address, 6)}</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            onClick={() => onBuy?.(token)}
            className="w-full font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            size="default"
          >
            Quick Buy
          </Button>
          <Button
            onClick={() => onCreateOrder?.(token)}
            variant="outline"
            className="w-full font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
          >
            Create Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
