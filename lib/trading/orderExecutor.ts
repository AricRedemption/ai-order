import type { ConditionalOrder, OrderCondition, OrderExecutionResult } from '@/types/orders';
import { getMockTokenByAddress } from '@/lib/data/mockMemeData';

/**
 * Order Executor - Monitors and executes conditional orders
 */
export class OrderExecutor {
  private orders: ConditionalOrder[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Add a new order to monitor
   */
  addOrder(order: ConditionalOrder): void {
    this.orders.push(order);
    console.log('[OrderExecutor] Added order:', order.id);
  }

  /**
   * Remove an order (cancel)
   */
  removeOrder(orderId: string): void {
    this.orders = this.orders.filter(o => o.id !== orderId);
    console.log('[OrderExecutor] Removed order:', orderId);
  }

  /**
   * Get all orders
   */
  getOrders(): ConditionalOrder[] {
    return [...this.orders];
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): ConditionalOrder | undefined {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: ConditionalOrder['status'], txHash?: string, error?: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (txHash) order.txHash = txHash;
      if (error) order.error = error;
      if (status === 'triggered') order.triggeredAt = new Date();
      if (status === 'executed') order.executedAt = new Date();
    }
  }

  /**
   * Start monitoring orders
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.checkInterval) {
      console.log('[OrderExecutor] Already monitoring');
      return;
    }

    console.log('[OrderExecutor] Started monitoring');
    this.checkInterval = setInterval(() => {
      this.checkOrders();
    }, intervalMs);
  }

  /**
   * Stop monitoring orders
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[OrderExecutor] Stopped monitoring');
    }
  }

  /**
   * Check all pending orders and execute if conditions met
   */
  private async checkOrders(): Promise<void> {
    const pendingOrders = this.orders.filter(o => o.status === 'pending');

    for (const order of pendingOrders) {
      const shouldExecute = await this.checkConditions(order);

      if (shouldExecute) {
        console.log('[OrderExecutor] Conditions met for order:', order.id);
        this.updateOrderStatus(order.id, 'triggered');

        // Execute order (would call trading strategy here)
        await this.executeOrder(order);
      }
    }
  }

  /**
   * Check if all conditions for an order are met
   */
  private async checkConditions(order: ConditionalOrder): Promise<boolean> {
    const token = getMockTokenByAddress(order.tokenAddress);
    if (!token) {
      console.error('[OrderExecutor] Token not found:', order.tokenAddress);
      return false;
    }

    for (const condition of order.conditions) {
      const met = this.checkSingleCondition(condition, token);
      if (!met) {
        return false; // All conditions must be met
      }
    }

    return true;
  }

  /**
   * Check a single condition
   */
  private checkSingleCondition(condition: OrderCondition, token: any): boolean {
    let currentValue: number | Date;

    // Get current value based on condition type
    switch (condition.type) {
      case 'price':
        currentValue = token.price;
        break;
      case 'marketCap':
        currentValue = token.marketCap;
        break;
      case 'volume':
        currentValue = token.volume24h;
        break;
      case 'time':
        currentValue = new Date();
        break;
      default:
        return false;
    }

    // Compare based on operator
    return this.compareValues(currentValue, condition.operator, condition.value);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(
    current: number | Date,
    operator: OrderCondition['operator'],
    target: number | Date
  ): boolean {
    const currentNum = current instanceof Date ? current.getTime() : current;
    const targetNum = target instanceof Date ? target.getTime() : target;

    switch (operator) {
      case '>':
        return currentNum > targetNum;
      case '<':
        return currentNum < targetNum;
      case '>=':
        return currentNum >= targetNum;
      case '<=':
        return currentNum <= targetNum;
      case '=':
        return Math.abs(currentNum - targetNum) < 0.0001; // Fuzzy equality for floats
      default:
        return false;
    }
  }

  /**
   * Execute an order (mock implementation)
   */
  private async executeOrder(order: ConditionalOrder): Promise<void> {
    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: 90% success rate
      if (Math.random() > 0.1) {
        const mockTxHash = this.generateMockTxHash(order.chain);
        this.updateOrderStatus(order.id, 'executed', mockTxHash);
        console.log('[OrderExecutor] Order executed:', order.id, mockTxHash);
      } else {
        this.updateOrderStatus(order.id, 'failed', undefined, 'Execution failed: Insufficient liquidity');
        console.error('[OrderExecutor] Order failed:', order.id);
      }
    } catch (error) {
      console.error('[OrderExecutor] Execution error:', error);
      this.updateOrderStatus(order.id, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private generateMockTxHash(chain: 'solana' | 'bnb'): string {
    if (chain === 'solana') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
      let hash = '';
      for (let i = 0; i < 88; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return hash;
    } else {
      const chars = '0123456789abcdef';
      let hash = '0x';
      for (let i = 0; i < 64; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return hash;
    }
  }
}

// Singleton instance
let executorInstance: OrderExecutor | null = null;

export function getOrderExecutor(): OrderExecutor {
  if (!executorInstance) {
    executorInstance = new OrderExecutor();
  }
  return executorInstance;
}
