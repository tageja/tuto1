'use client';

import { useState, useEffect } from 'react';
import { Pill, Calendar, CheckCircle, Clock } from 'lucide-react';
import { KPICard } from '../school/shared/KPICard';
import { useI18n } from '../../contexts/I18nContext';

interface MedicineKPIsProps {
  schoolId: string;
  loading?: boolean;
}

interface KPIData {
  totalReminders: number;
  active: number;
  dueToday: number;
  completedToday: number;
}

export function MedicineKPIs({ schoolId, loading: externalLoading }: MedicineKPIsProps) {
  const { t } = useI18n();
  const [kpis, setKpis] = useState<KPIData>({
    totalReminders: 0,
    active: 0,
    dueToday: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      if (!schoolId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/kpis`);
        const result = await response.json();
        
        if (result.success) {
          setKpis(result.data);
        }
      } catch (error) {
        console.error('Error fetching medicine KPIs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, [schoolId]);

  if (loading || externalLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const kpiItems = [
    {
      title: t('dashboard.medicine.kpis.totalReminders') || 'Total Reminders',
      value: kpis.totalReminders,
      icon: Pill,
      color: 'blue',
    },
    {
      title: t('dashboard.medicine.kpis.active') || 'Active',
      value: kpis.active,
      icon: Clock,
      color: 'green',
    },
    {
      title: t('dashboard.medicine.kpis.dueToday') || 'Due Today',
      value: kpis.dueToday,
      icon: Calendar,
      color: 'yellow',
    },
    {
      title: t('dashboard.medicine.kpis.completedToday') || 'Completed Today',
      value: kpis.completedToday,
      icon: CheckCircle,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpiItems.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
        />
      ))}
    </div>
  );
}

