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

        {/* Best Combinations */}
        <hr />
        <div>
          <h4 className="font-medium text-sm mb-2">Top Performing Combinations</h4>
          {stats.bestCombinations.length > 0 ? (
            <div className="space-y-2">
              {stats.bestCombinations.map((combo, index) => (
                <div key={`${combo.tradeType}-${combo.ncfdRange}-${combo.timeOfEntry}`} className="p-3 rounded bg-muted/20 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">Best Combination</span>
                    </div>
                    <Badge
                      variant={combo.winRate >= 60 ? "default" : combo.winRate >= 40 ? "secondary" : "destructive"}
                      className={`text-xs px-1.5 py-0.5 ${combo.winRate >= 60 ? "bg-success text-success-foreground" : ""}`}
                    >
                      {combo.winRate.toFixed(0)}% Win Rate
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium">{combo.tradeType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">NCFD:</span>
                      <div className="font-medium">{combo.ncfdRange}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Entry:</span>
                      <div className="font-medium">{combo.timeOfEntry}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {combo.winningTrades}/{combo.totalTrades} winning trades
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4 text-sm">
              Need more trading data to analyze combinations (minimum 10 combinations with 2+ trades each)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}