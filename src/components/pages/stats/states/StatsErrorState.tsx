import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface StatsErrorStateProps {
  error: string;
}

export function StatsErrorState({ error }: StatsErrorStateProps) {
  return (
    <div className="flex-1 w-full h-full p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
}