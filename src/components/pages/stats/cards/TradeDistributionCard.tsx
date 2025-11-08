import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TradeStats } from '../types';

interface TradeDistributionCardProps {
  stats: TradeStats;
}

export function TradeDistributionCard({ stats }: TradeDistributionCardProps) {
  return (
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
                <Badge variant="secondary">{count as number}</Badge>
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
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}