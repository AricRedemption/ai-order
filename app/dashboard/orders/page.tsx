'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConditionalOrder } from '@/types/orders';
import { formatPrice, formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { Trash2, ExternalLink, Clock, CheckCircle, XCircle, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getOrderExecutor } from '@/lib/trading/orderExecutor';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ConditionalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = localStorage.getItem('ai-meme-trader-orders');
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
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
    const executor = getOrderExecutor();
    executor.removeOrder(orderId);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'triggered');
  const completedOrders = orders.filter(o => o.status === 'executed' || o.status === 'failed' || o.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB]">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#162361]" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="px-2 mb-6">
          <h1 className="text-[26px] font-black text-[#162361] tracking-tighter leading-none">
            Orders
          </h1>
          <p className="text-sm text-gray-400 font-bold mt-1">Manage your automated trading strategies</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total" value={orders.length} color="text-[#162361]" />
            <StatCard label="Active" value={pendingOrders.length} color="text-amber-500" />
            <StatCard label="Executed" value={orders.filter(o => o.status === 'executed').length} color="text-emerald-500" />
            <StatCard label="Failed" value={orders.filter(o => o.status === 'failed' || o.status === 'cancelled').length} color="text-rose-500" />
        </div>

        {/* Active Orders List */}
        <div className="mb-8">
           <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-[18px] font-black text-[#162361]">Active Orders</h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{pendingOrders.length}</span>
           </div>
           
           {pendingOrders.length > 0 ? (
             <div className="flex flex-col space-y-3">
               {pendingOrders.map((order) => (
                 <OrderRow key={order.id} order={order} onCancel={cancelOrder} />
               ))}
             </div>
           ) : (
             <EmptyState />
           )}
        </div>

        {/* History List */}
        {completedOrders.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between px-2 mb-4">
               <h2 className="text-[18px] font-black text-[#162361] opacity-60">History</h2>
            </div>
            <div className="flex flex-col space-y-3 opacity-80 hover:opacity-100 transition-opacity">
              {completedOrders.map((order) => (
                <OrderRow key={order.id} order={order} onCancel={cancelOrder} isHistory />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-2xl font-black ${color}`}>{value}</span>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="bg-white p-8 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-[#162361] mb-1">No active orders</p>
            <p className="text-xs text-gray-400 mb-4">Create a new order to get started</p>
            <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="rounded-full bg-[#162361] hover:bg-[#2a3b8f] text-white font-bold px-6 h-9 text-xs shadow-lg shadow-blue-900/20"
            >
                Create Order
            </Button>
        </div>
    )
}

function OrderRow({ order, onCancel, isHistory }: { order: ConditionalOrder; onCancel: (id: string) => void; isHistory?: boolean }) {
  const getStatusConfig = (status: ConditionalOrder['status']) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' };
      case 'triggered': return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Triggered' };
      case 'executed': return { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Filled' };
      case 'cancelled': return { color: 'text-gray-400', bg: 'bg-gray-100', label: 'Cancelled' };
      case 'failed': return { color: 'text-rose-500', bg: 'bg-rose-50', label: 'Failed' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-100', label: status };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  
  // Get primary condition (price)
  const priceCondition = order.conditions.find(c => c.type === 'price');
  const conditionText = priceCondition 
    ? `${priceCondition.operator === '>=' || priceCondition.operator === '>' ? '≥' : '≤'} ${formatPrice(Number(priceCondition.value))}`
    : 'Multiple Conditions';

  return (
    <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start">
        {/* Left Side: Asset Info */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600`}>
              BUY
            </span>
            <span className="text-[16px] font-black text-[#162361]">{order.tokenSymbol}</span>
            <span className="text-[10px] font-bold text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                {order.chain === 'solana' ? 'SOL' : 'BSC'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gray-400">{formatRelativeTime(order.createdAt)}</span>
            {order.aiPrompt && (
                <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded flex items-center">
                    AI
                </span>
            )}
          </div>
        </div>

        {/* Right Side: Amount & Status */}
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black text-[#162361] mb-1">
            {order.amount} {order.chain === 'solana' ? 'SOL' : 'BNB'}
          </span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                <span className="mr-1 text-gray-400">Target:</span>
                {conditionText}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded/Footer Section for Actions */}
      {!isHistory && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-0 group-hover:h-auto overflow-hidden">
             <div className="text-[10px] font-medium text-gray-400">
                ID: {order.id.slice(0, 8)}
             </div>
             <button 
                onClick={() => onCancel(order.id)}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors flex items-center"
             >
                <Trash2 className="w-3 h-3 mr-1" />
                Cancel Order
             </button>
          </div>
      )}
      
      {/* Transaction Link for Executed Orders */}
      {order.txHash && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex justify-end">
             <a
              href={`${order.chain === 'solana' ? 'https://solscan.io/tx/' : 'https://bscscan.com/tx/'}${order.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center"
            >
              View Transaction <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
      )}
    </div>
  );
}

