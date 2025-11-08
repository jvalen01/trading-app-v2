import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Stats } from './pages/Stats';
import { Toaster } from './components/ui/toaster';
import { type DateRange } from 'react-day-picker';
import { type DateRangePreset } from './components/DateRangeFilter';
import { capitalAPI } from './api/client';

type Page = 'trades' | 'stats';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('trades');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all-time');
  const [startingCapital, setStartingCapital] = useState<number>(10000); // Default $10,000
  const [isLoadingCapital, setIsLoadingCapital] = useState(true);

  const handleDateRangeChange = (newRange: DateRange | undefined, newPreset: DateRangePreset) => {
    setDateRange(newRange);
    setDateRangePreset(newPreset);
  };

  // Load starting capital from database on mount
  useEffect(() => {
    const loadCapitalSettings = async () => {
      try {
        const settings = await capitalAPI.getSettings();
        if (settings.startingCapital) {
          setStartingCapital(settings.startingCapital);
        }
      } catch (error) {
        console.error('Failed to load capital settings:', error);
        // Fall back to localStorage
        const saved = localStorage.getItem('startingCapital');
        if (saved) {
          setStartingCapital(parseFloat(saved));
        }
      } finally {
        setIsLoadingCapital(false);
      }
    };

    loadCapitalSettings();
  }, []);

  // Save starting capital to database when it changes (debounced)
  useEffect(() => {
    if (isLoadingCapital) return;

    const timer = setTimeout(() => {
      const saveCapital = async () => {
        try {
          await capitalAPI.setStartingCapital(startingCapital);
          localStorage.setItem('startingCapital', startingCapital.toString());
        } catch (error) {
          console.error('Failed to save capital settings:', error);
          // Still save to localStorage as fallback
          localStorage.setItem('startingCapital', startingCapital.toString());
        }
      };

      saveCapital();
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [startingCapital, isLoadingCapital]);

  const renderPage = () => {
    if (isLoadingCapital) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'trades':
        return <Dashboard dateRange={dateRange} startingCapital={startingCapital} />;
      case 'stats':
        return <Stats dateRange={dateRange} startingCapital={startingCapital} />;
      default:
        return <Dashboard dateRange={dateRange} startingCapital={startingCapital} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <Navbar
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        dateRange={dateRange}
        dateRangePreset={dateRangePreset}
        onDateRangeChange={handleDateRangeChange}
        startingCapital={startingCapital}
        onStartingCapitalChange={setStartingCapital}
      />
      {renderPage()}
      <Toaster />
    </div>
  );
}

export default App;
