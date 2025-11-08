import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  type ColumnSizingState,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionsTable } from '../TransactionsTable';
import { TableFilters, TableColumnVisibility } from './TableFilters';
import { TablePagination } from './TablePagination';
import type { Transaction } from '@/types';

type BaseTrade = {
  id: number;
  ticker: string;
  transactions: Transaction[];
}

type TradeTableCoreProps<T extends BaseTrade> = {
  data: T[];
  columns: ColumnDef<T>[];
  onEditTransaction: (transaction: Transaction) => void;
  emptyMessage: string;
  itemName: string;
  getColumnVisibilityConfig: () => Array<{
    id: string;
    label: string;
    visible: boolean;
    canHide: boolean;
  }>;
}

export function TradeTableCore<T extends BaseTrade>({
  data,
  columns,
  onEditTransaction,
  emptyMessage,
  itemName,
  getColumnVisibilityConfig,
}: TradeTableCoreProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'entryDate', desc: true }]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const [tickerFilter, setTickerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Update filters when state changes
  const filters = useMemo(() => [
    { id: 'ticker', value: tickerFilter },
    { id: 'trade_type', value: typeFilter },
  ].filter(filter => filter.value), [tickerFilter, typeFilter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    state: {
      sorting,
      columnFilters: filters,
      expanded,
      columnVisibility,
      columnSizing,
    },
    initialState: {
      sorting: [{ id: 'entryDate', desc: true }],
      pagination: {
        pageSize: 10,
      },
    },
    columnResizeMode: 'onChange',
  });

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    table.getColumn(columnId)?.toggleVisibility(visible);
  };

  const columnVisibilityConfig = getColumnVisibilityConfig();

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <TableFilters
          tickerFilter={tickerFilter}
          onTickerFilterChange={setTickerFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <TableColumnVisibility
          columns={columnVisibilityConfig}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card/50">
        <Table className="table-fixed">
          <TableHeader className="bg-muted border-b-2 border-border shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/90">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-foreground font-semibold border-r border-border/50 last:border-r-0 relative h-12"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.getCanSort()
                        ? (
                          <div
                            onClick={() => header.column.toggleSorting(header.column.getIsSorted() === 'asc')}
                            className="flex items-center gap-2 cursor-pointer font-semibold text-foreground hover:text-foreground/80 transition-colors"
                          >
                            <span>{header.column.columnDef.header as string}</span>
                            {header.column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
                            {header.column.getIsSorted() === 'desc' && <ArrowDown className="h-4 w-4" />}
                            {header.column.getIsSorted() === false && <ArrowUpDown className="h-4 w-4" />}
                          </div>
                        )
                        : header.column.columnDef.header as string
                    }
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-0.5 cursor-col-resize select-none touch-none ${
                          header.column.getIsResizing() ? 'bg-primary' : 'bg-border hover:bg-primary/50'
                        }`}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    className="hover:bg-card/80 border-border"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r border-border/50 last:border-r-0"
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {cell.column.id === 'expander' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => row.toggleExpanded()}
                          >
                            {row.getIsExpanded() ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/30 p-0">
                        <Card className="m-4 border-0 shadow-none">
                          <CardContent className="pt-6">
                            <div className="mb-4">
                              <h4 className="font-semibold mb-4">Transaction History</h4>
                              <TransactionsTable
                                transactions={row.original.transactions}
                                onEdit={onEditTransaction}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} className="text-center text-muted-foreground py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalItems={table.getFilteredRowModel().rows.length}
          itemName={itemName}
          onPageChange={(page: number) => table.setPageIndex(page - 1)}
          onPageSizeChange={(pageSize: number) => table.setPageSize(pageSize)}
        />
      </div>
    </div>
  );
}