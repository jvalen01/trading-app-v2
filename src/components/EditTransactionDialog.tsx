import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import tradesAPI from '@/api/client';
import type { Transaction } from '@/types';

const editTransactionSchema = z.object({
  price: z.coerce.number().positive('Price must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  date: z.string().refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  notes: z.string().optional(),
});

type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSuccess: () => void;
}

export function EditTransactionDialog({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      price: transaction?.price || 0,
      quantity: transaction?.quantity || 0,
      date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
      notes: transaction?.notes || '',
    },
  });

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        price: transaction.price,
        quantity: transaction.quantity,
        date: transaction.transaction_date,
        notes: transaction.notes || '',
      });
    }
  }, [transaction, form]);

  const onSubmit = async (values: EditTransactionFormValues) => {
    if (!transaction) return;

    setIsLoading(true);
    try {
      await tradesAPI.updateTransaction(transaction.id, values);
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update transaction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Editing this transaction will recalculate all related values</DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Badge variant="outline">{transaction.type.toUpperCase()}</Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add any notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
