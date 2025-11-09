import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBuyTrade } from '@/hooks/use-trades';
import type { TradeMetrics } from '@/types';

const buyMoreSchema = z.object({
  price: z.coerce.number().positive('Price must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  date: z.string().refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  notes: z.string().optional(),
});

type BuyMoreFormValues = z.infer<typeof buyMoreSchema>;

interface BuyMoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: TradeMetrics | null;
}

export function BuyMoreDialog({ open, onOpenChange, trade }: BuyMoreDialogProps) {
  const { toast } = useToast();
  const buyTradeMutation = useBuyTrade();

  const form = useForm<BuyMoreFormValues>({
    resolver: zodResolver(buyMoreSchema),
    defaultValues: {
      price: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const watchQuantity = form.watch('quantity');
  const watchPrice = form.watch('price');

  // Calculate new average price after adding more
  const currentValue = (trade?.averageBuyPrice || 0) * (trade?.currentQuantity || 0);
  const additionalValue = watchPrice * watchQuantity;
  const totalQuantity = (trade?.currentQuantity || 0) + watchQuantity;
  const newAveragePrice = totalQuantity > 0 ? (currentValue + additionalValue) / totalQuantity : 0;

  const onSubmit = async (values: BuyMoreFormValues) => {
    if (!trade) {
      toast({
        title: 'Error',
        description: 'No trade selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await buyTradeMutation.mutateAsync({
        ticker: trade.ticker,
        price: values.price,
        quantity: values.quantity,
        date: values.date,
        notes: values.notes,
      });
      toast({
        title: 'Success',
        description: `Added ${values.quantity} shares to ${trade.ticker} position`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add to position',
        variant: 'destructive',
      });
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Position</DialogTitle>
          <DialogDescription>Add more shares to your {trade.ticker} position</DialogDescription>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Current Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticker:</span>
              <Badge>{trade.ticker}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Quantity:</span>
              <span className="font-semibold">{trade.currentQuantity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Price:</span>
              <span className="font-semibold">${trade.averageBuyPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-semibold">${trade.totalCost.toFixed(2)}</span>
            </div>
            {trade.trade_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trade Type:</span>
                <Badge variant="secondary">{trade.trade_type}</Badge>
              </div>
            )}
            {trade.time_of_entry && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time of Entry:</span>
                <Badge variant="outline">{trade.time_of_entry}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

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

            {watchQuantity > 0 && watchPrice > 0 && (
              <Card className="bg-muted/20">
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Total Quantity:</span>
                      <span className="font-semibold">{totalQuantity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Average Price:</span>
                      <span className="font-semibold">${newAveragePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additional Cost:</span>
                      <span className="font-semibold">${additionalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="default" type="submit" disabled={buyTradeMutation.isPending}>
                {buyTradeMutation.isPending ? 'Adding...' : 'Add to Position'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}