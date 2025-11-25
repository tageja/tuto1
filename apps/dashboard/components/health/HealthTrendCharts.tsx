'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface VitalsData {
  id: string;
  heightCm: number | null;
  weightKg: number | null;
  recordedAt: string;
}

interface HealthTrendChartsProps {
  vitals: VitalsData[];
  loading?: boolean;
}

export function HealthTrendCharts({ vitals, loading }: HealthTrendChartsProps) {
  const { t } = useI18n();
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('3m');

  // Filter and group vitals by month based on range
  const chartData = useMemo(() => {
    if (!vitals || vitals.length === 0) return [];

    const now = new Date();
    const monthsAgo = range === '3m' ? 3 : range === '6m' ? 6 : 12;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

    // Filter vitals within range
    const filtered = vitals.filter((v) => new Date(v.recordedAt) >= cutoffDate);

    // Group by month (YYYY-MM format) and take latest entry per month
    const byMonth = new Map<string, VitalsData>();

    filtered.forEach((vital) => {
      const date = new Date(vital.recordedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = byMonth.get(monthKey);
      if (!existing || new Date(vital.recordedAt) > new Date(existing.recordedAt)) {
        byMonth.set(monthKey, vital);
      }
    });

    // Convert to array and sort by date
    const sorted = Array.from(byMonth.values()).sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    // Format for chart
    return sorted.map((v) => ({
      month: new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      date: v.recordedAt,
      height: v.heightCm,
      weight: v.weightKg,
    }));
  }, [vitals, range]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Range Tabs */}
      <div className="flex items-center gap-2">
        {(['3m', '6m', '12m'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t(`dashboard.health.parent.rangeTabs.${r}`)}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Height Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.health.parent.height')}
          </h3>
          {chartData.length > 0 && chartData.some((d) => d.height !== null) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'cm', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="height"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Height (cm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t('dashboard.health.empty.noVitals')}
            </div>
          )}
        </Card>

        {/* Weight Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.health.parent.weight')}
          </h3>
          {chartData.length > 0 && chartData.some((d) => d.weight !== null) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'kg', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t('dashboard.health.empty.noVitals')}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

