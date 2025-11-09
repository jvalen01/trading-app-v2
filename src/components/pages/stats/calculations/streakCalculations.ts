import type { ClosedTradeMetrics } from '@/types';

export interface StreakStats {
  biggestWinStreak: number;
  biggestLossStreak: number;
}

export function calculateStreakStats(closedTrades: ClosedTradeMetrics[]): StreakStats {
  // Calculate winning and losing streaks
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let biggestWinStreak = 0;
  let biggestLossStreak = 0;

  // Sort closed trades by exit date to calculate streaks chronologically
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());

  sortedTrades.forEach(trade => {
    if (trade.realizedPL > 0) {
      currentWinStreak += 1;
      currentLossStreak = 0;
      biggestWinStreak = Math.max(biggestWinStreak, currentWinStreak);
    } else {
      currentLossStreak += 1;
      currentWinStreak = 0;
      biggestLossStreak = Math.max(biggestLossStreak, currentLossStreak);
    }
  });

  return {
    biggestWinStreak,
    biggestLossStreak,
  };
}