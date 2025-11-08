import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2, DollarSign } from 'lucide-react';
import { capitalAPI } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface CapitalManagementDialogProps {
  startingCapital: number;
  onStartingCapitalChange: (capital: number) => void;
}

interface Adjustment {
  id: number;
  adjustment_amount: number;
  reason: string | null;
  adjusted_at: string;
}

export function CapitalManagementDialog({ startingCapital, onStartingCapitalChange }: CapitalManagementDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newCapital, setNewCapital] = useState(startingCapital.toString());
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAdjustments();
    }
  }, [open]);

  useEffect(() => {
    setNewCapital(startingCapital.toString());
  }, [startingCapital]);

  const loadAdjustments = async () => {
    try {
      const data = await capitalAPI.getAdjustments();
      setAdjustments(data);
    } catch (error) {
      console.error('Failed to load adjustments:', error);
    }
  };

  const handleUpdateStartingCapital = async () => {
    const capital = parseFloat(newCapital);
    if (isNaN(capital) || capital <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid starting capital amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await capitalAPI.setStartingCapital(capital);
      onStartingCapitalChange(capital);
      toast({
        title: 'Success',
        description: `Starting capital updated to $${capital.toFixed(2)}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update starting capital';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdjustment = async () => {
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid adjustment amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await capitalAPI.addAdjustment(amount, adjustmentReason || undefined);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      await loadAdjustments();
      toast({
        title: 'Success',
        description: `Capital adjustment of ${amount > 0 ? '+' : ''}${amount.toFixed(2)} recorded`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add adjustment';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdjustment = async (id: number) => {
    try {
      setIsLoading(true);
      await capitalAPI.deleteAdjustment(id);
      await loadAdjustments();
      toast({
        title: 'Success',
        description: 'Adjustment deleted',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete adjustment';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.adjustment_amount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Capital
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Capital Management</DialogTitle>
          <DialogDescription>
            Manage your starting capital and record adjustments for missed trades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Starting Capital Section */}
          <div className="space-y-3 p-4 bg-card/50 rounded-lg border">
            <h3 className="font-semibold">Starting Capital</h3>
            <p className="text-sm text-muted-foreground">
              Your initial account balance. Trades are calculated relative to this amount.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter starting capital"
                value={newCapital}
                onChange={(e) => setNewCapital(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleUpdateStartingCapital}
                disabled={isLoading || newCapital === startingCapital.toString()}
              >
                Update
              </Button>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Current: </span>
              <span className="font-semibold">${startingCapital.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Capital Adjustments Section */}
          <div className="space-y-3">
            <h3 className="font-semibold">Capital Adjustments</h3>
            <p className="text-sm text-muted-foreground">
              Record manual adjustments (e.g., deposits, withdrawals, or corrections for missed trades).
              Total adjustments: <span className={totalAdjustments >= 0 ? 'text-success' : 'text-destructive'}>
                {totalAdjustments >= 0 ? '+' : ''}{totalAdjustments.toFixed(2)}
              </span>
            </p>

            {/* Add Adjustment Form */}
            <div className="p-3 bg-card/50 rounded-lg border space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label className="text-xs">Reason (optional)</Label>
                  <Input
                    type="text"
                    placeholder="Deposit, withdrawal, etc."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddAdjustment}
                disabled={isLoading || !adjustmentAmount}
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Adjustment
              </Button>
            </div>

            {/* Adjustments List */}
            {adjustments.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={adjustment.adjustment_amount >= 0 ? 'default' : 'destructive'}
                          className="min-w-fit"
                        >
                          {adjustment.adjustment_amount >= 0 ? '+' : ''}{adjustment.adjustment_amount.toFixed(2)}
                        </Badge>
                        {adjustment.reason && (
                          <span className="text-sm text-muted-foreground">{adjustment.reason}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(adjustment.adjusted_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAdjustment(adjustment.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No adjustments recorded yet.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
