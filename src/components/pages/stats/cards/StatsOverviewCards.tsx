import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import type { TradeStats } from '../types';

interface StatsOverviewCardsProps {
  stats: TradeStats;
  startingCapital: number;
}

export function StatsOverviewCards({ stats, startingCapital }: StatsOverviewCardsProps) {
  return (
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
          <CardTitle className="text-sm font-medium">P&L</CardTitle>
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
  );
}