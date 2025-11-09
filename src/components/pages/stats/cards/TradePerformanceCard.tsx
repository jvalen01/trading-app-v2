import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TradeStats } from '../types';

interface TradePerformanceCardProps {
  stats: TradeStats;
}

export function TradePerformanceCard({ stats }: TradePerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Performance</CardTitle>
        <CardDescription>Best and worst performing trades</CardDescription>
      </CardHeader>
      <CardContent className="">
        {stats.bestTrade && (
          <div className="flex items-center justify-between bg-success/10 rounded-lg">
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
        <hr />

        {stats.worstTrade && (
          <div className="flex items-center justify-between bg-destructive/10 rounded-lg">
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
            <span className="font-bold">{stats.averageTradeSizePercentage.toFixed(2)}%</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Biggest Winning Streak</span>
            <span className="font-bold text-success">{stats.biggestWinStreak} trades</span>
          </div>
          <hr />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Biggest Losing Streak</span>
            <span className="font-bold text-destructive">{stats.biggestLossStreak} trades</span>
          </div>
          <hr />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Biggest Drawdown</span>
            <span className="font-bold text-destructive">{Math.abs(stats.biggestDrawdownPercentage).toFixed(2)}%</span>
          </div>
          <hr />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Average Drawdown</span>
            <span className="font-bold text-destructive">{Math.abs(stats.averageDrawdownPercentage).toFixed(2)}%</span>
          </div>
          <hr />
        </div>
      </CardContent>
    </Card>
  );
}