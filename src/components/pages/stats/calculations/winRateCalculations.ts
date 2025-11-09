import type { ClosedTradeMetrics } from '@/types';

export interface WinRateStats {
  winRateByNCFD: {
    '<20': { winRate: number; totalTrades: number; winningTrades: number };
    '20-50': { winRate: number; totalTrades: number; winningTrades: number };
    '50-80': { winRate: number; totalTrades: number; winningTrades: number };
    '>80': { winRate: number; totalTrades: number; winningTrades: number };
  };
  winRateByTradeType: Record<string, { winRate: number; totalTrades: number; winningTrades: number }>;
  winRateByTimeOfEntry: Record<string, { winRate: number; totalTrades: number; winningTrades: number }>;
}

export function calculateWinRateStats(closedTrades: ClosedTradeMetrics[]): WinRateStats {
  // Calculate win rates by NCFD range
  const ncfdWinRates = {
    '<20': { winRate: 0, totalTrades: 0, winningTrades: 0 },
    '20-50': { winRate: 0, totalTrades: 0, winningTrades: 0 },
    '50-80': { winRate: 0, totalTrades: 0, winningTrades: 0 },
    '>80': { winRate: 0, totalTrades: 0, winningTrades: 0 },
  };

  closedTrades.forEach(trade => {
    let ncfdRange: keyof typeof ncfdWinRates;
    if (!trade.ncfd || trade.ncfd < 20) {
      ncfdRange = '<20';
    } else if (trade.ncfd <= 50) {
      ncfdRange = '20-50';
    } else if (trade.ncfd <= 80) {
      ncfdRange = '50-80';
    } else {
      ncfdRange = '>80';
    }

    ncfdWinRates[ncfdRange].totalTrades += 1;
    if (trade.realizedPL > 0) {
      ncfdWinRates[ncfdRange].winningTrades += 1;
    }
  });

  // Calculate win rates for each NCFD range
  Object.keys(ncfdWinRates).forEach(range => {
    const rangeKey = range as keyof typeof ncfdWinRates;
    ncfdWinRates[rangeKey].winRate = ncfdWinRates[rangeKey].totalTrades > 0
      ? (ncfdWinRates[rangeKey].winningTrades / ncfdWinRates[rangeKey].totalTrades) * 100
      : 0;
  });

  // Calculate win rates by trade type
  const tradeTypeWinRates: Record<string, { winRate: number; totalTrades: number; winningTrades: number }> = {};

  closedTrades.forEach(trade => {
    const type = trade.trade_type || 'Unspecified';
    if (!tradeTypeWinRates[type]) {
      tradeTypeWinRates[type] = { winRate: 0, totalTrades: 0, winningTrades: 0 };
    }
    tradeTypeWinRates[type].totalTrades += 1;
    if (trade.realizedPL > 0) {
      tradeTypeWinRates[type].winningTrades += 1;
    }
  });

  // Calculate win rates for each trade type
  Object.keys(tradeTypeWinRates).forEach(type => {
    tradeTypeWinRates[type].winRate = tradeTypeWinRates[type].totalTrades > 0
      ? (tradeTypeWinRates[type].winningTrades / tradeTypeWinRates[type].totalTrades) * 100
      : 0;
  });

  // Calculate win rates by time of entry
  const timeOfEntryWinRates: Record<string, { winRate: number; totalTrades: number; winningTrades: number }> = {};

  closedTrades.forEach(trade => {
    const timeOfEntry = trade.time_of_entry || 'Unspecified';
    if (!timeOfEntryWinRates[timeOfEntry]) {
      timeOfEntryWinRates[timeOfEntry] = { winRate: 0, totalTrades: 0, winningTrades: 0 };
    }
    timeOfEntryWinRates[timeOfEntry].totalTrades += 1;
    if (trade.realizedPL > 0) {
      timeOfEntryWinRates[timeOfEntry].winningTrades += 1;
    }
  });

  // Calculate win rates for each time of entry
  Object.keys(timeOfEntryWinRates).forEach(timeOfEntry => {
    timeOfEntryWinRates[timeOfEntry].winRate = timeOfEntryWinRates[timeOfEntry].totalTrades > 0
      ? (timeOfEntryWinRates[timeOfEntry].winningTrades / timeOfEntryWinRates[timeOfEntry].totalTrades) * 100
      : 0;
  });

  return {
    winRateByNCFD: ncfdWinRates,
    winRateByTradeType: tradeTypeWinRates,
    winRateByTimeOfEntry: timeOfEntryWinRates,
  };
}