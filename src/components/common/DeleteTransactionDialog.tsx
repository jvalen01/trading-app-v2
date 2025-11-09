import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Transaction } from '@/types';

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
  children?: React.ReactNode;
}

export function DeleteTransactionDialog({ transaction, onDelete, children }: DeleteTransactionDialogProps) {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
            <br />
            <br />
            <strong>Transaction Details:</strong>
            <br />
            Type: {getTypeLabel(transaction.type)}
            <br />
            Quantity: {transaction.quantity.toFixed(2)}
            <br />
            Price: ${transaction.price.toFixed(2)}
            <br />
            Total: ${(transaction.quantity * transaction.price).toFixed(2)}
            <br />
            Date: {new Date(transaction.transaction_date).toLocaleDateString()}
            {transaction.notes && (
              <>
                <br />
                Notes: {transaction.notes}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(transaction)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}