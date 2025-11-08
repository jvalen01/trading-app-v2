import axios from 'axios';
import type {
  TradeMetrics,
  ClosedTradeMetrics,
  AddTradeRequest,
  SellPartialRequest,
  SellAllRequest,
  UpdateTransactionRequest,
} from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Trades endpoints
export const tradesAPI = {
  // Get all active trades
  getActiveTrades: async (): Promise<TradeMetrics[]> => {
    const { data } = await api.get<TradeMetrics[]>('/trades/active');
    return data;
  },

  // Get all closed trades
  getClosedTrades: async (): Promise<ClosedTradeMetrics[]> => {
    const { data } = await api.get<ClosedTradeMetrics[]>('/trades/closed');
    return data;
  },

  // Get transactions for a specific trade
  getTradeTransactions: async (tradeId: number) => {
    const { data } = await api.get(`/trades/${tradeId}/transactions`);
    return data;
  },

  // Add a new trade (buy)
  buyTrade: async (payload: AddTradeRequest): Promise<TradeMetrics> => {
    const { data } = await api.post<TradeMetrics>('/trades/buy', payload);
    return data;
  },

  // Sell partial position
  sellPartial: async (tradeId: number, payload: SellPartialRequest): Promise<TradeMetrics> => {
    const { data } = await api.post<TradeMetrics>(`/trades/${tradeId}/sell-partial`, payload);
    return data;
  },

  // Sell entire position (close trade)
  sellAll: async (tradeId: number, payload: SellAllRequest): Promise<TradeMetrics> => {
    const { data } = await api.post<TradeMetrics>(`/trades/${tradeId}/sell-all`, payload);
    return data;
  },

  // Update a transaction
  updateTransaction: async (transactionId: number, payload: UpdateTransactionRequest) => {
    const { data } = await api.put(`/trades/transaction/${transactionId}`, payload);
    return data;
  },

  // Delete a transaction
  deleteTransaction: async (transactionId: number) => {
    const { data } = await api.delete(`/trades/transaction/${transactionId}`);
    return data;
  },

  // Delete a trade
  deleteTrade: async (tradeId: number) => {
    const { data } = await api.delete(`/trades/${tradeId}`);
    return data;
  },
};

export default tradesAPI;
