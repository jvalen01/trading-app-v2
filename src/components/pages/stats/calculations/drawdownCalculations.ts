import type { ClosedTradeMetrics } from '@/types';

export interface DrawdownStats {
  biggestDrawdown: number;
  biggestDrawdownPercentage: number;
  averageDrawdown: number;
  averageDrawdownPercentage: number;
}

export function calculateDrawdownStats(closedTrades: ClosedTradeMetrics[], startingCapital: number): DrawdownStats {
  // Calculate drawdowns from all-time highs
  let peak = startingCapital;
  let currentDrawdown = 0;
  let biggestDrawdown = 0;
  let biggestDrawdownPercentage = 0;
  const drawdowns: number[] = [];
  const drawdownPercentages: number[] = [];

  // Sort trades by exit date and calculate running capital
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());

  sortedTrades.forEach(trade => {
    const tradePL = trade.realizedPL;
    const capitalAfterTrade = peak + tradePL;

    if (capitalAfterTrade > peak) {
      peak = capitalAfterTrade;
      if (currentDrawdown < 0) {
        drawdowns.push(currentDrawdown);
        drawdownPercentages.push((currentDrawdown / peak) * 100);
        currentDrawdown = 0;
      }
    } else {
      currentDrawdown = capitalAfterTrade - peak;
      const currentDrawdownPercentage = (currentDrawdown / peak) * 100;
      biggestDrawdown = Math.min(biggestDrawdown, currentDrawdown);
      biggestDrawdownPercentage = Math.min(biggestDrawdownPercentage, currentDrawdownPercentage);
    }
  });

  // Add final drawdown if exists
  if (currentDrawdown < 0) {
    drawdowns.push(currentDrawdown);
    drawdownPercentages.push((currentDrawdown / peak) * 100);
  }

  const averageDrawdown = drawdowns.length > 0
    ? drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length
    : 0;

  const averageDrawdownPercentage = drawdownPercentages.length > 0
    ? drawdownPercentages.reduce((sum, dd) => sum + dd, 0) / drawdownPercentages.length
    : 0;

  return {
    biggestDrawdown,
    biggestDrawdownPercentage,
    averageDrawdown,
    averageDrawdownPercentage,
  };
}