'use client';

import { useState, useEffect } from 'react';
import { Search, X, Calendar } from 'lucide-react';
import type { EventsFiltersProps } from './types';
import { useI18n } from '../../contexts/I18nContext';

export function EventsFilters({
  schoolId,
  role,
  onFilterChange,
  initialTab = 'All',
  initialSearch = '',
  initialMonth = '',
  initialCategory = [],
}: EventsFiltersProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const [month, setMonth] = useState(initialMonth);
  const [category, setCategory] = useState<string[]>(initialCategory);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ tab, search, month, category });
    }, 300);

    return () => clearTimeout(timer);
  }, [tab, search, month, category, onFilterChange]);

  const adminTabs = [
    { value: 'All', label: t('dashboard.events.tabs.all') || 'All' },
    { value: 'School', label: t('dashboard.events.tabs.school') || 'School' },
    { value: 'Class', label: t('dashboard.events.tabs.class') || 'Class' },
    { value: 'Competitions', label: t('dashboard.events.tabs.competitions') || 'Competitions' },
    { value: 'Workshops', label: t('dashboard.events.tabs.workshops') || 'Workshops' },
    { value: 'Outing', label: t('dashboard.events.tabs.outing') || 'Outing' },
    { value: 'Practice', label: t('dashboard.events.tabs.practice') || 'Practice' },
    { value: 'Celebration', label: t('dashboard.events.tabs.celebration') || 'Celebration' },
  ];

  const parentTabs = [
    { value: 'All', label: t('dashboard.events.tabs.all') || 'All' },
    { value: 'Registered', label: t('dashboard.events.tabs.registered') || 'Registered' },
    { value: 'Upcoming', label: t('dashboard.events.tabs.upcoming') || 'Upcoming' },
  ];

  const tabs = role === 'admin' ? adminTabs : parentTabs;

  const categories = [
    { value: 'school', label: t('dashboard.events.categories.school') || 'School' },
    { value: 'class', label: t('dashboard.events.categories.class') || 'Class' },
    { value: 'competition', label: t('dashboard.events.categories.competition') || 'Competition' },
    { value: 'workshop', label: t('dashboard.events.categories.workshop') || 'Workshop' },
    { value: 'outing', label: t('dashboard.events.categories.outing') || 'Outing' },
    { value: 'practice', label: t('dashboard.events.categories.practice') || 'Practice' },
    { value: 'celebration', label: t('dashboard.events.categories.celebration') || 'Celebration' },
  ];

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value || '');
  };

  const handleCategoryToggle = (catValue: string) => {
    setCategory((prev) =>
      prev.includes(catValue) ? prev.filter((c) => c !== catValue) : [...prev, catValue]
    );
  };

  const clearFilters = () => {
    setTab('All');
    setSearch('');
    setMonth('');
    setCategory([]);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 flex-wrap">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.value}
            onClick={() => setTab(tabItem.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tabItem.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search') || 'Search events...'}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Month Selector */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="month"
            value={month || getCurrentMonth()}
            onChange={handleMonthChange}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filters (Admin only) */}
        {role === 'admin' && (
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryToggle(cat.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  category.includes(cat.value)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Clear Filters */}
        {(search || month || category.length > 0 || tab !== 'All') && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {t('common.clear') || 'Clear Filters'}
          </button>
        )}
      </div>
    </div>
  );
}

