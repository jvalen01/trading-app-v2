import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ActiveTradesTable } from '../components/ActiveTradesTable';
import { HistoricTradesTable } from '../components/HistoricTradesTable';
import { AddTradeDialog } from '../components/AddTradeDialog';
import { SellPartialDialog } from '../components/SellPartialDialog';
import { SellAllDialog } from '../components/SellAllDialog';
import { EditTransactionDialog } from '../components/EditTransactionDialog';
import tradesAPI from '../api/client';
import { useToast } from '../hooks/use-toast';
import type { TradeMetrics, ClosedTradeMetrics, Transaction } from '../types';

export function Dashboard() {
  const { toast } = useToast();
  const [activeTrades, setActiveTrades] = useState<TradeMetrics[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTradeMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeMetrics | null>(null);
  const [sellPartialOpen, setSellPartialOpen] = useState(false);
  const [sellAllOpen, setSellAllOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [active, closed] = await Promise.all([tradesAPI.getActiveTrades(), tradesAPI.getClosedTrades()]);
      setActiveTrades(active);
      setClosedTrades(closed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trades';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuyMore = (trade: TradeMetrics) => {
    setSelectedTrade(trade);
    setAddTradeOpen(true);
  };

  const handleSellPartial = (trade: TradeMetrics) => {
    setSelectedTrade(trade);
    setSellPartialOpen(true);
  };

  const handleSellAll = (trade: TradeMetrics) => {
    setSelectedTrade(trade);
    setSellAllOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditTransactionOpen(true);
  };

  const handleDeleteTrade = async (tradeId: number) => {
    try {
      await tradesAPI.deleteTrade(tradeId);
      toast({
        title: 'Success',
        description: 'Trade deleted successfully',
      });
      fetchTrades();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete trade';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 w-full h-full space-y-4 p-6 bg-background overflow-y-auto">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Trades Section */}
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
              trades={activeTrades}
              onBuyMore={handleBuyMore}
              onSellPartial={handleSellPartial}
              onSellAll={handleSellAll}
              onEditTransaction={handleEditTransaction}
            />
          )}
        </CardContent>
      </Card>

      {/* Historic Trades Section */}
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
              trades={closedTrades}
              onEditTransaction={handleEditTransaction}
              onDeleteTrade={handleDeleteTrade}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTradeDialog open={addTradeOpen} onOpenChange={setAddTradeOpen} onSuccess={fetchTrades} />
      <SellPartialDialog open={sellPartialOpen} onOpenChange={setSellPartialOpen} trade={selectedTrade} onSuccess={fetchTrades} />
      <SellAllDialog open={sellAllOpen} onOpenChange={setSellAllOpen} trade={selectedTrade} onSuccess={fetchTrades} />
      <EditTransactionDialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen} transaction={selectedTransaction} onSuccess={fetchTrades} />
    </div>
  );
}
