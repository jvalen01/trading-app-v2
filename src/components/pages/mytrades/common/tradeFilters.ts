import type { DateRange } from 'react-day-picker';
import type { TradeMetrics, ClosedTradeMetrics } from '@/types';
import type { TradeFilters } from '../types';

export function filterTradesByDateRange(
  activeTrades: TradeMetrics[],
  closedTrades: ClosedTradeMetrics[],
  range: DateRange | undefined
): TradeFilters {
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
}