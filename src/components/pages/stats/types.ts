import type { ClosedTradeMetrics } from '@/types';

export interface TradeStats {
  totalTrades: number;
  activeTrades: number;
  closedTrades: number;
  totalPortfolioValue: number;
  totalRealizedPL: number;
  totalUnrealizedPL: number;
  winRate: number;
  averageTradeSize: number;
  bestTrade: ClosedTradeMetrics | null;
  worstTrade: ClosedTradeMetrics | null;
  tradesByType: Record<string, number>;
  tradesByRating: Record<number, number>;
  currentCapital: number;
  roiPercentage: number;
  capitalGrowth: number;
}