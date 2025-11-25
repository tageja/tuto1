'use client';

import { Card } from '../ui/Card';
import { statusConfig } from '../../lib/attendance';
import { useI18n } from '../../contexts/I18nContext';

interface AttendanceKpisProps {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
  loading?: boolean;
  lastUpdated?: Date;
  showTotal?: boolean;
}

export function AttendanceKpis({
  present,
  absent,
  late,
  excused,
  total,
  rate,
  loading = false,
  lastUpdated,
  showTotal = true,
}: AttendanceKpisProps) {
  const { t } = useI18n();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
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
      label: t('dashboard.attendance.kpis.present') || 'Present',
      value: present,
      color: statusConfig.present.color,
      bgColor: 'bg-green-50',
      show: true,
    },
    {
      label: t('dashboard.attendance.kpis.absent') || 'Absent',
      value: absent,
      color: statusConfig.absent.color,
      bgColor: 'bg-red-50',
      show: true,
    },
    {
      label: t('dashboard.attendance.kpis.late') || 'Late',
      value: late,
      color: statusConfig.late.color,
      bgColor: 'bg-yellow-50',
      show: true,
    },
    {
      label: t('dashboard.attendance.kpis.excused') || 'Excused',
      value: excused,
      color: statusConfig.excused.color,
      bgColor: 'bg-blue-50',
      show: true,
    },
    {
      label: t('dashboard.attendance.kpis.totalStudents') || 'Total Students',
      value: total,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
      show: showTotal,
    },
    {
      label: t('dashboard.attendance.kpis.attendanceRate') || 'Attendance Rate',
      value: `${rate}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      show: true,
    },
  ].filter((kpi) => kpi.show);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className={`p-4 ${kpi.bgColor}`}>
            <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-500 mt-2 text-right">
          {t('dashboard.attendance.kpis.lastUpdated') || 'Last updated'}: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}



