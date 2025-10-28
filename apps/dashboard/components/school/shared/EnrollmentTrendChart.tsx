'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { useI18n } from '../../../contexts/I18nContext';

interface EnrollmentTrendChartProps {
  schoolId: string;
}

export function EnrollmentTrendChart({ schoolId }: EnrollmentTrendChartProps) {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState<1 | 3 | 6 | 12>(3);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrend() {
      setLoading(true);
      try {
        const response = await fetch(`/api/school/trends/enrollment?schoolId=${schoolId}&months=${timeRange}`);
        if (response.ok) {
          const result = await response.json();
          setTrendData(result.data || []);
        }
      } catch (error) {
        console.error('Error loading enrollment trend:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrend();
  }, [schoolId, timeRange]);

  const maxCount = Math.max(...trendData.map(d => d.count), 1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('studentEnrollmentTrend')}</h3>
        <div className="flex items-center gap-2">
          {([1, 3, 6, 12] as const).map(months => (
            <button
              key={months}
              onClick={() => setTimeRange(months)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === months
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {months}M
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : trendData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No enrollment data available
        </div>
      ) : (
        <div className="h-64 flex items-end justify-center gap-8">
          {trendData.map((month) => {
            const height = (month.count / maxCount) * 100;
            return (
              <div key={month.month} className="flex flex-col items-center gap-2 group">
                <div 
                  className="w-16 bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 relative cursor-pointer flex items-center justify-center" 
                  style={{ height: `${Math.max(height, 15)}%`, minHeight: '40px' }}
                >
                  <span className="text-white font-semibold text-sm">{month.count}</span>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {month.count} students
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{month.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

