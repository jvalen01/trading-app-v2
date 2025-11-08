import { Button } from '@/components/ui/button';

interface NavbarProps {
  onAddTradeClick: () => void;
}

export function Navbar({ onAddTradeClick }: NavbarProps) {
  return (
    <div className="w-full bg-card border-b border-border flex items-center justify-between px-6 py-4 flex-shrink-0 shadow-md">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-card-foreground">Trading Dashboard</h1>
      </div>
      <Button onClick={onAddTradeClick} className="gap-2">
        Add Trade
      </Button>
    </div>
  );
}
