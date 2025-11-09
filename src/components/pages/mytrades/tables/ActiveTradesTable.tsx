import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TradeTableCore } from './components/TradeTableCore';
import { format } from 'date-fns';
import type { TradeMetrics, Transaction } from '@/types';

interface ActiveTradesTableProps {
  trades: TradeMetrics[];
  onBuyMore: (trade: TradeMetrics) => void;
  onSellPartial: (trade: TradeMetrics) => void;
  onSellAll: (trade: TradeMetrics) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

export function ActiveTradesTable({
  trades,
  onBuyMore,
  onSellPartial,
  onSellAll,
  onEditTransaction,
  onDeleteTransaction,
}: ActiveTradesTableProps) {
  const columns = useMemo<ColumnDef<TradeMetrics>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        size: 20,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false,
      },
      {
        accessorKey: 'ticker',
        header: 'Ticker',
        size: 50,
        enableResizing: true,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.ticker}</span>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'currentQuantity',
        header: 'Quantity',
        size: 50,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">{row.original.currentQuantity.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'averageBuyPrice',
        header: 'Avg Price',
        size: 50,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.averageBuyPrice.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        size: 50,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.totalCost.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        id: 'entryDate',
        header: 'Entry Date',
        size: 70,
        enableResizing: true,
        accessorFn: (row) => row.transactions.length > 0 ? new Date(row.transactions[0].transaction_date).getTime() : 0,
        cell: ({ row }) => (
          <div>
            {row.original.transactions.length > 0
              ? format(new Date(row.original.transactions[0].transaction_date), 'MMM dd, yyyy')
              : '-'
            }
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'trade_rating',
        header: 'Rating',
        size: 60,
        enableResizing: true,
        cell: ({ row }) => (
          <div>
            {row.original.trade_rating !== undefined ? (
              <Badge variant="outline">{row.original.trade_rating}</Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'trade_type',
        header: 'Type',
        size: 80,
        enableResizing: true,
        cell: ({ row }) => (
          <div>
            {row.original.trade_type ? (
              <Badge variant="secondary">{row.original.trade_type}</Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'ncfd',
        header: 'NCFD',
        size: 80,
        enableResizing: true,
        cell: ({ row }) => (
          <div>
            {row.original.ncfd !== undefined ? (
              row.original.ncfd.toFixed(2)
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'time_of_entry',
        header: 'Time of Entry',
        size: 80,
        enableResizing: true,
        cell: ({ row }) => (
          <div>
            {row.original.time_of_entry ? (
              <Badge variant="outline">{row.original.time_of_entry}</Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 60,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  ⋯
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBuyMore(row.original)}>Buy More</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSellPartial(row.original)}>Sell Partial</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSellAll(row.original)} className="text-destructive">
                  Close Position
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onBuyMore, onSellPartial, onSellAll]
  );

  return (
    <TradeTableCore
      data={trades}
      columns={columns}
      onEditTransaction={onEditTransaction}
      onDeleteTransaction={onDeleteTransaction}
      emptyMessage="No active trades. Start by adding a new trade."
      itemName="active trades"
    />
  );
}
