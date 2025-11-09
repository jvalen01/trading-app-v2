import type { ClosedTradeMetrics } from '@/types';

export interface MonthlyPerformanceStats {
  bestMonth: { month: string; performance: number } | null;
  worstMonth: { month: string; performance: number } | null;
  averageMonthPerformance: number;
}

export function calculateMonthlyPerformanceStats(closedTrades: ClosedTradeMetrics[], startingCapital: number): MonthlyPerformanceStats {
  // Calculate monthly performance
  const monthlyPerformance: Record<string, { totalPL: number; tradeCount: number }> = {};

  closedTrades.forEach(trade => {
    const tradeDate = new Date(trade.exitDate);
    const monthKey = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyPerformance[monthKey]) {
      monthlyPerformance[monthKey] = { totalPL: 0, tradeCount: 0 };
    }

    monthlyPerformance[monthKey].totalPL += trade.realizedPL;
    monthlyPerformance[monthKey].tradeCount += 1;
  });

  // Calculate monthly performance percentages (assuming starting capital for each month)
  const monthlyPerformancePercentages = Object.entries(monthlyPerformance).map(([month, data]) => {
    // For simplicity, we'll use the starting capital as the base for percentage calculations
    // In a more sophisticated implementation, you'd track capital at the start of each month
    const performancePercentage = startingCapital > 0 ? (data.totalPL / startingCapital) * 100 : 0;
    return { month, performance: performancePercentage, totalPL: data.totalPL, tradeCount: data.tradeCount };
  });

  // Find best and worst months
  const bestMonth = monthlyPerformancePercentages.length > 0
    ? monthlyPerformancePercentages.reduce((best, month) =>
        month.performance > best.performance ? month : best
      )
    : null;

  const worstMonth = monthlyPerformancePercentages.length > 0
    ? monthlyPerformancePercentages.reduce((worst, month) =>
        month.performance < worst.performance ? month : worst
      )
    : null;

  // Calculate average monthly performance
  const averageMonthPerformance = monthlyPerformancePercentages.length > 0
    ? monthlyPerformancePercentages.reduce((sum, month) => sum + month.performance, 0) / monthlyPerformancePercentages.length
    : 0;

  return {
    bestMonth,
    worstMonth,
    averageMonthPerformance,
  };
}