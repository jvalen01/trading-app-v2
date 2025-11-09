import type { TradeMetrics, ClosedTradeMetrics } from '@/types';

export interface PortfolioStats {
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
}

export function calculatePortfolioStats(
  activeTrades: TradeMetrics[],
  closedTrades: ClosedTradeMetrics[],
  startingCapital: number
): PortfolioStats {
  const totalTrades = activeTrades.length + closedTrades.length;
  const activeTradesCount = activeTrades.length;
  const closedTradesCount = closedTrades.length;

  // Calculate portfolio values
  const totalPortfolioValue = activeTrades.reduce((sum, trade) => sum + trade.totalCost, 0);
  const totalRealizedPL = closedTrades.reduce((sum, trade) => sum + trade.realizedPL, 0);
  const totalUnrealizedPL = 0; // Would need current market prices for this

  // Calculate win rate
  const winningTrades = closedTrades.filter(trade => trade.realizedPL > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  // Calculate average trade size
  const allTradeValues = [...activeTrades.map(t => t.totalCost), ...closedTrades.map(t => t.averageBuyPrice * t.totalBought)];
  const averageTradeSize = allTradeValues.length > 0 ? allTradeValues.reduce((sum, val) => sum + val, 0) / allTradeValues.length : 0;
  const averageTradeSizePercentage = startingCapital > 0 ? (averageTradeSize / startingCapital) * 100 : 0;

  // Find best and worst trades
  const bestTrade = closedTrades.length > 0 ? closedTrades.reduce((best, trade) =>
    trade.realizedPL > best.realizedPL ? trade : best
  ) : null;

  const worstTrade = closedTrades.length > 0 ? closedTrades.reduce((worst, trade) =>
    trade.realizedPL < worst.realizedPL ? trade : worst
  ) : null;

  // Trades by type
  const tradesByType: Record<string, number> = {};
  [...activeTrades, ...closedTrades].forEach(trade => {
    const type = trade.trade_type || 'Unspecified';
    tradesByType[type] = (tradesByType[type] || 0) + 1;
  });

  // Trades by rating
  const tradesByRating: Record<number, number> = {};
  [...activeTrades, ...closedTrades].forEach(trade => {
    if (trade.trade_rating !== undefined) {
      tradesByRating[trade.trade_rating] = (tradesByRating[trade.trade_rating] || 0) + 1;
    }
  });

  // Calculate current capital and ROI
  const currentCapital = startingCapital + totalRealizedPL;
  const roiPercentage = startingCapital > 0 ? ((currentCapital - startingCapital) / startingCapital) * 100 : 0;
  const capitalGrowth = currentCapital - startingCapital;

  return {
    totalTrades,
    activeTrades: activeTradesCount,
    closedTrades: closedTradesCount,
    totalPortfolioValue,
    totalRealizedPL,
    totalUnrealizedPL,
    winRate,
    averageTradeSize,
    averageTradeSizePercentage,
    bestTrade,
    worstTrade,
    tradesByType,
    tradesByRating,
    currentCapital,
    roiPercentage,
    capitalGrowth,
  };
}