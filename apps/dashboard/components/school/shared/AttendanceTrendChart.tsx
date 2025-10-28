'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { useI18n } from '../../../contexts/I18nContext';

interface AttendanceTrendChartProps {
  schoolId: string;
}

export function AttendanceTrendChart({ schoolId }: AttendanceTrendChartProps) {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState<1 | 3 | 6 | 12>(3);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrend() {
      setLoading(true);
      try {
        const response = await fetch(`/api/school/trends/attendance?schoolId=${schoolId}&months=${timeRange}`);
        if (response.ok) {
          const result = await response.json();
          setTrendData(result.data || []);
        }
      } catch (error) {
        console.error('Error loading attendance trend:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrend();
  }, [schoolId, timeRange]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('attendanceTrend')}</h3>
        <div className="flex items-center gap-2">
          {([1, 3, 6, 12] as const).map(months => (
            <button
              key={months}
              onClick={() => setTimeRange(months)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === months
                  ? 'bg-purple-600 text-white'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : trendData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No attendance data available
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-56 flex items-end justify-center gap-8">
            {trendData.map((month) => {
              const height = month.rate;
              const color = 
                height >= 95 ? 'bg-green-600' :
                height >= 85 ? 'bg-yellow-600' :
                'bg-red-600';
              
              return (
                <div key={month.month} className="flex flex-col items-center gap-2 group">
                  <div 
                    className={`w-16 ${color} rounded-t-lg transition-all hover:opacity-80 relative cursor-pointer flex items-center justify-center`}
                    style={{ height: `${Math.max(height, 15)}%`, minHeight: '40px' }}
                  >
                    <span className="text-white font-semibold text-sm">{month.rate}%</span>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {month.rate}% attendance
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{month.label}</span>
                </div>
              );
            })}
          </div>
          
          {/* Legend - Now inside the container */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>≥ 95%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded"></div>
              <span>85-94%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>&lt; 85%</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

