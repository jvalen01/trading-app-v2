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
}

export function ActiveTradesTable({
  trades,
  onBuyMore,
  onSellPartial,
  onSellAll,
  onEditTransaction,
}: ActiveTradesTableProps) {
  const columns = useMemo<ColumnDef<TradeMetrics>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        size: 40,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false,
      },
      {
        accessorKey: 'ticker',
        header: 'Ticker',
        size: 120,
        enableResizing: true,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.ticker}</span>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'currentQuantity',
        header: 'Quantity',
        size: 100,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">{row.original.currentQuantity.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'averageBuyPrice',
        header: 'Avg Price',
        size: 100,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.averageBuyPrice.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        size: 120,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.totalCost.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        id: 'entryDate',
        header: 'Entry Date',
        size: 120,
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
        size: 80,
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
        id: 'actions',
        header: 'Actions',
        size: 100,
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

  const getColumnVisibilityConfig = () => [
    { id: 'expander', label: 'Expand', visible: true, canHide: false },
    { id: 'ticker', label: 'Ticker', visible: true, canHide: false },
    { id: 'currentQuantity', label: 'Quantity', visible: true, canHide: true },
    { id: 'averageBuyPrice', label: 'Avg Price', visible: true, canHide: true },
    { id: 'totalCost', label: 'Total Cost', visible: true, canHide: true },
    { id: 'entryDate', label: 'Entry Date', visible: true, canHide: true },
    { id: 'trade_rating', label: 'Rating', visible: true, canHide: true },
    { id: 'trade_type', label: 'Type', visible: true, canHide: true },
    { id: 'ncfd', label: 'NCFD', visible: true, canHide: true },
    { id: 'actions', label: 'Actions', visible: true, canHide: false },
  ];

  return (
    <TradeTableCore
      data={trades}
      columns={columns}
      onEditTransaction={onEditTransaction}
      emptyMessage="No active trades. Start by adding a new trade."
      itemName="active trades"
      getColumnVisibilityConfig={getColumnVisibilityConfig}
    />
  );
}
