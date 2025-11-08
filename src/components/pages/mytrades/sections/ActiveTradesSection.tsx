import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActiveTradesTable } from '../tables';
import type { TradeMetrics, Transaction } from '@/types';

interface ActiveTradesSectionProps {
  trades: TradeMetrics[];
  isLoading: boolean;
  onBuyMore: (trade: TradeMetrics) => void;
  onSellPartial: (trade: TradeMetrics) => void;
  onSellAll: (trade: TradeMetrics) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export function ActiveTradesSection({
  trades,
  isLoading,
  onBuyMore,
  onSellPartial,
  onSellAll,
  onEditTransaction,
}: ActiveTradesSectionProps) {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-card-foreground">Active Trades</CardTitle>
        <CardDescription>Your open positions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading trades...</div>
        ) : (
          <ActiveTradesTable
            trades={trades}
            onBuyMore={onBuyMore}
            onSellPartial={onSellPartial}
            onSellAll={onSellAll}
            onEditTransaction={onEditTransaction}
          />
        )}
      </CardContent>
    </Card>
  );
}