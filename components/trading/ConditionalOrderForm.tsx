'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConditionalOrder, CreateOrderRequest, OrderCondition } from '@/types/orders';
import type { MemeToken } from '@/types/meme';
import { X, Plus, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { formatPrice, formatCurrency } from '@/lib/utils/formatters';

interface ConditionalOrderFormProps {
  token?: MemeToken;
  onOrderCreated?: (order: ConditionalOrder) => void;
  onClose?: () => void;
}

export function ConditionalOrderForm({ token, onOrderCreated, onClose }: ConditionalOrderFormProps) {
  const [amount, setAmount] = useState('');
  const [conditions, setConditions] = useState<OrderCondition[]>([
    { type: 'price', operator: '<', value: 0, label: '' },
  ]);

  useEffect(() => {
    if (token) {
      // Pre-fill first condition with current price
      setConditions([
        {
          type: 'price',
          operator: '<',
          value: token.price * 0.9, // 10% below current price
          label: '',
        },
      ]);
    }
  }, [token]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { type: 'price', operator: '<', value: 0, label: '' },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof OrderCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handleSubmit = () => {
    if (!token || !amount || parseFloat(amount) <= 0) {
      alert('请填写有效的购买金额');
      return;
    }

    if (conditions.length === 0) {
      alert('请至少添加一个条件');
      return;
    }

    // Validate conditions
    for (const condition of conditions) {
      if (condition.type === 'time') {
        if (!condition.value || new Date(condition.value) <= new Date()) {
          alert('时间条件必须是未来时间');
          return;
        }
      } else {
        if (!condition.value || typeof condition.value !== 'number' || condition.value <= 0) {
          alert('条件值必须大于0');
          return;
        }
      }
    }

    const order: ConditionalOrder = {
      id: `order-${Date.now()}`,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      chain: token.chain,
      amount: parseFloat(amount),
      conditions,
      status: 'pending',
      createdAt: new Date(),
      createdBy: 'user',
    };

    // Save to localStorage
    const storedOrders = localStorage.getItem('ai-meme-trader-orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    orders.push(order);
    localStorage.setItem('ai-meme-trader-orders', JSON.stringify(orders));

    onOrderCreated?.(order);
    onClose?.();
  };

  if (!token) {
    return (
      <Card className="border-dashed shadow-sm">
        <CardContent className="p-8 text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">请先选择一个代币以创建订单</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span>⚡</span> 创建智能条件单
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="font-bold text-primary">{token.symbol}</span>
              <span className="text-muted-foreground">•</span>
              <span>当前价格: {formatPrice(token.price)}</span>
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2 sm:mt-0">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Amount */}
        <div className="space-y-3">
          <Label htmlFor="amount" className="text-base font-semibold">
            买入金额
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
              {token.chain === 'solana' ? 'SOL' : 'BNB'}
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="1.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 h-12 text-lg font-medium"
            />
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              触发条件
              <Badge variant="outline" className="font-normal text-xs">
                {conditions.length} / 5
              </Badge>
            </Label>
            <Button variant="secondary" size="sm" onClick={addCondition} disabled={conditions.length >= 5}>
              <Plus className="w-4 h-4 mr-1" />
              添加条件
            </Button>
          </div>

          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={index} className="relative group bg-muted/20 p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeCondition(index)}
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <span className="bg-background px-2 py-0.5 rounded-md border text-xs">Condition {index + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Condition Type */}
                    <div className="sm:col-span-4">
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={condition.type}
                        onChange={(e) => updateCondition(index, 'type', e.target.value)}
                      >
                        <option value="price">🏷️ 价格 Price</option>
                        <option value="marketCap">📊 市值 Market Cap</option>
                        <option value="volume">📈 交易量 Volume</option>
                        <option value="time">⏰ 时间 Time</option>
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="sm:col-span-3">
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      >
                        <option value=">">&gt; 大于</option>
                        <option value="<">&lt; 小于</option>
                        <option value=">=">≥ 大于等于</option>
                        <option value="<=">≤ 小于等于</option>
                        <option value="=">= 等于</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div className="sm:col-span-5">
                      {condition.type === 'time' ? (
                        <input
                          type="datetime-local"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          value={
                            condition.value
                              ? new Date(condition.value).toISOString().slice(0, 16)
                              : ''
                          }
                          onChange={(e) =>
                            updateCondition(
                              index,
                              'value',
                              new Date(e.target.value)
                            )
                          }
                        />
                      ) : (
                        <Input
                          type="number"
                          step="0.000001"
                          min="0"
                          placeholder="Value"
                          value={typeof condition.value === 'number' ? condition.value : ''}
                          onChange={(e) =>
                            updateCondition(index, 'value', parseFloat(e.target.value))
                          }
                          className="h-10 font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-3 py-2 rounded-lg">
                    {condition.type === 'price' && <DollarSign className="w-3.5 h-3.5 text-primary" />}
                    {condition.type === 'marketCap' && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                    {condition.type === 'volume' && <Activity className="w-3.5 h-3.5 text-primary" />}
                    {condition.type === 'time' && <Calendar className="w-3.5 h-3.5 text-primary" />}
                    
                    <span className="font-medium">
                      {condition.type === 'price' && `Trigger when Price ${condition.operator} ${formatPrice(condition.value as number)}`}
                      {condition.type === 'marketCap' && `Trigger when MC ${condition.operator} ${formatCurrency(condition.value as number)}`}
                      {condition.type === 'volume' && `Trigger when Vol ${condition.operator} ${formatCurrency(condition.value as number)}`}
                      {condition.type === 'time' && `Trigger at ${condition.value ? new Date(condition.value).toLocaleString() : '...'}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Activity className="w-4 h-4" />
            订单摘要
          </div>
          <div className="text-sm leading-relaxed">
            当满足 <span className="font-bold">{conditions.length}</span> 个条件时，系统将自动买入{' '}
            <span className="font-bold text-foreground">{amount || '0'} {token.chain === 'solana' ? 'SOL' : 'BNB'}</span>{' '}
            的 <span className="font-bold text-foreground">{token.symbol}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} size="lg" className="w-full">
              取消
            </Button>
          )}
          <Button onClick={handleSubmit} size="lg" className={`w-full font-bold shadow-lg shadow-primary/20 ${!onClose ? 'col-span-2' : ''}`}>
            立即创建
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
