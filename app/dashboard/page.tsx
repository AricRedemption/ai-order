'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TrendingMemes } from '@/components/trading/TrendingMemes';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { ConditionalOrderForm } from '@/components/trading/ConditionalOrderForm';
import type { MemeToken } from '@/types/meme';

export default function DashboardPage() {
  const [selectedToken, setSelectedToken] = useState<MemeToken | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleBuy = (token: MemeToken) => {
    // Quick buy - could show a simple modal
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
          <h1 className="text-4xl font-bold mb-2">交易控制台</h1>
          <p className="text-muted-foreground">
            发现热门 Meme 币，使用 AI 助手创建智能条件单
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Chat - Takes 1 column */}
          <div className="lg:col-span-1">
            <ChatInterface onOrderCreated={handleOrderCreated} />
          </div>

          {/* Order Form or Trending Memes - Takes 2 columns */}
          <div className="lg:col-span-2">
            {showOrderForm && selectedToken ? (
              <ConditionalOrderForm
                token={selectedToken}
                onOrderCreated={handleOrderCreated}
                onClose={() => {
                  setShowOrderForm(false);
                  setSelectedToken(null);
                }}
              />
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">热门 Meme 币</h2>
                  <p className="text-sm text-muted-foreground">
                    基于交易量排序的热门代币
                  </p>
                </div>
                <TrendingMemes
                  onBuy={handleBuy}
                  onCreateOrder={handleCreateOrder}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-secondary/50 rounded-lg">
          <div>
            <div className="text-lg font-semibold mb-2">💬 使用 AI 助手</div>
            <p className="text-sm text-muted-foreground">
              通过文字或语音与 AI 对话，创建智能条件单
            </p>
          </div>
          <div>
            <div className="text-lg font-semibold mb-2">📊 浏览代币</div>
            <p className="text-sm text-muted-foreground">
              查看 60+ 热门 Meme 币的实时数据和 AI 评分
            </p>
          </div>
          <div>
            <div className="text-lg font-semibold mb-2">⚡ 条件单</div>
            <p className="text-sm text-muted-foreground">
              设置价格/市值/交易量/时间条件，自动执行交易
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
