'use client';

import { Users, UserCheck, Calendar, Star } from 'lucide-react';
import { KPICard } from '../shared/KPICard';
import { useI18n } from '../../../contexts/I18nContext';

interface TeacherKpisProps {
  total: number;
  active: number;
  onLeave: number;
  avgRating: number;
  loading?: boolean;
}

export function TeacherKpis({
  total,
  active,
  onLeave,
  avgRating,
  loading = false,
}: TeacherKpisProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <KPICard
        icon={Users}
        title={t('dashboard.teachers.kpis.total')}
        value={total}
        color="blue"
      />
      <KPICard
        icon={UserCheck}
        title={t('dashboard.teachers.kpis.active')}
        value={active}
        trend={active !== total ? { 
          value: `${Math.round((active / total) * 100)}%`, 
          isPositive: true 
        } : undefined}
        color="green"
      />
      <KPICard
        icon={Calendar}
        title={t('dashboard.teachers.kpis.onLeave')}
        value={onLeave}
        color="orange"
      />
      <KPICard
        icon={Star}
        title={t('dashboard.teachers.kpis.avgRating')}
        value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
        trend={avgRating >= 4.5 ? { 
          value: 'Excellent', 
          isPositive: true 
        } : undefined}
        color="purple"
      />
    </div>
  );
}













