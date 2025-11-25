'use client';

import { Calendar } from 'lucide-react';
import type { HomeworkFiltersProps } from './types';
import { useI18n } from '../../contexts/I18nContext';

export function HomeworkFilters({
  selectedDate,
  range,
  classId,
  subject,
  studentId,
  status,
  searchQuery,
  classes,
  students,
  showStudentFilter = false,
  onDateChange,
  onRangeChange,
  onClassChange,
  onSubjectChange,
  onStudentChange,
  onStatusChange,
  onSearchChange,
}: HomeworkFiltersProps) {
  const { t } = useI18n();
  
  const ranges = [
    { value: 'week', label: t('dashboard.homework.ranges.week') || 'Week' },
    { value: '1m', label: t('dashboard.homework.ranges.1m') || '1 Month' },
    { value: '3m', label: t('dashboard.homework.ranges.3m') || '3 Months' },
    { value: '6m', label: t('dashboard.homework.ranges.6m') || '6 Months' },
    { value: 'course', label: t('dashboard.homework.ranges.course') || 'Full Course' },
  ] as const;

  const statuses = [
    { value: 'all', label: t('dashboard.homework.status.all') || 'All' },
    { value: 'pending', label: t('dashboard.homework.status.pending') || 'Pending' },
    { value: 'completed', label: t('dashboard.homework.status.completed') || 'Completed' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === s.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-12 gap-3">
        {/* Date Picker */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">{t('dashboard.homework.filters.date') || 'Date'}</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => onDateChange(new Date(e.target.value))}
              className="w-full h-11 pl-3 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Range Selector */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">{t('dashboard.homework.filters.range') || 'Range'}</label>
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value as any)}
            className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">{t('dashboard.homework.filters.class') || 'Class'}</label>
          <select
            value={classId || ''}
            onChange={(e) => onClassChange(e.target.value || undefined)}
            className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('dashboard.homework.filters.allClasses') || 'All Classes'}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">{t('dashboard.homework.filters.subject') || 'Subject'}</label>
          <input
            type="text"
            value={subject || ''}
            onChange={(e) => onSubjectChange(e.target.value || undefined)}
            placeholder={t('dashboard.homework.filters.allSubjects') || 'All subjects'}
            className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Student Filter (Admin only) */}
        {showStudentFilter && (
          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('dashboard.homework.filters.student') || 'Student'}</label>
            <select
              value={studentId || ''}
              onChange={(e) => onStudentChange(e.target.value || undefined)}
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('dashboard.homework.filters.allStudents') || 'All Students'}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('dashboard.homework.filters.search') || 'Search by title or subject...'}
          className="w-full h-11 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}



