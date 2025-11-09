import { useState } from 'react';
import { MyTradesHeader, MyTradesErrorAlert, ActiveTradesSection, HistoricTradesSection, AddTradeDialog, SellPartialDialog, SellAllDialog, type MyTradesProps } from '../components/pages/mytrades';
import { EditTransactionDialog } from '../components/EditTransactionDialog';
import { DeleteTransactionDialog } from '../components/common/DeleteTransactionDialog';
import { useToast } from '../hooks/use-toast';
import { useActiveTrades, useClosedTradesWithRMetrics, useDeleteTrade, useDeleteTransaction } from '../hooks/use-trades';
import { type DateRange } from 'react-day-picker';
import type { TradeMetrics, ClosedTradeMetrics, Transaction } from '../types';

export function Mytrades({ dateRange, startingCapital }: MyTradesProps) {
  const { toast } = useToast();

  // React Query hooks for data fetching
  const { data: allActiveTrades = [], isLoading: isLoadingActive, error: activeError } = useActiveTrades();
  const { data: allClosedTrades = [], isLoading: isLoadingClosed, error: closedError } = useClosedTradesWithRMetrics(startingCapital);

  // Mutation hooks
  const deleteTradeMutation = useDeleteTrade();
  const deleteTransactionMutation = useDeleteTransaction();

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

  // Filter trades by date range (client-side filtering)
  const { filteredActive, filteredClosed } = filterTradesByDateRange(allActiveTrades, allClosedTrades, dateRange);

  // Combined loading and error states
  const isLoading = isLoadingActive || isLoadingClosed;
  const error = activeError || closedError;

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

  const handleDeleteTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteTransactionMutation.mutateAsync(selectedTransaction.id);
      setSelectedTransaction(null);
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTrade = async (tradeId: number) => {
    try {
      await deleteTradeMutation.mutateAsync(tradeId);
      toast({
        title: 'Success',
        description: 'Trade deleted successfully',
      });
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
      <MyTradesHeader onAddTrade={() => setAddTradeOpen(true)} />

      {error && <MyTradesErrorAlert error={error?.message || 'Failed to load trades'} />}

      {/* Active Trades Section */}
      <ActiveTradesSection
        trades={filteredActive}
        isLoading={isLoading}
        onBuyMore={handleBuyMore}
        onSellPartial={handleSellPartial}
        onSellAll={handleSellAll}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransactionDialog}
      />

      {/* Historic Trades Section */}
      <HistoricTradesSection
        trades={filteredClosed}
        isLoading={isLoading}
        onEditTransaction={handleEditTransaction}
        onDeleteTrade={handleDeleteTrade}
      />

      {/* Dialogs */}
      <AddTradeDialog open={addTradeOpen} onOpenChange={setAddTradeOpen} />
      <SellPartialDialog open={sellPartialOpen} onOpenChange={setSellPartialOpen} trade={selectedTrade} />
      <SellAllDialog open={sellAllOpen} onOpenChange={setSellAllOpen} trade={selectedTrade} />
      <EditTransactionDialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen} transaction={selectedTransaction} />
      {selectedTransaction && (
        <DeleteTransactionDialog
          transaction={selectedTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}

export default Mytrades;
