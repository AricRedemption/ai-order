'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConditionalOrder } from '@/types/orders';
import { formatPrice, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { Trash2, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getOrderExecutor } from '@/lib/trading/orderExecutor';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ConditionalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = localStorage.getItem('ai-meme-trader-orders');
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
      // Convert date strings back to Date objects
      const ordersWithDates = parsedOrders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        triggeredAt: order.triggeredAt ? new Date(order.triggeredAt) : undefined,
        executedAt: order.executedAt ? new Date(order.executedAt) : undefined,
        conditions: order.conditions.map((c: any) => ({
          ...c,
          value: c.type === 'time' ? new Date(c.value) : c.value,
        })),
      }));
      setOrders(ordersWithDates);
    }
    setLoading(false);
  };

  const cancelOrder = (orderId: string) => {
    if (!confirm('确定要取消这个订单吗？')) return;

    const updatedOrders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('ai-meme-trader-orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    // Remove from executor
    const executor = getOrderExecutor();
    executor.removeOrder(orderId);
  };

  const getStatusBadge = (status: ConditionalOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />等待中</Badge>;
      case 'triggered':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />已触发</Badge>;
      case 'executed':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />已执行</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />已取消</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getConditionText = (condition: any) => {
    const operators: any = {
      '>': '大于',
      '<': '小于',
      '>=': '大于等于',
      '<=': '小于等于',
      '=': '等于',
    };

    switch (condition.type) {
      case 'price':
        return `价格 ${operators[condition.operator]} ${formatPrice(condition.value)}`;
      case 'marketCap':
        return `市值 ${operators[condition.operator]} ${formatCurrency(condition.value)}`;
      case 'volume':
        return `24h交易量 ${operators[condition.operator]} ${formatCurrency(condition.value)}`;
      case 'time':
        return `时间到达 ${new Date(condition.value).toLocaleString()}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'triggered');
  const completedOrders = orders.filter(o => o.status === 'executed' || o.status === 'failed' || o.status === 'cancelled');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">条件单管理</h1>
          <p className="text-muted-foreground">
            管理你的所有条件单，查看执行状态和历史记录
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总订单数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                等待中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {pendingOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已执行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {orders.filter(o => o.status === 'executed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                失败/取消
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {orders.filter(o => o.status === 'failed' || o.status === 'cancelled').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">活跃订单</h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={cancelOrder}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">历史订单</h2>
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={cancelOrder}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">还没有创建任何条件单</p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                去创建订单
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function OrderCard({ order, onCancel }: { order: ConditionalOrder; onCancel: (id: string) => void }) {
  const getStatusBadge = (status: ConditionalOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />等待中</Badge>;
      case 'triggered':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />已触发</Badge>;
      case 'executed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已执行</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />已取消</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
    }
  };

  const getConditionText = (condition: any) => {
    const operators: any = {
      '>': '大于',
      '<': '小于',
      '>=': '大于等于',
      '<=': '小于等于',
      '=': '等于',
    };

    switch (condition.type) {
      case 'price':
        return `价格 ${operators[condition.operator]} ${formatPrice(condition.value)}`;
      case 'marketCap':
        return `市值 ${operators[condition.operator]} ${formatCurrency(condition.value)}`;
      case 'volume':
        return `24h交易量 ${operators[condition.operator]} ${formatCurrency(condition.value)}`;
      case 'time':
        return `时间到达 ${new Date(condition.value).toLocaleString()}`;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{order.tokenSymbol}</h3>
                <Badge variant={order.chain === 'solana' ? 'default' : 'secondary'}>
                  {order.chain === 'solana' ? 'SOL' : 'BNB'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{order.tokenName}</p>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">购买金额</div>
            <div className="text-lg font-semibold">
              {order.amount} {order.chain === 'solana' ? 'SOL' : 'BNB'}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">创建时间</div>
            <div className="text-lg font-semibold">
              {formatRelativeTime(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">触发条件</div>
          <div className="space-y-1">
            {order.conditions.map((condition, idx) => (
              <div key={idx} className="text-sm bg-secondary px-3 py-2 rounded">
                {getConditionText(condition)}
              </div>
            ))}
          </div>
        </div>

        {order.aiPrompt && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
            <div className="text-xs text-muted-foreground mb-1">AI 创建</div>
            <div className="text-sm italic">&quot;{order.aiPrompt}&quot;</div>
          </div>
        )}

        {order.txHash && (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">交易哈希</div>
            <a
              href={`${order.chain === 'solana' ? 'https://solscan.io/tx/' : 'https://bscscan.com/tx/'}${order.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {order.txHash.slice(0, 8)}...{order.txHash.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {order.error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <div className="text-sm text-destructive">{order.error}</div>
          </div>
        )}

        {order.status === 'pending' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancel(order.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            取消订单
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
