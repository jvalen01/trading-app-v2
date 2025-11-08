import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface TableColumnVisibilityProps {
  columns: Array<{
    id: string;
    label: string;
    visible: boolean;
    canHide: boolean;
  }>;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export function TableColumnVisibility({
  columns,
  onColumnVisibilityChange,
}: TableColumnVisibilityProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns
          .filter((column) => column.canHide)
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.visible}
              onCheckedChange={(value) =>
                onColumnVisibilityChange(column.id, !!value)
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}