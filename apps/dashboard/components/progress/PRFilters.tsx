'use client';

import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { PRFiltersState } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface PRFiltersProps {
  filters: PRFiltersState;
  onChange: (filters: PRFiltersState) => void;
  classes: { id: string; name: string }[];
  students?: { id: string; name: string }[];
}

export function PRFilters({ filters, onChange, classes, students = [] }: PRFiltersProps) {
  const { t } = useI18n();

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, classId: e.target.value || null, studentId: null });
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, studentId: e.target.value || null });
  };

  const handleRangeChange = (range: '3m' | '6m' | '12m') => {
    onChange({ ...filters, range });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex flex-1 gap-4 w-full md:w-auto flex-wrap">
          <div className="w-full md:w-48">
            <Select
              label={t('dashboard.progress.filters.class')}
              value={filters.classId || ''}
              onChange={handleClassChange}
              placeholder={t('dashboard.students.filters.selectClass')}
              options={classes.map((c) => ({ label: c.name, value: c.id }))}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              label={t('dashboard.progress.filters.student')}
              value={filters.studentId || ''}
              onChange={handleStudentChange}
              placeholder="All Students"
              disabled={!filters.classId}
              options={students.map((s) => ({ label: s.name, value: s.id }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {(['3m', '6m', '12m'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filters.range === r
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`dashboard.progress.filters.range.${r}`)}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
