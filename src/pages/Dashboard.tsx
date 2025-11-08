import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { ActiveTradesTable } from '../components/ActiveTradesTable';
import { HistoricTradesTable } from '../components/HistoricTradesTable';
import { AddTradeDialog } from '../components/AddTradeDialog';
import { SellPartialDialog } from '../components/SellPartialDialog';
import { SellAllDialog } from '../components/SellAllDialog';
import { EditTransactionDialog } from '../components/EditTransactionDialog';
import tradesAPI from '../api/client';
import { useToast } from '../hooks/use-toast';
import { type DateRange } from 'react-day-picker';
import type { TradeMetrics, ClosedTradeMetrics, Transaction } from '../types';

interface DashboardProps {
  dateRange?: DateRange;
}

export function Dashboard({ dateRange }: DashboardProps) {
  const { toast } = useToast();
  const [allActiveTrades, setAllActiveTrades] = useState<TradeMetrics[]>([]);
  const [allClosedTrades, setAllClosedTrades] = useState<ClosedTradeMetrics[]>([]);
  const [filteredActiveTrades, setFilteredActiveTrades] = useState<TradeMetrics[]>([]);
  const [filteredClosedTrades, setFilteredClosedTrades] = useState<ClosedTradeMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeMetrics | null>(null);
  const [sellPartialOpen, setSellPartialOpen] = useState(false);
  const [sellAllOpen, setSellAllOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filterTradesByDateRange = (
    activeTrades: TradeMetrics[],
    closedTrades: ClosedTradeMetrics[],
    range: DateRange | undefined
  ): { filteredActive: TradeMetrics[], filteredClosed: ClosedTradeMetrics[] } => {
    if (!range || !range.from) {
      return { filteredActive: activeTrades, filteredClosed: closedTrades };
    }

    const fromDate = new Date(range.from);
    const toDate = range.to ? new Date(range.to) : new Date();

    // For active trades, we filter by the earliest transaction date
    const filteredActive = activeTrades.filter(trade => {
      const earliestTransaction = trade.transactions.reduce((earliest, transaction) =>
        new Date(transaction.transaction_date) < new Date(earliest.transaction_date) ? transaction : earliest
      );
      const tradeDate = new Date(earliestTransaction.transaction_date);
      return tradeDate >= fromDate && tradeDate <= toDate;
    });

    // For closed trades, we filter by the exit date
    const filteredClosed = closedTrades.filter(trade => {
      const tradeDate = new Date(trade.exitDate);
      return tradeDate >= fromDate && tradeDate <= toDate;
    });

    return { filteredActive, filteredClosed };
  };

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [active, closed] = await Promise.all([tradesAPI.getActiveTrades(), tradesAPI.getClosedTrades()]);
      setAllActiveTrades(active);
      setAllClosedTrades(closed);

      const { filteredActive, filteredClosed } = filterTradesByDateRange(active, closed, dateRange);
      setFilteredActiveTrades(filteredActive);
      setFilteredClosedTrades(filteredClosed);
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

  useEffect(() => {
    if (allActiveTrades.length > 0 || allClosedTrades.length > 0) {
      const { filteredActive, filteredClosed } = filterTradesByDateRange(allActiveTrades, allClosedTrades, dateRange);
      setFilteredActiveTrades(filteredActive);
      setFilteredClosedTrades(filteredClosed);
    }
  }, [dateRange, allActiveTrades, allClosedTrades]);

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
      {/* Header with Add Trade Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Trades</h1>
          <p className="text-muted-foreground">Manage your trading positions and history</p>
        </div>
        <Button onClick={() => setAddTradeOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

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
              trades={filteredActiveTrades}
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
              trades={filteredClosedTrades}
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
