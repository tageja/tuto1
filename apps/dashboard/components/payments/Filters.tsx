'use client';

import { useCallback } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';
import type { DateRange } from './types';

interface PaymentFiltersProps {
  selectedDate: Date;
  range: DateRange;
  classId?: string;
  studentId?: string;
  type?: 'tuition' | 'trip' | 'club' | 'misc';
  status: 'all' | 'pending' | 'paid' | 'overdue';
  onDateChange: (date: Date) => void;
  onRangeChange: (range: DateRange) => void;
  onClassChange: (classId: string | undefined) => void;
  onStudentChange: (studentId: string | undefined) => void;
  onTypeChange: (type: 'tuition' | 'trip' | 'club' | 'misc' | undefined) => void;
  onStatusChange: (status: 'all' | 'pending' | 'paid' | 'overdue') => void;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; first_name: string; last_name: string }>;
}

export function PaymentFilters({
  selectedDate,
  range,
  classId,
  studentId,
  type,
  status,
  onDateChange,
  onRangeChange,
  onClassChange,
  onStudentChange,
  onTypeChange,
  onStatusChange,
  classes,
  students,
}: PaymentFiltersProps) {
  const { t } = useI18n();

  const formatDateForInput = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onDateChange(newDate);
      }
    },
    [onDateChange]
  );

  const ranges: Array<{ value: DateRange; label: string }> = [
    { value: 'week', label: t('dashboard.payments.filters.week') || 'Week' },
    { value: '1m', label: t('dashboard.payments.filters.oneMonth') || '1 Month' },
    { value: '3m', label: t('dashboard.payments.filters.threeMonths') || '3 Months' },
    { value: '6m', label: t('dashboard.payments.filters.sixMonths') || '6 Months' },
    { value: '12m', label: t('dashboard.payments.filters.twelveMonths') || '12 Months' },
    { value: 'custom', label: t('dashboard.payments.filters.custom') || 'Custom' },
  ];

  return (
    <Card className="p-4">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-4 pb-4">
        {(['all', 'pending', 'paid', 'overdue'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === s
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {s === 'all' ? t('dashboard.payments.filters.all') || 'All' : t(`dashboard.payments.status.${s}`) || s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Date Picker */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.payments.filters.from') || 'From'}
          </label>
          <div className="relative">
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Range Selector */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.payments.filters.dateRange') || 'Date Range'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange(r.value)}
                className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  range === r.value
                    ? 'bg-[#0B5FFF] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Class Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.payments.filters.class') || 'Class'}
          </label>
          <select
            value={classId || ''}
            onChange={(e) => onClassChange(e.target.value || undefined)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.payments.filters.allClasses') || 'All Classes'}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.payments.filters.student') || 'Student'}
          </label>
          <select
            value={studentId || ''}
            onChange={(e) => onStudentChange(e.target.value || undefined)}
            disabled={!classId}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">{t('dashboard.payments.filters.allStudents') || 'All Students'}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.payments.filters.type') || 'Type'}
          </label>
          <select
            value={type || ''}
            onChange={(e) => onTypeChange((e.target.value || undefined) as any)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.payments.filters.allTypes') || 'All Types'}</option>
            <option value="tuition">{t('dashboard.payments.type.tuition') || 'Tuition'}</option>
            <option value="trip">{t('dashboard.payments.type.trip') || 'Trip'}</option>
            <option value="club">{t('dashboard.payments.type.club') || 'Club'}</option>
            <option value="misc">{t('dashboard.payments.type.misc') || 'Miscellaneous'}</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

