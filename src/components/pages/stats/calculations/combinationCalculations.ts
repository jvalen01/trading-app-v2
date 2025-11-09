import type { ClosedTradeMetrics } from '@/types';

export interface CombinationStats {
  bestCombinations: Array<{
    tradeType: string;
    ncfdRange: string;
    timeOfEntry: string;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
  }>;
}

export function calculateCombinationStats(closedTrades: ClosedTradeMetrics[]): CombinationStats {
  // Calculate win rates for all combinations of trade type, NCFD range, and time of entry
  const combinationWinRates: Record<string, { winRate: number; totalTrades: number; winningTrades: number }> = {};

  closedTrades.forEach(trade => {
    const tradeType = trade.trade_type || 'Unspecified';
    const timeOfEntry = trade.time_of_entry || 'Unspecified';

    // Determine NCFD range
    let ncfdRange: string;
    if (!trade.ncfd || trade.ncfd < 20) {
      ncfdRange = '<20';
    } else if (trade.ncfd <= 50) {
      ncfdRange = '20-50';
    } else if (trade.ncfd <= 80) {
      ncfdRange = '50-80';
    } else {
      ncfdRange = '>80';
    }

    const combinationKey = `${tradeType}|${ncfdRange}|${timeOfEntry}`;

    if (!combinationWinRates[combinationKey]) {
      combinationWinRates[combinationKey] = { winRate: 0, totalTrades: 0, winningTrades: 0 };
    }
    combinationWinRates[combinationKey].totalTrades += 1;
    if (trade.realizedPL > 0) {
      combinationWinRates[combinationKey].winningTrades += 1;
    }
  });

  // Calculate win rates for each combination
  Object.keys(combinationWinRates).forEach(key => {
    combinationWinRates[key].winRate = combinationWinRates[key].totalTrades > 0
      ? (combinationWinRates[key].winningTrades / combinationWinRates[key].totalTrades) * 100
      : 0;
  });

  // Find the top 3 combinations (require at least 10 combinations with 2+ trades for statistical significance)
  const validCombinations = Object.entries(combinationWinRates)
    .filter(([, data]) => data.totalTrades >= 2)
    .sort(([, a], [, b]) => b.winRate - a.winRate);

  const bestCombinations = validCombinations.length >= 10
    ? validCombinations.slice(0, 3).map(([key, data]) => {
        const [tradeType, ncfdRange, timeOfEntry] = key.split('|');
        return {
          tradeType,
          ncfdRange,
          timeOfEntry,
          winRate: data.winRate,
          totalTrades: data.totalTrades,
          winningTrades: data.winningTrades,
        };
      })
    : [];

  return { bestCombinations };
}