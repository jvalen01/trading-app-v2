import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionsTable } from './TransactionsTable';
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (tradeId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(tradeId)) {
      newExpanded.delete(tradeId);
    } else {
      newExpanded.add(tradeId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-0 border border-border rounded-lg overflow-hidden bg-card/50">
      <Table>
        <TableHeader className="bg-card/80 border-b border-border">
          <TableRow className="hover:bg-card/80">
            <TableHead className="w-8 text-card-foreground"></TableHead>
            <TableHead className="text-card-foreground">Ticker</TableHead>
            <TableHead className="text-right text-card-foreground">Quantity</TableHead>
            <TableHead className="text-right text-card-foreground">Avg Price</TableHead>
            <TableHead className="text-right text-card-foreground">Total Cost</TableHead>
            <TableHead className="text-card-foreground">Entry Date</TableHead>
            <TableHead className="text-card-foreground">Rating</TableHead>
            <TableHead className="text-card-foreground">Type</TableHead>
            <TableHead className="text-card-foreground">NCFD</TableHead>
            <TableHead className="text-card-foreground">Unrealized P&L</TableHead>
            <TableHead className="text-right text-card-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow className="hover:bg-card/80">
              <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                No active trades. Start by adding a new trade.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <>
                <TableRow key={trade.id} className="hover:bg-card/80 border-border">
                  <TableCell className="w-8">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(trade.id)}
                    >
                      {expandedRows.has(trade.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.ticker}</span>
                      <Badge variant="outline">ACTIVE</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{trade.currentQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.averageBuyPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.totalCost.toFixed(2)}</TableCell>
                  <TableCell>{trade.transactions.length > 0 ? format(new Date(trade.transactions[0].transaction_date), 'MMM dd, yyyy') : '-'}</TableCell>
                  <TableCell>
                    {trade.trade_rating !== undefined ? (
                      <Badge variant="outline">{trade.trade_rating}/5</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {trade.trade_type ? (
                      <Badge variant="secondary">{trade.trade_type}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {trade.ncfd !== undefined ? (
                      trade.ncfd.toFixed(2)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">N/A</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm">
                          ⋯
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onBuyMore(trade)}>Buy More</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSellPartial(trade)}>Sell Partial</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSellAll(trade)} className="text-destructive">
                          Close Position
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedRows.has(trade.id) && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/30 p-0">
                      <Card className="m-4 border-0 shadow-none">
                        <CardContent className="pt-6">
                          <div className="mb-4">
                            <h4 className="font-semibold mb-4">Transaction History</h4>
                            <TransactionsTable
                              transactions={trade.transactions}
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
          )}
        </TableBody>
      </Table>
    </div>
  );
}
