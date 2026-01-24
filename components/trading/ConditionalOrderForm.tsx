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
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">请先选择一个代币</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>创建条件单</CardTitle>
            <CardDescription>
              {token.symbol} - 当前价格: {formatPrice(token.price)}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">购买金额 ({token.chain === 'solana' ? 'SOL' : 'BNB'})</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Conditions */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label>触发条件</Label>
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="w-4 h-4 mr-1" />
              添加条件
            </Button>
          </div>

          {conditions.map((condition, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">条件 {index + 1}</Label>
                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Condition Type */}
                  <select
                    className="col-span-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={condition.type}
                    onChange={(e) =>
                      updateCondition(index, 'type', e.target.value)
                    }
                  >
                    <option value="price">价格</option>
                    <option value="marketCap">市值</option>
                    <option value="volume">交易量</option>
                    <option value="time">时间</option>
                  </select>

                  {/* Operator */}
                  <select
                    className="col-span-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(index, 'operator', e.target.value)
                    }
                  >
                    <option value=">">大于 &gt;</option>
                    <option value="<">小于 &lt;</option>
                    <option value=">=">大于等于 ≥</option>
                    <option value="<=">小于等于 ≤</option>
                    <option value="=">=等于 =</option>
                  </select>

                  {/* Value */}
                  {condition.type === 'time' ? (
                    <input
                      type="datetime-local"
                      className="col-span-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                      placeholder={
                        condition.type === 'price'
                          ? '0.001'
                          : condition.type === 'marketCap'
                          ? '100000'
                          : '50000'
                      }
                      value={typeof condition.value === 'number' ? condition.value : ''}
                      onChange={(e) =>
                        updateCondition(index, 'value', parseFloat(e.target.value))
                      }
                    />
                  )}
                </div>

                {/* Condition Preview */}
                <div className="text-xs text-muted-foreground">
                  {condition.type === 'price' && <DollarSign className="w-3 h-3 inline mr-1" />}
                  {condition.type === 'marketCap' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {condition.type === 'volume' && <Activity className="w-3 h-3 inline mr-1" />}
                  {condition.type === 'time' && <Calendar className="w-3 h-3 inline mr-1" />}

                  {condition.type === 'price' && `当价格 ${condition.operator} ${formatPrice(condition.value as number)}`}
                  {condition.type === 'marketCap' && `当市值 ${condition.operator} ${formatCurrency(condition.value as number)}`}
                  {condition.type === 'volume' && `当24h交易量 ${condition.operator} ${formatCurrency(condition.value as number)}`}
                  {condition.type === 'time' && `在 ${condition.value ? new Date(condition.value).toLocaleString() : '...'}`}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 bg-secondary rounded-lg space-y-2">
          <div className="text-sm font-medium">订单摘要</div>
          <div className="text-sm text-muted-foreground">
            当以下所有条件满足时，将自动买入 {amount || '0'} {token.chain === 'solana' ? 'SOL' : 'BNB'} 的 {token.symbol}：
          </div>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {conditions.map((c, i) => (
              <li key={i}>
                {c.type === 'price' && `价格 ${c.operator} ${formatPrice(c.value as number)}`}
                {c.type === 'marketCap' && `市值 ${c.operator} ${formatCurrency(c.value as number)}`}
                {c.type === 'volume' && `24h交易量 ${c.operator} ${formatCurrency(c.value as number)}`}
                {c.type === 'time' && `时间到达 ${c.value ? new Date(c.value).toLocaleString() : '...'}`}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSubmit}>
            创建条件单
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
