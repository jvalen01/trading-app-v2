import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import tradesAPI from '@/api/client';
import { RMultipleChart } from '@/components/RMultipleChart';
import type { TradeMetrics, ClosedTradeMetrics } from '@/types';

interface TradeStats {
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

export function Stats({ dateRange, startingCapital }: { dateRange: DateRange | undefined; startingCapital: number }) {
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allActiveTrades, setAllActiveTrades] = useState<TradeMetrics[]>([]);
  const [allClosedTrades, setAllClosedTrades] = useState<ClosedTradeMetrics[]>([]);

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

    return {
      totalTrades,
      activeTrades: activeTradesCount,
      closedTrades: closedTradesCount,
      totalPortfolioValue,
      totalRealizedPL,
      totalUnrealizedPL,
      winRate,
      averageTradeSize,
      bestTrade,
      worstTrade,
      tradesByType,
      tradesByRating,
      currentCapital,
      roiPercentage,
      capitalGrowth,
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
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full h-full p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.capitalGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${stats.currentCapital.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Starting: ${startingCapital.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            {stats.roiPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.roiPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
              {stats.roiPercentage >= 0 ? '+' : ''}{stats.roiPercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTrades} active, {stats.closedTrades} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPortfolioValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Active positions only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized P&L</CardTitle>
            {stats.totalRealizedPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalRealizedPL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${stats.totalRealizedPL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From closed trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Performance</CardTitle>
            <CardDescription>Best and worst performing trades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.bestTrade && (
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="font-medium text-success">Best Trade</p>
                  <p className="text-sm text-muted-foreground">{stats.bestTrade.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+${stats.bestTrade.realizedPL.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{(stats.bestTrade.pnlPercentage ?? stats.bestTrade.returnPercentage ?? 0).toFixed(2)}%</p>
                </div>
              </div>
            )}

            {stats.worstTrade && (
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="font-medium text-destructive">Worst Trade</p>
                  <p className="text-sm text-muted-foreground">{stats.worstTrade.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">${stats.worstTrade.realizedPL.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{(stats.worstTrade.pnlPercentage ?? stats.worstTrade.returnPercentage ?? 0).toFixed(2)}%</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Trade Size</span>
                <span className="font-bold">${stats.averageTradeSize.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Distribution</CardTitle>
            <CardDescription>Breakdown by type and rating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">By Trade Type</h4>
              <div className="space-y-2">
                {Object.entries(stats.tradesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(stats.tradesByRating).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">By Rating</h4>
                <div className="space-y-2">
                  {Object.entries(stats.tradesByRating)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([rating, count]) => (
                    <div key={rating} className="flex justify-between items-center">
                      <span className="text-sm">{rating}/5 ⭐</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* R-Multiple Chart */}
      <RMultipleChart trades={allClosedTrades} isLoading={isLoading} />
    </div>
  );
}