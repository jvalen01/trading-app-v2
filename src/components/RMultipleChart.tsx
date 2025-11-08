import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { ClosedTradeMetrics } from '@/types';

interface RMultipleChartProps {
  trades: ClosedTradeMetrics[];
  isLoading?: boolean;
}

export function RMultipleChart({ trades, isLoading }: RMultipleChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">R-Multiple Distribution</CardTitle>
          <CardDescription>Impact of each trade on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  const closedTrades = trades.filter(t => t.rMultiple !== undefined);

  if (closedTrades.length === 0) {
    return (
      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">R-Multiple Distribution</CardTitle>
          <CardDescription>Impact of each trade on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No closed trades available to display R-multiple distribution.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const rMultiples = closedTrades.map(t => t.rMultiple ?? 0);
  const maxR = Math.max(...rMultiples, 0);
  const minR = Math.min(...rMultiples, 0);
  const chartHeight = 300;
  const chartPadding = 40;
  const chartWidth = Math.max(600, closedTrades.length * 40 + 100);
  
  // Calculate scales
  const maxAbsR = Math.max(Math.abs(maxR), Math.abs(minR));
  const yScale = (chartHeight - chartPadding * 2) / (maxAbsR * 2);
  const centerY = chartHeight / 2;
  const barWidth = Math.max(20, (chartWidth - chartPadding * 2) / closedTrades.length * 0.8);
  const barSpacing = (chartWidth - chartPadding * 2) / closedTrades.length;

  // Sort trades by entry date for consistent ordering
  const sortedTrades = [...closedTrades].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-card-foreground">R-Multiple Distribution</CardTitle>
        <CardDescription>Impact of each trade on your account (in % of account value at entry)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-full">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
                <path d={`M 50 0 L 0 0 0 25`} fill="none" stroke="rgba(100,100,100,0.1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

            {/* Zero line */}
            <line
              x1={chartPadding}
              y1={centerY}
              x2={chartWidth - chartPadding}
              y2={centerY}
              stroke="rgba(100,100,100,0.3)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Y-axis labels */}
            <text x={chartPadding - 10} y={centerY + 5} fontSize="12" textAnchor="end" fill="rgba(100,100,100,0.7)">
              0%
            </text>
            {maxAbsR > 0 && (
              <>
                <text
                  x={chartPadding - 10}
                  y={chartPadding + 5}
                  fontSize="12"
                  textAnchor="end"
                  fill="rgba(100,100,100,0.7)"
                >
                  +{(maxAbsR * 100).toFixed(0)}%
                </text>
                <text
                  x={chartPadding - 10}
                  y={chartHeight - chartPadding + 5}
                  fontSize="12"
                  textAnchor="end"
                  fill="rgba(100,100,100,0.7)"
                >
                  -{(maxAbsR * 100).toFixed(0)}%
                </text>
              </>
            )}

            {/* Bars */}
            {sortedTrades.map((trade, index) => {
              const rMultiple = trade.rMultiple ?? 0;
              const barHeight = Math.abs(rMultiple) * yScale;
              const isPositive = rMultiple >= 0;
              const x = chartPadding + index * barSpacing + (barSpacing - barWidth) / 2;
              const y = isPositive ? centerY - barHeight : centerY;
              const fillColor = isPositive ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'; // green/red

              return (
                <g key={trade.id}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={fillColor}
                    opacity="0.8"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <title>
                      {trade.ticker}: {rMultiple >= 0 ? '+' : ''}{(rMultiple * 100).toFixed(2)}%
                      {'\n'}Entry: ${trade.accountValueAtEntry?.toFixed(0)}
                      {'\n'}P&L: ${trade.realizedPL.toFixed(2)}
                    </title>
                  </rect>
                  {/* Trade number label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - chartPadding + 20}
                    fontSize="11"
                    textAnchor="middle"
                    fill="rgba(100,100,100,0.7)"
                  >
                    {trade.ticker}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend and Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-card-foreground">Statistics</h4>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Highest R:</span>
                <span className="font-semibold text-success">{(maxR * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lowest R:</span>
                <span className="font-semibold text-danger">{(minR * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average R:</span>
                <span className="font-semibold">
                  {(rMultiples.reduce((a, b) => a + b) / rMultiples.length * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-card-foreground">Trade Count</h4>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winning Trades:</span>
                <span className="font-semibold text-success">
                  {rMultiples.filter(r => r > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Losing Trades:</span>
                <span className="font-semibold text-danger">
                  {rMultiples.filter(r => r < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Trades:</span>
                <span className="font-semibold">{rMultiples.length}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
