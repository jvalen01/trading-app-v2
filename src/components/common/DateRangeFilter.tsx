import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DateRangePreset = 'current-month' | 'last-3-months' | 'last-6-months' | 'last-year' | 'all-time' | 'custom';

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  preset: DateRangePreset;
  onDateRangeChange: (range: DateRange | undefined, preset: DateRangePreset) => void;
}

const getPresetDateRange = (preset: DateRangePreset): DateRange | undefined => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (preset) {
    case 'current-month':
      return {
        from: new Date(currentYear, currentMonth, 1),
        to: new Date(currentYear, currentMonth + 1, 0),
      };
    case 'last-3-months':
      return {
        from: new Date(currentYear, currentMonth - 2, 1),
        to: new Date(currentYear, currentMonth + 1, 0),
      };
    case 'last-6-months':
      return {
        from: new Date(currentYear, currentMonth - 5, 1),
        to: new Date(currentYear, currentMonth + 1, 0),
      };
    case 'last-year':
      return {
        from: new Date(currentYear - 1, currentMonth + 1, 1),
        to: new Date(currentYear, currentMonth + 1, 0),
      };
    case 'all-time':
      return undefined; // No date filter
    case 'custom':
      return undefined; // Will be set by user
    default:
      return undefined;
  }
};

export function DateRangeFilter({ dateRange, preset, onDateRangeChange }: DateRangeFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (newPreset: DateRangePreset) => {
    const newRange = getPresetDateRange(newPreset);
    onDateRangeChange(newRange, newPreset);
    setIsCalendarOpen(false);
  };

  const handleCustomRangeChange = (newRange: DateRange | undefined) => {
    onDateRangeChange(newRange, 'custom');
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current-month">Current Month</SelectItem>
          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
          <SelectItem value="last-year">Last Year</SelectItem>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCustomRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {dateRange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateRangeChange(undefined, 'all-time')}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
}