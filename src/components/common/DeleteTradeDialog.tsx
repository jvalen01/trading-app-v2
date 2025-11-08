import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { ClosedTradeMetrics } from '@/types';

interface DeleteTradeDialogProps {
  trade: ClosedTradeMetrics;
  onDelete: (tradeId: number) => void;
  children?: React.ReactNode;
}

export function DeleteTradeDialog({ trade, onDelete, children }: DeleteTradeDialogProps) {
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
          <AlertDialogTitle>Delete Trade</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this trade? This action cannot be undone.
            <br />
            <br />
            <strong>Trade Details:</strong>
            <br />
            Ticker: {trade.ticker}
            <br />
            Realized P&L: ${trade.realizedPL.toFixed(2)}
            <br />
            Return: {(trade.pnlPercentage ?? trade.returnPercentage ?? 0).toFixed(2)}%
            <br />
            Entry Date: {new Date(trade.entryDate).toLocaleDateString()}
            <br />
            Exit Date: {new Date(trade.exitDate).toLocaleDateString()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(trade.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Trade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}