import type { ClosedTradeMetrics } from '@/types';

export type TradeStats = {
  totalTrades: number;
  activeTrades: number;
  closedTrades: number;
  totalPortfolioValue: number;
  totalRealizedPL: number;
  totalUnrealizedPL: number;
  winRate: number;
  averageTradeSize: number;
  averageTradeSizePercentage: number;
  bestTrade: ClosedTradeMetrics | null;
  worstTrade: ClosedTradeMetrics | null;
  tradesByType: Record<string, number>;
  tradesByRating: Record<number, number>;
  currentCapital: number;
  roiPercentage: number;
  capitalGrowth: number;
  biggestWinStreak: number;
  biggestLossStreak: number;
  biggestDrawdown: number;
  biggestDrawdownPercentage: number;
  averageDrawdown: number;
  averageDrawdownPercentage: number;
  winRateByNCFD: {
    '<20': { winRate: number; totalTrades: number; winningTrades: number };
    '20-50': { winRate: number; totalTrades: number; winningTrades: number };
    '50-80': { winRate: number; totalTrades: number; winningTrades: number };
    '>80': { winRate: number; totalTrades: number; winningTrades: number };
  };
  winRateByTradeType: Record<string, { winRate: number; totalTrades: number; winningTrades: number }>;
  winRateByTimeOfEntry: Record<string, { winRate: number; totalTrades: number; winningTrades: number }>;
};