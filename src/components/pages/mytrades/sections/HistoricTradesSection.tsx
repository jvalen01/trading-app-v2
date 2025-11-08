import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricTradesTable } from '../tables';
import type { ClosedTradeMetrics, Transaction } from '@/types';

interface HistoricTradesSectionProps {
  trades: ClosedTradeMetrics[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTrade: (tradeId: number) => void;
}

export function HistoricTradesSection({
  trades,
  isLoading,
  onEditTransaction,
  onDeleteTrade,
}: HistoricTradesSectionProps) {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-card-foreground">Closed Trades</CardTitle>
        <CardDescription>Your completed positions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading trades...</div>
        ) : (
          <HistoricTradesTable
            trades={trades}
            onEditTransaction={onEditTransaction}
            onDeleteTrade={onDeleteTrade}
          />
        )}
      </CardContent>
    </Card>
  );
}