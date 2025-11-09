import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TradeStats } from '../types';

interface TradePerformanceCardProps {
  stats: TradeStats;
}

export function TradePerformanceCard({ stats }: TradePerformanceCardProps) {
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Trade Performance
          <Badge variant="secondary" className="text-xs">
            {stats.closedTrades} trades
          </Badge>
        </CardTitle>
        <CardDescription>Detailed analysis of your trading performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best and Worst Trades */}
        <div className="grid grid-cols-1 gap-4">
          {stats.bestTrade && (
            <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div>
                  <p className="font-semibold text-success">Best Trade</p>
                  <p className="text-sm text-muted-foreground">{stats.bestTrade.ticker}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-success text-lg">+${stats.bestTrade.realizedPL.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{(stats.bestTrade.pnlPercentage ?? stats.bestTrade.returnPercentage ?? 0).toFixed(2)}%</p>
              </div>
            </div>
          )}

          {stats.worstTrade && (
            <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <div>
                  <p className="font-semibold text-destructive">Worst Trade</p>
                  <p className="text-sm text-muted-foreground">{stats.worstTrade.ticker}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-destructive text-lg">${stats.worstTrade.realizedPL.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{(stats.worstTrade.pnlPercentage ?? stats.worstTrade.returnPercentage ?? 0).toFixed(2)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Monthly Performance</h4>
          <div className="grid grid-cols-1 gap-3">
            {stats.bestMonth && (
              <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div>
                    <p className="font-medium text-success">Best Month</p>
                    <p className="text-sm text-muted-foreground">{formatMonth(stats.bestMonth.month)}</p>
                  </div>
                </div>
                <p className="font-bold text-success">{stats.bestMonth.performance.toFixed(2)}%</p>
              </div>
            )}

            {stats.worstMonth && (
              <div className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <div>
                    <p className="font-medium text-destructive">Worst Month</p>
                    <p className="text-sm text-muted-foreground">{formatMonth(stats.worstMonth.month)}</p>
                  </div>
                </div>
                <p className="font-bold text-destructive">{stats.worstMonth.performance.toFixed(2)}%</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <p className="font-medium">Average Month</p>
              </div>
              <p className="font-bold">{stats.averageMonthPerformance.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Trading Statistics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trading Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-success">{stats.biggestWinStreak}</p>
              <p className="text-xs text-muted-foreground">Best Win Streak</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-destructive">{stats.biggestLossStreak}</p>
              <p className="text-xs text-muted-foreground">Worst Loss Streak</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-destructive">{Math.abs(stats.biggestDrawdownPercentage).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Max Drawdown</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{stats.averageTradeSizePercentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg Trade Size</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}