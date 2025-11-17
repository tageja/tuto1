'use client';

import { Calendar, CheckCircle, Clock, Loader } from 'lucide-react';
import { KPICard } from '../school/shared/KPICard';
import { useI18n } from '../../contexts/I18nContext';
import { ActivityKPI } from './types';

interface ActivitiesKpisProps {
  kpis: ActivityKPI;
  loading?: boolean;
  lastUpdated?: Date;
}

export function ActivitiesKpis({ kpis, loading = false, lastUpdated }: ActivitiesKpisProps) {
  const { t } = useI18n();

  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return t('dashboard.activities.kpis.justNow') || 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t('dashboard.activities.kpis.minAgo') || 'm ago'}`;
    const hours = Math.floor(minutes / 60);
    return `${hours}${t('dashboard.activities.kpis.hourAgo') || 'h ago'}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dashboard.activities.kpis.total') || 'Total Activities'}
          value={kpis.total}
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title={t('dashboard.activities.kpis.completed') || 'Completed'}
          value={kpis.completed}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title={t('dashboard.activities.kpis.inProgress') || 'In Progress'}
          value={kpis.inProgress}
          icon={Loader}
          color="blue"
        />
        <KPICard
          title={t('dashboard.activities.kpis.pending') || 'Pending'}
          value={kpis.pending}
          icon={Clock}
          color="yellow"
        />
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-500 text-right">
          {t('dashboard.activities.kpis.lastUpdated') || 'Last updated'}: {getRelativeTime(lastUpdated)}
        </p>
      )}
    </div>
  );
}
