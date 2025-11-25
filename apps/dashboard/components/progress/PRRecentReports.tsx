'use client';

import { Card } from '../ui/Card';
import { RecentReport } from './types';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';

interface PRRecentReportsProps {
  reports: RecentReport[];
  loading?: boolean;
  onViewReport: (report: RecentReport) => void;
}

export function PRRecentReports({ reports, loading, onViewReport }: PRRecentReportsProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.progress.recentReports')}</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.progress.recentReports')}</h3>
        <p className="text-center text-gray-500 py-8">{t('dashboard.progress.noData')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('dashboard.progress.recentReports')}</h3>
        <span className="text-sm text-gray-500">{reports.length} reports</span>
      </div>
      
      <div className="space-y-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{report.student_name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                  {report.avg_grade_letter}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Released {format(new Date(report.released_at), 'MMM d, yyyy')} • Score: {report.avg_score?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewReport(report)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('dashboard.progress.actions.view')}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
