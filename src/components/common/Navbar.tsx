import { Button } from '@/components/ui/button';
import { BarChart3, LayoutDashboard, CalendarDays } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { DateRangeFilter, type DateRangePreset } from '@/components/common/DateRangeFilter';
import { CapitalManagementDialog } from '@/components/common/CapitalManagementDialog';

type Page = 'trades' | 'stats' | 'calendar';

interface NavbarProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
  dateRange: DateRange | undefined;
  dateRangePreset: DateRangePreset;
  onDateRangeChange: (range: DateRange | undefined, preset: DateRangePreset) => void;
  startingCapital: number;
  onStartingCapitalChange: (capital: number) => void;
}

export function Navbar({
  onNavigate,
  currentPage,
  dateRange,
  dateRangePreset,
  onDateRangeChange,
  startingCapital,
  onStartingCapitalChange
}: NavbarProps) {

  return (
    <div className="w-full bg-card border-b border-border flex items-center justify-between px-6 py-4 flex-shrink-0 shadow-md">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-card-foreground">Trading Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
       
        <nav className="flex items-center gap-2">
          <Button
            variant={currentPage === 'trades' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onNavigate('trades')}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            My Trades
          </Button>
          <Button
            variant={currentPage === 'stats' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onNavigate('stats')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant={currentPage === 'calendar' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onNavigate('calendar')}
            className="gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Button>
        </nav>
         <CapitalManagementDialog
          startingCapital={startingCapital}
          onStartingCapitalChange={onStartingCapitalChange}
        />
        <DateRangeFilter
          dateRange={dateRange}
          preset={dateRangePreset}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
    </div>
  );
}
