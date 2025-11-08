import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Stats } from './pages/Stats';
import { Toaster } from './components/ui/toaster';
import { type DateRange } from 'react-day-picker';
import { type DateRangePreset } from './components/DateRangeFilter';

type Page = 'trades' | 'stats';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('trades');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all-time');

  const handleDateRangeChange = (newRange: DateRange | undefined, newPreset: DateRangePreset) => {
    setDateRange(newRange);
    setDateRangePreset(newPreset);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'trades':
        return <Dashboard dateRange={dateRange} />;
      case 'stats':
        return <Stats dateRange={dateRange} dateRangePreset={dateRangePreset} onDateRangeChange={handleDateRangeChange} />;
      default:
        return <Dashboard dateRange={dateRange} />;
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
      />
      {renderPage()}
      <Toaster />
    </div>
  );
}

export default App;
