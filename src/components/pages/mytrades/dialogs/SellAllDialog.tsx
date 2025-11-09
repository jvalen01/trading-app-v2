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
import { useSellAll } from '@/hooks/use-trades';
import type { TradeMetrics } from '@/types';

const sellAllSchema = z.object({
  price: z.coerce.number().positive('Price must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  date: z.string().refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  commission: z.coerce.number().min(0, 'Commission must be 0 or greater').optional(),
  notes: z.string().optional(),
});

type SellAllFormValues = z.infer<typeof sellAllSchema>;

interface SellAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: TradeMetrics | null;
}

export function SellAllDialog({ open, onOpenChange, trade }: SellAllDialogProps) {
  const { toast } = useToast();
  const sellAllMutation = useSellAll();

  const form = useForm<SellAllFormValues>({
    resolver: zodResolver(sellAllSchema),
    defaultValues: {
      price: 0,
      date: new Date().toISOString().split('T')[0],
      commission: 1,
      notes: '',
    },
  });

  const watchPrice = form.watch('price');

  const totalSellValue = trade ? trade.currentQuantity * watchPrice : 0;
  const costBasis = trade ? trade.totalCost : 0;
  const realizedPL = totalSellValue - costBasis;

  const onSubmit = async (values: SellAllFormValues) => {
    if (!trade) return;

    try {
      await sellAllMutation.mutateAsync({ tradeId: trade.id, payload: values });
      toast({
        title: 'Success',
        description: `Trade closed - Final P&L: $${realizedPL.toFixed(2)}`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to close position',
        variant: 'destructive',
      });
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Close Position</DialogTitle>
          <DialogDescription>Close your entire {trade.ticker} position</DialogDescription>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Position Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticker:</span>
              <Badge>{trade.ticker}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-semibold">{trade.currentQuantity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Buy Price:</span>
              <span className="font-semibold">${trade.averageBuyPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-semibold">${costBasis.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1.00" step="0.01" min="0" {...field} />
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

            {watchPrice > 0 && (
              <Card className={realizedPL >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sale Value:</span>
                      <span className="font-semibold">${totalSellValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost Basis:</span>
                      <span className="font-semibold">${costBasis.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${realizedPL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      <span className="font-semibold">Total P&L:</span>
                      <span className="font-bold text-lg">${realizedPL.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between ${realizedPL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      <span className="font-semibold">Return:</span>
                      <span className="font-bold">{((realizedPL / costBasis) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={sellAllMutation.isPending}>
                {sellAllMutation.isPending ? 'Closing...' : 'Close Position'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
