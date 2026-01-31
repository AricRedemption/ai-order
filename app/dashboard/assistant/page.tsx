'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/ai/ChatInterface';

export default function AssistantPage() {
  const handleOrderCreated = (order: any) => {
    alert('条件单创建成功！\n前往"订单管理"页面查看。');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">交易助手</h1>
          <p className="text-muted-foreground">
            使用 AI 助手创建智能条件单
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
             <div className="space-y-4">
              <ChatInterface onOrderCreated={handleOrderCreated} />
              
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-sm text-muted-foreground">
                <p className="font-semibold text-blue-500 mb-1">💡 Pro Tip</p>
                Try saying: &quot;Buy 1M PEPE when market cap hits $500M&quot;
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
