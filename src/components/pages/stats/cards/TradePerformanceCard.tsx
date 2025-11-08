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
  );
}