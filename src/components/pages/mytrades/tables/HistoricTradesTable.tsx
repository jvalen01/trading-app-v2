import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { TradeTableCore } from './components/TradeTableCore';
import { DeleteTradeDialog } from '@/components/common/DeleteTradeDialog';
import { format } from 'date-fns';
import type { ClosedTradeMetrics, Transaction } from '@/types';

interface HistoricTradesTableProps {
  trades: ClosedTradeMetrics[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTrade: (tradeId: number) => void;
}

export function HistoricTradesTable({
  trades,
  onEditTransaction,
  onDeleteTrade,
}: HistoricTradesTableProps) {
  const columns = useMemo<ColumnDef<ClosedTradeMetrics>[]>(
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
        accessorKey: 'totalBought',
        header: 'Qty Traded',
        size: 110,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">{row.original.totalBought.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'averageBuyPrice',
        header: 'Avg Buy Price',
        size: 120,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.averageBuyPrice.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'averageExitPrice',
        header: 'Avg Sell Price',
        size: 130,
        enableResizing: true,
        cell: ({ row }) => <div className="text-right">${row.original.averageExitPrice.toFixed(2)}</div>,
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'realizedPL',
        header: 'P&L',
        size: 120,
        enableResizing: true,
        cell: ({ row }) => (
          <Badge className={row.original.realizedPL >= 0 ? 'bg-success text-success-foreground' : 'bg-danger text-danger-foreground'}>
            ${row.original.realizedPL.toFixed(2)}
          </Badge>
        ),
        filterFn: 'inNumberRange',
      },
      {
        id: 'returnPercentage',
        header: 'Return %',
        size: 100,
        enableResizing: true,
        accessorFn: (row) => row.pnlPercentage ?? row.returnPercentage ?? 0,
        cell: ({ row }) => {
          const returnPct = row.original.pnlPercentage ?? row.original.returnPercentage ?? 0;
          return (
            <Badge className={returnPct >= 0 ? 'bg-success text-success-foreground' : 'bg-danger text-danger-foreground'}>
              {returnPct > 0 ? '+' : ''}{returnPct.toFixed(2)}%
            </Badge>
          );
        },
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'accountValueAtEntry',
        header: 'Account @ Entry',
        size: 140,
        enableResizing: true,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.accountValueAtEntry ? `$${row.original.accountValueAtEntry.toFixed(0)}` : '-'}
          </div>
        ),
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'rMultiple',
        header: 'R-Multiple',
        size: 110,
        enableResizing: true,
        cell: ({ row }) => (
          <div className={`font-semibold ${row.original.rMultiple !== undefined && row.original.rMultiple >= 0 ? 'text-success' : 'text-danger'}`}>
            {row.original.rMultiple !== undefined ? `${row.original.rMultiple >= 0 ? '+' : ''}${(row.original.rMultiple * 100).toFixed(2)}%` : '-'}
          </div>
        ),
        filterFn: 'inNumberRange',
      },
      {
        accessorKey: 'entryDate',
        header: 'Entry Date',
        size: 120,
        enableResizing: true,
        accessorFn: (row) => new Date(row.entryDate).getTime(),
        cell: ({ row }) => <div>{format(new Date(row.original.entryDate), 'MMM dd, yyyy')}</div>,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'exitDate',
        header: 'Exit Date',
        size: 120,
        enableResizing: true,
        accessorFn: (row) => new Date(row.exitDate).getTime(),
        cell: ({ row }) => <div>{format(new Date(row.original.exitDate), 'MMM dd, yyyy')}</div>,
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
        size: 100,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="text-right">
            <DeleteTradeDialog trade={row.original} onDelete={onDeleteTrade} />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onDeleteTrade]
  );

  return (
    <TradeTableCore
      data={trades}
      columns={columns}
      onEditTransaction={onEditTransaction}
      emptyMessage="No closed trades yet."
      itemName="closed trades"
    />
  );
}