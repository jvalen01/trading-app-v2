import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import type { ClosedTradeMetrics } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ChartDataPoint {
  x: number;
  y: number;
  absoluteValue: number;
  label: string;
}

interface PortfolioDataPoint {
  date: Date;
  value: number;
  absoluteValue: number;
  label: string;
}

interface PortfolioPerformanceChartProps {
  trades: ClosedTradeMetrics[];
  startingCapital: number;
  isLoading?: boolean;
}

export function PortfolioPerformanceChart({ trades, startingCapital, isLoading }: PortfolioPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">Portfolio Performance</CardTitle>
          <CardDescription>Account value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  const closedTrades = trades.filter(t => t.exitDate);

  if (closedTrades.length === 0) {
    return (
      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">Portfolio Performance</CardTitle>
          <CardDescription>Account value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No closed trades available to display portfolio performance.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Sort trades by exit date
  const sortedTrades = [...closedTrades].sort((a, b) =>
    new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()
  );

  // Calculate portfolio value over time
  const portfolioData: PortfolioDataPoint[] = [];
  let currentValue = startingCapital;

  // Add starting point (0% return)
  portfolioData.push({
    date: new Date(sortedTrades[0].entryDate),
    value: 0, // 0% return
    absoluteValue: startingCapital,
    label: 'Starting Capital'
  });

  // Add each trade's impact
  sortedTrades.forEach(trade => {
    currentValue += trade.realizedPL;
    const percentageReturn = ((currentValue - startingCapital) / startingCapital) * 100;
    portfolioData.push({
      date: new Date(trade.exitDate),
      value: percentageReturn, // percentage return
      absoluteValue: currentValue,
      label: `${trade.ticker} (${trade.realizedPL >= 0 ? '+' : ''}$${trade.realizedPL.toFixed(2)})`
    });
  });

  // Calculate total return percentage
  const totalReturn = ((currentValue - startingCapital) / startingCapital) * 100;

  // Calculate moving averages
  const calculateMovingAverage = (data: PortfolioDataPoint[], period: number) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.value, 0);
      const average = sum / period;
      result.push({
        x: data[i].date.getTime(),
        y: average
      });
    }
    return result;
  };

  const movingAverage5 = calculateMovingAverage(portfolioData, 5);
  const movingAverage10 = calculateMovingAverage(portfolioData, 10);
  const movingAverage21 = calculateMovingAverage(portfolioData, 21);

  // Prepare data for Chart.js
  const chartData = {
    datasets: [{
      label: 'Portfolio Return',
      data: portfolioData.map(point => ({
        x: point.date.getTime(),
        y: point.value,
        absoluteValue: point.absoluteValue,
        label: point.label
      })),
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary))',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.1
    },
    // 5-day moving average
    ...(movingAverage5.length > 0 ? [{
      label: '5-Point MA',
      data: movingAverage5,
      borderColor: 'hsl(142 76% 36%)', // green-600
      backgroundColor: 'hsl(142 76% 36%)',
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.1
    }] : []),
    // 10-day moving average
    ...(movingAverage10.length > 0 ? [{
      label: '10-Point MA',
      data: movingAverage10,
      borderColor: 'hsl(217 91% 60%)', // blue-600
      backgroundColor: 'hsl(217 91% 60%)',
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.1
    }] : []),
    // 21-day moving average
    ...(movingAverage21.length > 0 ? [{
      label: '21-Point MA',
      data: movingAverage21,
      borderColor: 'hsl(0 84% 60%)', // red-600
      backgroundColor: 'hsl(0 84% 60%)',
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.1
    }] : [])
    ].flat()
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context: TooltipItem<'line'>[]) {
            const point = context[0].raw as ChartDataPoint;
            return point.label;
          },
          label: function(context: TooltipItem<'line'>) {
            const point = context.raw as ChartDataPoint;
            const date = new Date(point.x);
            return [
              `Date: ${date.toLocaleDateString()}`,
              `Return: ${point.y >= 0 ? '+' : ''}${point.y.toFixed(2)}%`,
              `Value: $${point.absoluteValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'MMM dd',
            month: 'MMM yyyy'
          }
        },
        grid: {
          color: 'hsl(var(--border))',
          lineWidth: 1
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'hsl(var(--border))',
          lineWidth: 1
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12
          },
          callback: function(tickValue: string | number) {
            const value = Number(tickValue);
            return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
          }
        },
        title: {
          display: true,
          text: 'Portfolio Return (%)',
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-card-foreground">Portfolio Performance</CardTitle>
        <CardDescription>
          Return percentage over time • Total Return: {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: '300px' }}>
          <Line data={chartData} options={options} />
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Hover over the lines to see trade details • {portfolioData.length - 1} trades shown
        </div>
      </CardContent>
    </Card>
  );
}