'use client';

import { Card } from '../ui/Card';
import type { HomeworkKpisProps } from './types';
import { useI18n } from '../../contexts/I18nContext';

export function HomeworkKpis({
  total,
  pending,
  completed,
  completion_rate,
  loading = false,
  lastUpdated,
}: HomeworkKpisProps) {
  const { t } = useI18n();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: t('dashboard.homework.kpis.total') || 'Total Assignments',
      value: total,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
    {
      label: t('dashboard.homework.kpis.pending') || 'Pending',
      value: pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: t('dashboard.homework.kpis.completed') || 'Completed',
      value: completed,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('dashboard.homework.kpis.completionRate') || 'Completion Rate',
      value: `${completion_rate}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className={`p-4 ${kpi.bgColor}`}>
            <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-500 mt-2 text-right">
          {t('dashboard.homework.kpis.lastUpdated') || 'Last updated'}: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}



