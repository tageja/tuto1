'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface AttendanceFiltersProps {
  date: Date;
  range: 'week' | '1m' | '3m' | '6m' | 'course';
  classId?: string;
  studentId?: string;
  searchQuery?: string;
  onDateChange: (date: Date) => void;
  onRangeChange: (range: 'week' | '1m' | '3m' | '6m' | 'course') => void;
  onClassChange: (classId: string | undefined) => void;
  onStudentChange: (studentId: string | undefined) => void;
  onSearchChange: (query: string) => void;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; first_name: string; last_name: string }>;
  showCourseRange?: boolean;
}

export function AttendanceFilters({
  date,
  range,
  classId,
  studentId,
  searchQuery = '',
  onDateChange,
  onRangeChange,
  onClassChange,
  onStudentChange,
  onSearchChange,
  classes,
  students,
  showCourseRange = false,
}: AttendanceFiltersProps) {
  const { t } = useI18n();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Format date for input
  const formatDateForInput = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Debounce search
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    setDebounceTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchInput]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onDateChange(newDate);
      }
    },
    [onDateChange]
  );

  const ranges = [
    { value: 'week' as const, label: t('dashboard.attendance.filters.week') || 'Week' },
    { value: '1m' as const, label: t('dashboard.attendance.filters.oneMonth') || '1 Month' },
    { value: '3m' as const, label: t('dashboard.attendance.filters.threeMonths') || '3 Months' },
    { value: '6m' as const, label: t('dashboard.attendance.filters.sixMonths') || '6 Months' },
  ];

  if (showCourseRange) {
    ranges.push({ value: 'course' as const, label: t('dashboard.attendance.filters.course') || 'Full Course' });
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Date Picker */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.attendance.filters.date') || 'Date'}
          </label>
          <div className="relative">
            <input
              type="date"
              value={formatDateForInput(date)}
              onChange={handleDateChange}
              className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Range Selector */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.attendance.filters.range') || 'Range'}
          </label>
          <div className="flex gap-2">
            {ranges.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onRangeChange(r.value)}
                className="flex-1 h-11"
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Class Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.attendance.filters.class') || 'Class'}
          </label>
          <select
            value={classId || ''}
            onChange={(e) => onClassChange(e.target.value || undefined)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.attendance.filters.allClasses') || 'All Classes'}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student Filter */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dashboard.attendance.filters.student') || 'Student'}
          </label>
          <select
            value={studentId || ''}
            onChange={(e) => onStudentChange(e.target.value || undefined)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.attendance.filters.allStudents') || 'All Students'}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search - Full Width */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('dashboard.attendance.filters.search') || 'Search students...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </Card>
  );
}



