'use client';

import { Line } from 'react-chartjs-2';
import { Card } from '../ui/Card';
import { chartColors, lineChartOptions } from '../../lib/chart-config';
import { useI18n } from '../../contexts/I18nContext';
import type { TrendDataPoint } from './types';

interface PaymentTrendProps {
  trendData: TrendDataPoint[];
  loading?: boolean;
}

export function PaymentTrend({ trendData, loading = false }: PaymentTrendProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  const hasData = trendData && trendData.length > 0;

  const chartData = {
    labels: trendData.map((point) =>
      new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: t('dashboard.payments.trend.revenue') || 'Revenue',
        data: trendData.map((point) => point.revenue), // Revenue in VND
        borderColor: chartColors.line,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, chartColors.lineGradientStart);
          gradient.addColorStop(1, chartColors.lineGradientEnd);
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: chartColors.line,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Customize y-axis for currency
  const customLineChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        max: undefined, // Remove max limit for revenue
        ticks: {
          ...lineChartOptions.scales.y.ticks,
          callback: (value: number) => `${value.toLocaleString('vi-VN')} ₫`,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('dashboard.payments.trend.title') || 'Revenue Trend'}
      </h3>
      {hasData ? (
        <div className="h-64">
          <Line data={chartData} options={customLineChartOptions} />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No revenue data available for this period</p>
        </div>
      )}
    </Card>
  );
}

