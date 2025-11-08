import type { DateRange } from 'react-day-picker';
import type { TradeMetrics, ClosedTradeMetrics } from '@/types';

export type MyTradesProps = {
  dateRange?: DateRange;
  startingCapital: number;
};

export type TradeFilters = {
  filteredActive: TradeMetrics[];
  filteredClosed: ClosedTradeMetrics[];
};