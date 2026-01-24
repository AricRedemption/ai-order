'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TrendingMemes } from '@/components/trading/TrendingMemes';
import { ConditionalOrderForm } from '@/components/trading/ConditionalOrderForm';
import type { MemeToken } from '@/types/meme';

export default function MemesPage() {
  const [selectedToken, setSelectedToken] = useState<MemeToken | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleBuy = (token: MemeToken) => {
    alert(`快速买入功能即将推出！\n代币: ${token.symbol}\n当前价格: ${token.price}`);
  };

  const handleCreateOrder = (token: MemeToken) => {
    setSelectedToken(token);
    setShowOrderForm(true);
  };

  const handleOrderCreated = (order: any) => {
    setShowOrderForm(false);
    setSelectedToken(null);
    alert('条件单创建成功！\n前往"订单管理"页面查看。');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">热门 Meme 币</h1>
          <p className="text-muted-foreground">
            发现热门 Meme 币，基于实时交易量和 AI 情感分析
          </p>
        </div>

        {showOrderForm && selectedToken ? (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300 max-w-3xl mx-auto">
            <ConditionalOrderForm
                token={selectedToken}
                onOrderCreated={handleOrderCreated}
                onClose={() => {
                setShowOrderForm(false);
                setSelectedToken(null);
                }}
            />
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl">
                    <div>
                    <h2 className="text-2xl font-bold tracking-tight">市场概览</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        实时监控市场热点
                    </p>
                    </div>
                </div>
                
                <TrendingMemes
                    onBuy={handleBuy}
                    onCreateOrder={handleCreateOrder}
                />
            </div>
        )}
      </main>
    </div>
  );
}
