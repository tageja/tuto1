'use client';

import { Search, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { ClassOption } from './types';

interface ActivitiesFiltersProps {
  selectedDate: string;
  selectedClassIds: string[];
  selectedTypes?: string[];
  selectedStatuses?: string[];
  searchQuery: string;
  classes: ClassOption[];
  onDateChange: (date: string) => void;
  onClassIdsChange: (classIds: string[]) => void;
  onTypeChange?: (types: string[]) => void;
  onStatusChange?: (statuses: string[]) => void;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
  isParentView?: boolean;
}

const ACTIVITY_TYPES = ['Meal', 'Learning', 'Play', 'Rest'];
const ACTIVITY_STATUSES = ['Pending', 'In Progress', 'Completed'];

export function ActivitiesFilters({
  selectedDate,
  selectedClassIds,
  selectedTypes,
  selectedStatuses,
  searchQuery,
  classes,
  onDateChange,
  onClassIdsChange,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onClearAll,
  isParentView = false,
}: ActivitiesFiltersProps) {
  const { t } = useI18n();

  const hasActiveFilters = 
    selectedClassIds.length > 0 || 
    (selectedTypes?.length ?? 0) > 0 || 
    (selectedStatuses?.length ?? 0) > 0 || 
    searchQuery.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Row 1: Date (3) | Class (5) | Type (2) | Status (2) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Date - 3 cols */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.activities.filters.date') || 'Date'}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Class - 5 cols, multi-select */}
        <div className="col-span-12 md:col-span-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.activities.filters.class') || 'Class'}
          </label>
          <select
            multiple
            value={selectedClassIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onClassIdsChange(selected);
            }}
            className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            size={1}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.grade_level && `(${cls.grade_level})`}
              </option>
            ))}
          </select>
        </div>

        {/* Type - 2 cols (Admin only) */}
        {!isParentView && selectedTypes && onTypeChange ? (
          <div className="col-span-6 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.activities.filters.type') || 'Activity Type'}
            </label>
            <select
              value={selectedTypes[0] || ''}
              onChange={(e) => {
                const value = e.target.value;
                onTypeChange(value ? [value] : []);
              }}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Status - 2 cols (Admin only) */}
        {!isParentView && selectedStatuses && onStatusChange ? (
          <div className="col-span-6 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.activities.filters.status') || 'Status'}
            </label>
            <select
              value={selectedStatuses[0] || ''}
              onChange={(e) => {
                const value = e.target.value;
                onStatusChange(value ? [value] : []);
              }}
              className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {ACTIVITY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* Row 2: Search - full width */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.activities.filters.search') || 'Search activities...'}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('dashboard.activities.filters.searchPlaceholder') || 'Search activities...'}
              className="w-full h-11 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t('dashboard.activities.filters.clear') || 'Clear Filters'}
          </Button>
        </div>
      )}
    </div>
  );
}
