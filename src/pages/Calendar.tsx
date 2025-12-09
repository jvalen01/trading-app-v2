import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tradesAPI from '@/api/client';
import type { ClosedTradeMetrics } from '@/types';

interface CalendarProps {
  startingCapital: number;
}

interface DayData {
  date: Date;
  pnl: number;
  tradeCount: number;
  isCurrentMonth: boolean;
}

interface WeekData {
  days: DayData[];
  weekNumber: number;
  weekPnl: number;
  weekTradeCount: number;
}

// Helper function to get date key in local timezone (YYYY-MM-DD)
const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Calendar({ startingCapital }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [closedTrades, setClosedTrades] = useState<ClosedTradeMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        const trades = await tradesAPI.getClosedTradesWithRMetrics(startingCapital);
        setClosedTrades(trades);
      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrades();
  }, [startingCapital]);

  // Calculate P&L by date
  const pnlByDate = useMemo(() => {
    const pnlMap = new Map<string, { pnl: number; tradeCount: number }>();
    
    closedTrades.forEach(trade => {
      const exitDate = new Date(trade.exitDate);
      const dateKey = getLocalDateKey(exitDate);
      
      const existing = pnlMap.get(dateKey) || { pnl: 0, tradeCount: 0 };
      pnlMap.set(dateKey, {
        pnl: existing.pnl + (trade.realizedPL || 0),
        tradeCount: existing.tradeCount + 1,
      });
    });
    
    return pnlMap;
  }, [closedTrades]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const weeks: WeekData[] = [];
    let currentWeek: DayData[] = [];
    let weekNumber = 1;
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = getLocalDateKey(current);
      const dayData = pnlByDate.get(dateKey) || { pnl: 0, tradeCount: 0 };
      
      currentWeek.push({
        date: new Date(current),
        pnl: dayData.pnl,
        tradeCount: dayData.tradeCount,
        isCurrentMonth: current.getMonth() === month,
      });
      
      if (currentWeek.length === 7) {
        const weekPnl = currentWeek
          .filter(d => d.isCurrentMonth)
          .reduce((sum, d) => sum + d.pnl, 0);
        const weekTradeCount = currentWeek
          .filter(d => d.isCurrentMonth)
          .reduce((sum, d) => sum + d.tradeCount, 0);
        
        weeks.push({
          days: currentWeek,
          weekNumber,
          weekPnl,
          weekTradeCount,
        });
        currentWeek = [];
        weekNumber++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return weeks;
  }, [currentDate, pnlByDate]);

  // Calculate monthly P&L
  const monthlyPnl = useMemo(() => {
    return calendarData.reduce((sum, week) => sum + week.weekPnl, 0);
  }, [calendarData]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const formatPercent = (value: number) => {
    const percent = (value / startingCapital) * 100;
    const prefix = percent >= 0 ? '+' : '';
    return `${prefix}${percent.toFixed(2)}%`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Monthly P&L: </span>
            <span className={`text-xl font-bold ${monthlyPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(monthlyPnl)}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-border">
            {dayNames.map(day => (
              <div
                key={day}
                className="px-2 py-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
            <div className="px-2 py-3 text-center text-sm font-medium text-muted-foreground">
              Total
            </div>
          </div>

          {/* Weeks */}
          {calendarData.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-cols-8 border-b border-border last:border-b-0"
            >
              {/* Days */}
              {week.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-2 border-r border-border relative ${
                    day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                  }`}
                >
                  {/* Copy icon */}
                  <button className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                    <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                  
                  {/* Date number */}
                  <div className={`text-lg font-medium mb-1 ${
                    day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* P&L */}
                  {day.isCurrentMonth && (
                    <div className="space-y-0.5">
                      <div className={`text-sm font-semibold ${
                        day.pnl > 0 ? 'text-green-500' : day.pnl < 0 ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {day.pnl !== 0 ? formatPercent(day.pnl) : '0%'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.tradeCount} trade{day.tradeCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Week Total */}
              <div className="min-h-[100px] p-2 bg-muted/20 flex flex-col justify-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Week {week.weekNumber}
                </div>
                <div className={`text-sm font-bold ${
                  week.weekPnl > 0 ? 'text-green-500' : week.weekPnl < 0 ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {formatPercent(week.weekPnl)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {week.weekTradeCount} trade{week.weekTradeCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
