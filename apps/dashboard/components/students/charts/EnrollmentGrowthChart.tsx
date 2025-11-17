'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../../ui/Card';
import { useI18n } from '../../../../contexts/I18nContext';

interface EnrollmentGrowthChartProps {
  schoolId: string;
  byClass?: boolean;
}

export function EnrollmentGrowthChart({ schoolId, byClass = false }: EnrollmentGrowthChartProps) {
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('12m');
  const [data, setData] = useState<{
    overall: Array<{ month: string; count: number }>;
    byClass: Array<{ month: string; byClass: Record<string, number> }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useI18n();

  useEffect(() => {
    async function fetchGrowth() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/school/students/growth?schoolId=${encodeURIComponent(schoolId)}&period=${period}&byClass=${byClass}`
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching growth data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrowth();
  }, [schoolId, period, byClass]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
      </Card>
    );
  }

  if (!data || !data.overall || data.overall.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center py-8">
          {t('dashboard.students.growth.empty') || 'No enrollment data available'}
        </p>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.overall.map((item) => {
    const formatted: any = {
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      Overall: item.count,
    };

    // Add class data if available
    if (byClass && data.byClass) {
      const monthData = data.byClass.find((d) => d.month === item.month);
      if (monthData && monthData.byClass) {
        Object.assign(formatted, monthData.byClass);
      }
    }

    return formatted;
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">
          {t('dashboard.students.growth.title') || 'Enrollment Growth'}
        </h3>
        <div className="flex gap-2 mb-4">
          {(['1m', '3m', '6m', '12m'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p === '1m' ? (lang === 'vi' ? '1 tháng' : '1 Month') :
               p === '3m' ? (lang === 'vi' ? '3 tháng' : '3 Months') :
               p === '6m' ? (lang === 'vi' ? '6 tháng' : '6 Months') :
               (lang === 'vi' ? '12 tháng' : '12 Months')}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Overall"
            stroke={colors[0]}
            strokeWidth={2}
            name={t('dashboard.students.growth.overall') || 'Overall'}
          />
          {byClass && data.byClass && data.byClass.length > 0 && (
            <>
              {Object.keys(data.byClass[0]?.byClass || {}).map((className, index) => (
                <Line
                  key={className}
                  type="monotone"
                  dataKey={className}
                  stroke={colors[(index + 1) % colors.length]}
                  strokeWidth={2}
                  name={className}
                />
              ))}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

