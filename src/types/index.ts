export type Trade = {
  id: number;
  ticker: string;
  status: 'active' | 'closed';
  trade_rating?: number; // 0-5 rating
  trade_type?: 'Breakout' | 'Short Pivot' | 'Parabolic Long' | 'Day Trade' | 'EP' | 'UnR';
  ncfd?: number; // Number input
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: number;
  trade_id: number;
  type: 'buy' | 'sell_partial' | 'sell_all';
  price: number;
  quantity: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
};

export type TradeMetrics = Trade & {
  currentQuantity: number;
  averageBuyPrice: number;
  totalCost: number;
  totalBought: number;
  totalSold: number;
  transactions: Transaction[];
};

export type ClosedTradeMetrics = TradeMetrics & {
  averageExitPrice: number;
  realizedPL: number;
  returnPercentage?: number; // For backward compatibility
  pnlPercentage?: number; // New field name
  entryDate: string;
  exitDate: string;
  accountValueAtEntry?: number;
  rMultiple?: number;
};

export type AddTradeRequest = {
  ticker: string;
  price: number;
  quantity: number;
  date: string;
  notes?: string;
  trade_rating?: number;
  trade_type?: 'Breakout' | 'Short Pivot' | 'Parabolic Long' | 'Day Trade' | 'EP' | 'UnR';
  ncfd?: number;
};

export type SellPartialRequest = {
  quantity: number;
  price: number;
  date: string;
  notes?: string;
};

export type SellAllRequest = {
  price: number;
  date: string;
  notes?: string;
};

export type UpdateTransactionRequest = {
  price: number;
  quantity: number;
  date: string;
  notes?: string;
};
