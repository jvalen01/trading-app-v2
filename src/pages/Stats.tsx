import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { type DateRange } from 'react-day-picker';
import tradesAPI from '@/api/client';
import { RMultipleChart, PortfolioPerformanceChart, StatsOverviewCards, TradePerformanceCard, WinRateCard, StatsLoadingState, StatsErrorState } from '@/components/pages/stats';
import { calculatePortfolioStats, calculateWinRateStats, calculateCombinationStats, calculateStreakStats, calculateDrawdownStats, calculateMonthlyPerformanceStats } from '@/components/pages/stats/calculations';
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
  // Calculate portfolio statistics
  const portfolioStats = calculatePortfolioStats(activeTrades, closedTrades, startingCapital);

  // Calculate win rate statistics
  const winRateStats = calculateWinRateStats(closedTrades);

  // Calculate combination statistics
  const combinationStats = calculateCombinationStats(closedTrades);

  // Calculate streak statistics
  const streakStats = calculateStreakStats(closedTrades);

  // Calculate drawdown statistics
  const drawdownStats = calculateDrawdownStats(closedTrades, startingCapital);

  // Calculate monthly performance statistics
  const monthlyStats = calculateMonthlyPerformanceStats(closedTrades, startingCapital);

  return {
    ...portfolioStats,
    ...winRateStats,
    ...combinationStats,
    ...streakStats,
    ...drawdownStats,
    ...monthlyStats,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <PortfolioPerformanceChart trades={filteredClosedTrades} startingCapital={startingCapital} isLoading={isLoading} />
          <TradePerformanceCard stats={stats} />
        </div>
        <WinRateCard stats={stats} />
      </div>

      {/* R-Multiple Chart */}
      <RMultipleChart trades={filteredClosedTrades} isLoading={isLoading} />
    </div>
  );
}

export default Stats;