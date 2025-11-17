'use client';

import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { KPICard } from '../school/shared/KPICard';
import { StudentKPI } from '../../lib/types/students';
import { useI18n } from '../../contexts/I18nContext';

interface StudentsKpisProps {
  kpis: StudentKPI;
  loading?: boolean;
}

export function StudentsKpis({ kpis, loading = false }: StudentsKpisProps) {
  const { t, lang } = useI18n();

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
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <KPICard
          icon={Users}
          title={t('dashboard.students.kpis.total') || 'Total Students'}
          value={kpis.total.toLocaleString()}
          color="blue"
        />
        <KPICard
          icon={UserCheck}
          title={t('dashboard.students.kpis.active') || 'Active'}
          value={kpis.active.toLocaleString()}
          color="green"
        />
        <KPICard
          icon={UserX}
          title={t('dashboard.students.kpis.inactive') || 'Inactive'}
          value={kpis.inactive.toLocaleString()}
          color="gray"
        />
        <KPICard
          icon={TrendingUp}
          title={t('dashboard.students.kpis.avgAttendance') || 'Avg Attendance'}
          value={`${kpis.avgAttendance}%`}
          color="purple"
        />
      </div>
      {kpis.lastUpdated && (
        <p className="text-xs text-gray-500 text-right">
          {lang === 'vi' ? 'Cập nhật lần cuối: ' : 'Last updated: '}
          {new Date(kpis.lastUpdated).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
        </p>
      )}
    </div>
  );
}



