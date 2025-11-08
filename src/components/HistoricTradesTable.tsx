import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionsTable } from './TransactionsTable';
import { format } from 'date-fns';
import type { ClosedTradeMetrics, Transaction } from '@/types';

interface HistoricTradesTableProps {
  trades: ClosedTradeMetrics[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTrade: (tradeId: number) => void;
}

export function HistoricTradesTable({ trades, onEditTransaction, onDeleteTrade }: HistoricTradesTableProps) {
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

  const getPLBadgeVariant = (pl: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    return pl >= 0 ? 'default' : 'destructive';
  };

  const getReturnBadgeColor = (returnPct: number) => {
    return returnPct >= 0 ? 'bg-success text-success-foreground' : 'bg-danger text-danger-foreground';
  };

  const getRMultipleColor = (rMultiple: number | undefined) => {
    if (!rMultiple) return 'text-muted-foreground';
    return rMultiple >= 0 ? 'text-success' : 'text-danger';
  };

  return (
    <div className="space-y-0 border border-border rounded-lg overflow-hidden bg-card/50">
      <Table>
        <TableHeader className="bg-card/80 border-b border-border">
          <TableRow className="hover:bg-card/80">
            <TableHead className="w-8 text-card-foreground"></TableHead>
            <TableHead className="text-card-foreground">Ticker</TableHead>
            <TableHead className="text-right text-card-foreground">Qty Traded</TableHead>
            <TableHead className="text-right text-card-foreground">Avg Buy Price</TableHead>
            <TableHead className="text-right text-card-foreground">Avg Sell Price</TableHead>
            <TableHead className="text-card-foreground">Realized P&L</TableHead>
            <TableHead className="text-card-foreground">Return %</TableHead>
            <TableHead className="text-right text-card-foreground">Account @ Entry</TableHead>
            <TableHead className="text-card-foreground">R-Multiple</TableHead>
            <TableHead className="text-card-foreground">Entry Date</TableHead>
            <TableHead className="text-card-foreground">Exit Date</TableHead>
            <TableHead className="text-card-foreground">Rating</TableHead>
            <TableHead className="text-card-foreground">Type</TableHead>
            <TableHead className="text-card-foreground">NCFD</TableHead>
            <TableHead className="text-right text-card-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow className="hover:bg-card/80">
              <TableCell colSpan={15} className="text-center text-muted-foreground py-8">
                No closed trades yet.
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
                      <Badge variant="outline">CLOSED</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{trade.totalBought.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.averageBuyPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${trade.averageExitPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getPLBadgeVariant(trade.realizedPL)}>
                      ${trade.realizedPL.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getReturnBadgeColor(trade.pnlPercentage ?? trade.returnPercentage ?? 0)}>
                      {(trade.pnlPercentage ?? trade.returnPercentage ?? 0) > 0 ? '+' : ''}{(trade.pnlPercentage ?? trade.returnPercentage ?? 0).toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.accountValueAtEntry ? `$${trade.accountValueAtEntry.toFixed(0)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getRMultipleColor(trade.rMultiple)}`}>
                      {trade.rMultiple !== undefined ? `${trade.rMultiple >= 0 ? '+' : ''}${(trade.rMultiple * 100).toFixed(2)}%` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(trade.entryDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(trade.exitDate), 'MMM dd, yyyy')}</TableCell>
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
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteTrade(trade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(trade.id) && (
                  <TableRow>
                    <TableCell colSpan={15} className="bg-muted/30 p-0">
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
