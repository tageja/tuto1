'use client';

import { Card } from '../ui/Card';
import { ClassOverviewItem } from './types';
import { useI18n } from '../../contexts/I18nContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PRClassOverviewProps {
  data: ClassOverviewItem[];
  loading?: boolean;
}

export function PRClassOverview({ data, loading }: PRClassOverviewProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.progress.subjectPerformance')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.progress.subjectPerformance')}</h3>
        <p className="text-center text-gray-500 py-8">{t('dashboard.progress.noData')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('dashboard.progress.subjectPerformance')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item) => {
          const changeIcon = item.change > 0 ? TrendingUp : item.change < 0 ? TrendingDown : Minus;
          const changeColor = item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-400';
          const Icon = changeIcon;

          return (
            <div
              key={item.subject}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{item.subject}</h4>
                <Icon className={`w-5 h-5 ${changeColor}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {item.avg_score.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
              <div className={`text-sm mt-1 ${changeColor}`}>
                {item.change > 0 && '+'}
                {item.change.toFixed(1)} from previous period
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
