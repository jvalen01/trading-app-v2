import type { DateRange } from 'react-day-picker';
import type { TradeMetrics, ClosedTradeMetrics } from '@/types';

export interface MyTradesProps {
  dateRange?: DateRange;
  startingCapital: number;
}

export interface TradeFilters {
  filteredActive: TradeMetrics[];
  filteredClosed: ClosedTradeMetrics[];
}