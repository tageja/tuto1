'use client';

import { Doughnut } from 'react-chartjs-2';
import { Card } from '../ui/Card';
import { chartColors, doughnutChartOptions } from '../../lib/chart-config';
import { useI18n } from '../../contexts/I18nContext';
import type { PaymentDonutData } from './types';

interface PaymentDonutProps {
  donutData: PaymentDonutData;
  loading?: boolean;
}

export function PaymentDonut({ donutData, loading = false }: PaymentDonutProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  const paidPercent = donutData.datasets[0]?.data[0] || 0;
  const paidValue = donutData.datasets[0]?.values[0] || 0;
  const total = donutData.datasets[0]?.values.reduce((a, b) => a + b, 0) || 0;

  const chartData = {
    labels: donutData.labels,
    datasets: [
      {
        data: donutData.datasets[0]?.data || [],
        backgroundColor: [chartColors.success, chartColors.warning, chartColors.danger],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('dashboard.payments.donut.title') || 'Fee Collection Overview'}
      </h3>
      <div className="h-64 relative flex items-center justify-center">
        <Doughnut data={chartData} options={doughnutChartOptions} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{paidPercent}%</div>
            <div className="text-xs text-gray-500">
              {t('dashboard.payments.donut.collected') || 'Collected'}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {donutData.labels.map((label, index) => {
          const percent = donutData.datasets[0]?.data[index] || 0;
          const value = donutData.datasets[0]?.values[index] || 0;
          const colors = [chartColors.success, chartColors.warning, chartColors.danger];
          
          return (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span>{t(`dashboard.payments.donut.${label.toLowerCase()}`) || label}</span>
              </div>
              <span className="font-medium">{percent}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

