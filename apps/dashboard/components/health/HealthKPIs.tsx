'use client';

import { useState, useEffect } from 'react';
import { Users, AlertTriangle, Pill, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface HealthKPIsProps {
  schoolId: string;
  loading?: boolean;
}

export function HealthKPIs({ schoolId, loading: externalLoading }: HealthKPIsProps) {
  const { t } = useI18n();
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    allergies: 0,
    medications: 0,
    updatedThisMonth: 0,
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
        const params = new URLSearchParams({ schoolId });
        const response = await fetch(`/api/health/kpis?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setKpis(result.data);
        }
      } catch (error) {
        console.error('Error fetching health KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [schoolId, externalLoading]);

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
      icon: Users,
      label: t('dashboard.health.kpis.totalStudents'),
      value: kpis.totalStudents,
      color: 'blue',
    },
    {
      icon: AlertTriangle,
      label: t('dashboard.health.kpis.allergies'),
      value: kpis.allergies,
      color: 'red',
    },
    {
      icon: Pill,
      label: t('dashboard.health.kpis.medications'),
      value: kpis.medications,
      color: 'yellow',
    },
    {
      icon: Calendar,
      label: t('dashboard.health.kpis.updatedThisMonth'),
      value: kpis.updatedThisMonth,
      color: 'green',
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpiItems.map((kpi, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
            <div className={`${colorClasses[kpi.color]} p-3 rounded-xl text-white`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

