'use client';

import { Search } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { useI18n } from '../../../contexts/I18nContext';

interface TeacherFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  subjects: string[];
  onClear: () => void;
  showSubjectFilter?: boolean;
}

export function TeacherFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSubject,
  setSelectedSubject,
  subjects,
  onClear,
  showSubjectFilter = true,
}: TeacherFiltersProps) {
  const { t } = useI18n();

  const statusOptions = [
    { value: 'all', label: t('dashboard.teachers.filters.all') },
    { value: 'Active', label: t('dashboard.teachers.status.active') },
    { value: 'On Leave', label: t('dashboard.teachers.status.onLeave') },
    { value: 'Inactive', label: t('dashboard.teachers.status.inactive') },
  ];

  const subjectOptions = [
    { value: 'all', label: t('dashboard.teachers.filters.all') },
    ...subjects.map(s => ({ value: s, label: s })),
  ];

  const hasActiveFilters = searchQuery || selectedStatus !== 'all' || selectedSubject !== 'all';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('dashboard.teachers.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {t('dashboard.teachers.filters.status')}: {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        {showSubjectFilter && (
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {t('dashboard.teachers.filters.subject')}: {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Button */}
        {hasActiveFilters && (
          <div className="md:col-span-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="w-full md:w-auto"
            >
              {t('dashboard.teachers.filters.clear')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}













