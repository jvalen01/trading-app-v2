import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useBuyTrade } from '@/hooks/use-trades';

const addTradeSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
  price: z.coerce.number().positive('Price must be greater than 0').multipleOf(0.01, 'Max 2 decimal places'),
  quantity: z.coerce.number().int('Quantity must be a whole number').positive('Quantity must be greater than 0'),
  date: z.string().refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  commission: z.coerce.number().min(0, 'Commission must be 0 or greater').optional(),
  notes: z.string().optional(),
  trade_rating: z.coerce.number().min(0).max(5).optional(),
  trade_type: z.enum(['Breakout', 'Anticipation', 'Short Pivot', 'Parabolic Long', 'Day Trade', 'EP', 'UnR']).optional(),
  ncfd: z.coerce.number().min(0, 'NCFD must be between 0 and 100').max(100, 'NCFD must be between 0 and 100').optional(),
  time_of_entry: z.enum(['ORB1', 'ORB5', 'ORB15', 'ORB30', 'ORB60', 'EOD', 'Other']).optional(),
});

type AddTradeFormValues = z.infer<typeof addTradeSchema>;

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTradeDialog({ open, onOpenChange }: AddTradeDialogProps) {
  const { toast } = useToast();
  const buyTradeMutation = useBuyTrade();

  const form = useForm<AddTradeFormValues>({
    resolver: zodResolver(addTradeSchema),
    defaultValues: {
      ticker: '',
      price: undefined,
      quantity: undefined,
      date: new Date().toISOString().split('T')[0],
      commission: 1,
      notes: '',
      trade_rating: undefined,
      trade_type: 'Breakout',
      ncfd: undefined,
      time_of_entry: 'Other',
    },
  });

  const onSubmit = async (values: AddTradeFormValues) => {
    try {
      await buyTradeMutation.mutateAsync(values);
      toast({
        title: 'Success',
        description: 'Trade added successfully',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add trade',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Trade</DialogTitle>
          <DialogDescription>Register a new trade or add to an existing position</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL" {...field} />
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
                    <Input type="number" placeholder="0" step="1" {...field} />
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
            <FormField
              control={form.control}
              name="trade_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Rating (0-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="5"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trade_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Breakout">Breakout</option>
                      <option value="Anticipation">Anticipation</option>
                      <option value="Short Pivot">Short Pivot</option>
                      <option value="Parabolic Long">Parabolic Long</option>
                      <option value="Day Trade">Day Trade</option>
                      <option value="EP">EP</option>
                      <option value="UnR">UnR</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ncfd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NCFD</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.01"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time_of_entry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Entry</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="ORB1">ORB1</option>
                      <option value="ORB5">ORB5</option>
                      <option value="ORB15">ORB15</option>
                      <option value="ORB30">ORB30</option>
                      <option value="ORB60">ORB60</option>
                      <option value="EOD">EOD</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="default" type="submit" disabled={buyTradeMutation.isPending}>
                {buyTradeMutation.isPending ? 'Adding...' : 'Add Trade'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
