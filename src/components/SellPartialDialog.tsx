import { useState } from 'react';
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
import tradesAPI from '@/api/client';
import type { TradeMetrics } from '@/types';

const sellPartialSchema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  price: z.coerce.number().positive('Price must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  date: z.string().refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  notes: z.string().optional(),
});

type SellPartialFormValues = z.infer<typeof sellPartialSchema>;

interface SellPartialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: TradeMetrics | null;
  onSuccess: () => void;
}

export function SellPartialDialog({ open, onOpenChange, trade, onSuccess }: SellPartialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SellPartialFormValues>({
    resolver: zodResolver(sellPartialSchema),
    defaultValues: {
      quantity: 0,
      price: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const watchQuantity = form.watch('quantity');
  const watchPrice = form.watch('price');

  const realizedPL = watchQuantity * watchPrice - watchQuantity * (trade?.averageBuyPrice || 0);
  const isValidQuantity = trade && watchQuantity <= trade.currentQuantity;

  const onSubmit = async (values: SellPartialFormValues) => {
    if (!trade || !isValidQuantity) {
      toast({
        title: 'Error',
        description: 'Invalid quantity',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await tradesAPI.sellPartial(trade.id, values);
      toast({
        title: 'Success',
        description: `Position sold - P&L: $${realizedPL.toFixed(2)}`,
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sell position',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sell Partial Position</DialogTitle>
          <DialogDescription>Sell a portion of your {trade.ticker} position</DialogDescription>
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
              <span className="text-muted-foreground">Current Value:</span>
              <span className="font-semibold">${(trade.currentQuantity * trade.averageBuyPrice).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Sell</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const qty = parseFloat(e.target.value) || 0;
                        if (qty > trade.currentQuantity) {
                          form.setError('quantity', {
                            type: 'manual',
                            message: `Cannot exceed current position of ${trade.currentQuantity}`,
                          });
                        } else {
                          form.clearErrors('quantity');
                        }
                      }}
                    />
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
                  <FormLabel>Sell Price</FormLabel>
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

            {watchQuantity > 0 && watchPrice > 0 && (
              <Card className={realizedPL >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sell Value:</span>
                      <span className="font-semibold">${(watchQuantity * watchPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost Basis:</span>
                      <span className="font-semibold">${(watchQuantity * trade.averageBuyPrice).toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${realizedPL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      <span className="font-semibold">Realized P&L:</span>
                      <span className="font-bold text-lg">${realizedPL.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !isValidQuantity}>
                {isLoading ? 'Selling...' : 'Sell Partial'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
