'use client';

import { Users, GraduationCap, TrendingUp, Target } from 'lucide-react';
import { KPICard } from '../shared/KPICard';
import { useI18n } from '../../../contexts/I18nContext';

interface ClassKpisProps {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  capacityUsage: number;
  avgAttendance: number;
  loading?: boolean;
}

export function ClassKpis({
  totalClasses,
  activeClasses,
  totalStudents,
  capacityUsage,
  avgAttendance,
  loading = false,
}: ClassKpisProps) {
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
        icon={GraduationCap}
        title={t('totalClasses' as any) || 'Total Classes'}
        value={totalClasses}
        trend={activeClasses !== totalClasses ? { 
          value: `${activeClasses} active`, 
          isPositive: true 
        } : undefined}
        color="blue"
      />
      <KPICard
        icon={Users}
        title={t('totalStudents')}
        value={totalStudents}
        color="green"
      />
      <KPICard
        icon={Target}
        title={t('capacity' as any) || 'Capacity'}
        value={`${capacityUsage}%`}
        color="purple"
      />
      <KPICard
        icon={TrendingUp}
        title={t('avgAttendance' as any) || 'Avg Attendance'}
        value={`${avgAttendance}%`}
        color="orange"
      />
    </div>
  );
}



