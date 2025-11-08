import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MyTradesHeaderProps {
  onAddTrade: () => void;
}

export function MyTradesHeader({ onAddTrade }: MyTradesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">My Trades</h1>
        <p className="text-muted-foreground">Manage your trading positions and history</p>
      </div>
      <Button onClick={onAddTrade} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Trade
      </Button>
    </div>
  );
}