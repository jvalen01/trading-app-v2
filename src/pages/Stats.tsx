import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { type DateRange } from 'react-day-picker';
import tradesAPI from '@/api/client';
import { RMultipleChart, PortfolioPerformanceChart, StatsOverviewCards, TradePerformanceCard, WinRateCard, StatsLoadingState, StatsErrorState } from '@/components/pages/stats';
import type { TradeMetrics, ClosedTradeMetrics } from '@/types';
import type { TradeStats } from '@/components/pages/stats/types';

export function Stats({ dateRange, startingCapital }: { dateRange: DateRange | undefined; startingCapital: number }) {
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allActiveTrades, setAllActiveTrades] = useState<TradeMetrics[]>([]);
  const [allClosedTrades, setAllClosedTrades] = useState<ClosedTradeMetrics[]>([]);
  const [filteredClosedTrades, setFilteredClosedTrades] = useState<ClosedTradeMetrics[]>([]);

const calculateStats = (activeTrades: TradeMetrics[], closedTrades: ClosedTradeMetrics[], startingCapital: number): TradeStats => {
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

    // Calculate capital metrics
    const currentCapital = startingCapital + totalRealizedPL;
    const roiPercentage = startingCapital > 0 ? ((currentCapital - startingCapital) / startingCapital) * 100 : 0;
    const capitalGrowth = currentCapital - startingCapital;

    // Calculate win rates by NCFD ranges
    const ncfdWinRates = {
      '<20': { winRate: 0, totalTrades: 0, winningTrades: 0 },
      '20-50': { winRate: 0, totalTrades: 0, winningTrades: 0 },
      '50-80': { winRate: 0, totalTrades: 0, winningTrades: 0 },
      '>80': { winRate: 0, totalTrades: 0, winningTrades: 0 },
    };

    closedTrades.forEach(trade => {
      if (trade.ncfd !== undefined) {
        let range: keyof typeof ncfdWinRates;
        if (trade.ncfd < 20) range = '<20';
        else if (trade.ncfd <= 50) range = '20-50';
        else if (trade.ncfd <= 80) range = '50-80';
        else range = '>80';

        ncfdWinRates[range].totalTrades += 1;
        if (trade.realizedPL > 0) {
          ncfdWinRates[range].winningTrades += 1;
        }
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

    // Calculate drawdowns from all-time highs
    let peak = startingCapital;
    let currentDrawdown = 0;
    let biggestDrawdown = 0;
    let biggestDrawdownPercentage = 0;
    const drawdowns: number[] = [];
    const drawdownPercentages: number[] = [];

    // Sort trades by exit date and calculate running capital
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
      biggestWinStreak,
      biggestLossStreak,
      biggestDrawdown,
      biggestDrawdownPercentage,
      averageDrawdown,
      averageDrawdownPercentage,
      winRateByNCFD: ncfdWinRates,
      winRateByTradeType: tradeTypeWinRates,
      winRateByTimeOfEntry: timeOfEntryWinRates,
    };
  };

  const filterTradesByDateRange = useCallback((
    activeTrades: TradeMetrics[],
    closedTrades: ClosedTradeMetrics[],
    range: DateRange | undefined
  ): { filteredActive: TradeMetrics[], filteredClosed: ClosedTradeMetrics[] } => {
    if (!range || !range.from) {
      return { filteredActive: activeTrades, filteredClosed: closedTrades };
    }

    const fromDate = new Date(range.from);
    const toDate = range.to ? new Date(range.to) : new Date();

    // For active trades, we filter by the earliest transaction date
    const filteredActive = activeTrades.filter(trade => {
      const earliestTransaction = trade.transactions.reduce((earliest, transaction) =>
        new Date(transaction.transaction_date) < new Date(earliest.transaction_date) ? transaction : earliest
      );
      const tradeDate = new Date(earliestTransaction.transaction_date);
      return tradeDate >= fromDate && tradeDate <= toDate;
    });

    // For closed trades, we filter by the exit date
    const filteredClosed = closedTrades.filter(trade => {
      const tradeDate = new Date(trade.exitDate);
      return tradeDate >= fromDate && tradeDate <= toDate;
    });

    return { filteredActive, filteredClosed };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const active = await tradesAPI.getActiveTrades();
      const closed = await tradesAPI.getClosedTradesWithRMetrics(startingCapital);
      setAllActiveTrades(active);
      setAllClosedTrades(closed);

      const { filteredActive, filteredClosed } = filterTradesByDateRange(active, closed, dateRange);
      setFilteredClosedTrades(filteredClosed);
      const calculatedStats = calculateStats(filteredActive, filteredClosed, startingCapital);
      setStats(calculatedStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, filterTradesByDateRange, startingCapital]);

  const recalculateStats = useCallback(() => {
    const { filteredActive, filteredClosed } = filterTradesByDateRange(allActiveTrades, allClosedTrades, dateRange);
    setFilteredClosedTrades(filteredClosed);
    const calculatedStats = calculateStats(filteredActive, filteredClosed, startingCapital);
    setStats(calculatedStats);
  }, [allActiveTrades, allClosedTrades, dateRange, filterTradesByDateRange, startingCapital]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (allActiveTrades.length > 0 || allClosedTrades.length > 0) {
      recalculateStats();
    }
  }, [dateRange, recalculateStats, allActiveTrades.length, allClosedTrades.length]);

  if (isLoading) {
    return <StatsLoadingState />;
  }

  if (error) {
    return <StatsErrorState error={error} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex-1 w-full h-full space-y-6 p-6 bg-background overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Statistics</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your trading performance</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Overview Cards */}
      <StatsOverviewCards stats={stats} startingCapital={startingCapital} />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioPerformanceChart trades={filteredClosedTrades} startingCapital={startingCapital} isLoading={isLoading} />
        <TradePerformanceCard stats={stats} />
        <WinRateCard stats={stats} />
      </div>

      {/* R-Multiple Chart */}
      <RMultipleChart trades={filteredClosedTrades} isLoading={isLoading} />
    </div>
  );
}

export default Stats;