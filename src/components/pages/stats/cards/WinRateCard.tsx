import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TradeStats } from '../types';

interface WinRateCardProps {
  stats: TradeStats;
}

export function WinRateCard({ stats }: WinRateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Win Rates</CardTitle>
        <CardDescription className="text-sm">Win rates by trade type, NCFD & time of entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trade Types - Horizontal Layout */}
        <div>
          <h4 className="font-medium text-sm mb-2">By Trade Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.winRateByTradeType)
              .sort(([, a], [, b]) => b.winRate - a.winRate)
              .map(([type, data]) => (
              <div key={type} className="flex justify-between items-center p-2 rounded bg-muted/20">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{type}</div>
                  <div className="text-xs text-muted-foreground">{data.totalTrades} trades</div>
                </div>
                <div className="text-right ml-2">
                  <Badge
                    variant={data.winRate >= 60 ? "default" : data.winRate >= 40 ? "secondary" : "destructive"}
                    className={`text-xs px-1.5 py-0.5 ${data.winRate >= 60 ? "bg-success text-success-foreground" : ""}`}
                  >
                    {data.winRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NCFD Ranges - Grid Layout */}
        <hr />
        <div>
          <h4 className="font-medium text-sm mb-2">By NCFD Range</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.winRateByNCFD)
              .sort(([, a], [, b]) => b.winRate - a.winRate)
              .map(([range, data]) => (
              <div key={range} className="flex justify-between items-center p-2 rounded bg-muted/20">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">NCFD {range}</div>
                  <div className="text-xs text-muted-foreground">{data.totalTrades} trades</div>
                </div>
                <div className="text-right ml-2">
                  <Badge
                    variant={data.winRate >= 60 ? "default" : data.winRate >= 40 ? "secondary" : "destructive"}
                    className={`text-xs px-1.5 py-0.5 ${data.winRate >= 60 ? "bg-success text-success-foreground" : ""}`}
                  >
                    {data.winRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time of Entry - Grid Layout */}
        <hr />
        <div>
          <h4 className="font-medium text-sm mb-2">By Time of Entry</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.winRateByTimeOfEntry)
              .sort(([, a], [, b]) => b.winRate - a.winRate)
              .map(([timeOfEntry, data]) => (
              <div key={timeOfEntry} className="flex justify-between items-center p-2 rounded bg-muted/20">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">{timeOfEntry}</div>
                  <div className="text-xs text-muted-foreground">{data.totalTrades} trades</div>
                </div>
                <div className="text-right ml-2">
                  <Badge
                    variant={data.winRate >= 60 ? "default" : data.winRate >= 40 ? "secondary" : "destructive"}
                    className={`text-xs px-1.5 py-0.5 ${data.winRate >= 60 ? "bg-success text-success-foreground" : ""}`}
                  >
                    {data.winRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}