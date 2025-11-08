import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';
import { AddTradeDialog } from './components/AddTradeDialog';

function App() {
  const [addTradeOpen, setAddTradeOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <Navbar onAddTradeClick={() => setAddTradeOpen(true)} />
      <Dashboard />
      <AddTradeDialog open={addTradeOpen} onOpenChange={setAddTradeOpen} onSuccess={() => {}} />
      <Toaster />
    </div>
  );
}

export default App;
