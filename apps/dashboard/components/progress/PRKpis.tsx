'use client';

import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { KPICard } from '../school/shared/KPICard';
import { ProgressKPIs } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface PRKpisProps {
  data: ProgressKPIs;
  loading?: boolean;
}

export function PRKpis({ data, loading }: PRKpisProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: t('dashboard.progress.totalStudents'),
      value: data.total_students?.toString() || '0',
      icon: Users,
      trend: undefined,
    },
    {
      title: t('dashboard.progress.avgGrade'),
      value: data.avg_grade?.toFixed(1) || '0',
      icon: GraduationCap,
      trend: data.improvement_rate > 0 ? 'up' : data.improvement_rate < 0 ? 'down' : undefined,
    },
    {
      title: t('dashboard.progress.improvementRate'),
      value: `${data.improvement_rate?.toFixed(1) || '0'}%`,
      icon: TrendingUp,
      trend: data.improvement_rate > 0 ? 'up' : data.improvement_rate < 0 ? 'down' : undefined,
    },
    {
      title: t('dashboard.progress.atRisk'),
      value: data.at_risk_count?.toString() || '0',
      icon: AlertTriangle,
      trend: data.at_risk_count > 0 ? 'down' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          trend={kpi.trend as 'up' | 'down' | undefined}
        />
      ))}
    </div>
  );
}
