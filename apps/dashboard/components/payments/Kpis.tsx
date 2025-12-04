'use client';

import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';
import type { PaymentKPIs } from './types';

interface PaymentKpisProps {
  kpis: PaymentKPIs;
  loading?: boolean;
}

export function PaymentKpis({ kpis, loading = false }: PaymentKpisProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (cents: number): string => {
    // VND doesn't use decimals, so we show the amount directly (treating cents as smallest unit)
    return `${cents.toLocaleString('vi-VN')} ₫`;
  };

  const kpiItems = [
    {
      label: t('dashboard.payments.kpis.totalCollection') || 'Total Collection',
      value: formatCurrency(kpis.total_collection),
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
    {
      label: t('dashboard.payments.kpis.paid') || 'Paid',
      value: formatCurrency(kpis.paid),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('dashboard.payments.kpis.pending') || 'Pending',
      value: formatCurrency(kpis.pending),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: t('dashboard.payments.kpis.overdue') || 'Overdue',
      value: formatCurrency(kpis.overdue),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: t('dashboard.payments.kpis.totalStudents') || 'Total Students',
      value: kpis.total_students.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('dashboard.payments.kpis.revenuePerStudent') || 'Revenue / Student',
      value: formatCurrency(kpis.revenue_per_student),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {kpiItems.map((kpi, index) => (
        <Card key={index} className={`p-4 ${kpi.bgColor}`}>
          <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
          <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
        </Card>
      ))}
    </div>
  );
}

