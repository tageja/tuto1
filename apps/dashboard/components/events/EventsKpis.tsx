'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import type { EventsKpisProps } from './types';
import { useI18n } from '../../contexts/I18nContext';

export function EventsKpis({ schoolId, filters, loading: externalLoading }: EventsKpisProps) {
  const { t } = useI18n();
  const [kpis, setKpis] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    participants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      if (externalLoading) {
        setLoading(true);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          schoolId,
          role: filters.role || 'admin',
        });

        if (filters.tab) params.append('tab', filters.tab);
        if (filters.search) params.append('search', filters.search);
        if (filters.month) params.append('month', filters.month);
        if (filters.category && filters.category.length > 0) {
          filters.category.forEach(cat => params.append('category[]', cat));
        }

        const response = await fetch(`/api/school/events?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.kpis) {
          setKpis(result.kpis);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [schoolId, filters, externalLoading]);

  if (loading || externalLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    );
  }

  const kpiItems = [
    {
      label: t('dashboard.events.kpis.total') || 'Total Events',
      value: kpis.total,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
    {
      label: t('dashboard.events.kpis.upcoming') || 'Upcoming',
      value: kpis.upcoming,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('dashboard.events.kpis.completed') || 'Completed',
      value: kpis.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('dashboard.events.kpis.participants') || 'Total Participants',
      value: kpis.participants,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpiItems.map((kpi, index) => (
        <Card key={index} className={`p-4 ${kpi.bgColor}`}>
          <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
          <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
        </Card>
      ))}
    </div>
  );
}

