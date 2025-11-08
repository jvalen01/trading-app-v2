import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tradesAPI, { capitalAPI } from '@/api/client';
import type {
  AddTradeRequest,
  SellPartialRequest,
  SellAllRequest,
  UpdateTransactionRequest,
} from '@/types';

// Query keys for consistent cache management
export const queryKeys = {
  activeTrades: ['trades', 'active'] as const,
  closedTrades: ['trades', 'closed'] as const,
  closedTradesWithRMetrics: (startingCapital: number) => ['trades', 'closed', 'rmetrics', startingCapital] as const,
  tradeTransactions: (tradeId: number) => ['trades', tradeId, 'transactions'] as const,
  capitalSettings: ['capital', 'settings'] as const,
  capitalAdjustments: ['capital', 'adjustments'] as const,
  capitalSummary: (startingCapital?: number) => ['capital', 'summary', startingCapital] as const,
};

// Active trades hooks
export const useActiveTrades = () => {
  return useQuery({
    queryKey: queryKeys.activeTrades,
    queryFn: tradesAPI.getActiveTrades,
  });
};

// Closed trades hooks
export const useClosedTrades = () => {
  return useQuery({
    queryKey: queryKeys.closedTrades,
    queryFn: tradesAPI.getClosedTrades,
  });
};

export const useClosedTradesWithRMetrics = (startingCapital: number = 10000) => {
  return useQuery({
    queryKey: queryKeys.closedTradesWithRMetrics(startingCapital),
    queryFn: () => tradesAPI.getClosedTradesWithRMetrics(startingCapital),
  });
};

// Trade transactions hook
export const useTradeTransactions = (tradeId: number) => {
  return useQuery({
    queryKey: queryKeys.tradeTransactions(tradeId),
    queryFn: () => tradesAPI.getTradeTransactions(tradeId),
    enabled: !!tradeId,
  });
};

// Capital hooks
export const useCapitalSettings = () => {
  return useQuery({
    queryKey: queryKeys.capitalSettings,
    queryFn: capitalAPI.getSettings,
  });
};

export const useCapitalAdjustments = () => {
  return useQuery({
    queryKey: queryKeys.capitalAdjustments,
    queryFn: capitalAPI.getAdjustments,
  });
};

export const useCapitalSummary = (startingCapital?: number) => {
  return useQuery({
    queryKey: queryKeys.capitalSummary(startingCapital),
    queryFn: () => capitalAPI.getSummary(startingCapital),
    enabled: startingCapital !== undefined,
  });
};

// Mutation hooks for data modifications
export const useBuyTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddTradeRequest) => tradesAPI.buyTrade(payload),
    onSuccess: () => {
      // Invalidate and refetch active trades
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      // Also invalidate closed trades in case of any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

export const useSellPartial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, payload }: { tradeId: number; payload: SellPartialRequest }) =>
      tradesAPI.sellPartial(tradeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

export const useSellAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, payload }: { tradeId: number; payload: SellAllRequest }) =>
      tradesAPI.sellAll(tradeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, payload }: { transactionId: number; payload: UpdateTransactionRequest }) =>
      tradesAPI.updateTransaction(transactionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: number) => tradesAPI.deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

export const useDeleteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: number) => tradesAPI.deleteTrade(tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTrades });
      queryClient.invalidateQueries({ queryKey: queryKeys.closedTrades });
    },
  });
};

// Capital mutations
export const useSetStartingCapital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (startingCapital: number) => capitalAPI.setStartingCapital(startingCapital),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.capitalSettings });
    },
  });
};

export const useAddCapitalAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason?: string }) =>
      capitalAPI.addAdjustment(amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital', 'adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['capital', 'summary'] });
    },
  });
};

export const useDeleteCapitalAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => capitalAPI.deleteAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital', 'adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['capital', 'summary'] });
    },
  });
};