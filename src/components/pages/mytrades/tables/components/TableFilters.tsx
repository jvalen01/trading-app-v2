import { Input } from '@/components/ui/input';

interface TableFiltersProps {
  tickerFilter: string;
  onTickerFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export function TableFilters({
  tickerFilter,
  onTickerFilterChange,
  typeFilter,
  onTypeFilterChange,
}: TableFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Filter by ticker..."
        value={tickerFilter}
        onChange={(event) => onTickerFilterChange(event.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter by type..."
        value={typeFilter}
        onChange={(event) => onTypeFilterChange(event.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}