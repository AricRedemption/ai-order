'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { Bot, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">控制台</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/assistant" className="block group">
            <div className="p-6 bg-card border rounded-xl hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Bot size={32} />
                </div>
                <h2 className="text-2xl font-bold">交易助手</h2>
              </div>
              <p className="text-muted-foreground">
                使用 AI 语音或文字助手创建智能条件单。
              </p>
            </div>
          </Link>

          <Link href="/dashboard/memes" className="block group">
            <div className="p-6 bg-card border rounded-xl hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp size={32} />
                </div>
                <h2 className="text-2xl font-bold">热门 Meme 币</h2>
              </div>
              <p className="text-muted-foreground">
                浏览市场热点，查看 AI 分析和实时数据。
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
