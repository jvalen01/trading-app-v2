import { Edit2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DeleteTransactionDialog } from '@/components/common/DeleteTransactionDialog';
import type { Transaction } from '@/types';

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-success text-success-foreground';
      case 'sell_partial':
        return 'bg-warning text-warning-foreground';
      case 'sell_all':
        return 'bg-danger text-danger-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Buy';
      case 'sell_partial':
        return 'Sell Partial';
      case 'sell_all':
        return 'Sell All';
      default:
        return type;
    }
  };

  return (
    <Table>
      <TableHeader className="bg-card/80 border-b border-border">
        <TableRow className="hover:bg-card/80">
          <TableHead className="text-card-foreground">Date</TableHead>
          <TableHead className="text-card-foreground">Type</TableHead>
          <TableHead className="text-right text-card-foreground">Quantity</TableHead>
          <TableHead className="text-right text-card-foreground">Price</TableHead>
          <TableHead className="text-right text-card-foreground">Total</TableHead>
          <TableHead className="text-card-foreground">Notes</TableHead>
          <TableHead className="text-right text-card-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id} className="hover:bg-card/80 border-border">
            <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              <Badge className={getTypeBadgeColor(transaction.type)}>{getTypeLabel(transaction.type)}</Badge>
            </TableCell>
            <TableCell className="text-right">{transaction.quantity.toFixed(2)}</TableCell>
            <TableCell className="text-right">${transaction.price.toFixed(2)}</TableCell>
            <TableCell className="text-right">${(transaction.quantity * transaction.price).toFixed(2)}</TableCell>
            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{transaction.notes || '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(transaction)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <DeleteTransactionDialog
                    transaction={transaction}
                    onDelete={onDelete}
                  >
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteTransactionDialog>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
