'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { AnnouncementTab } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface AnnouncementFiltersProps {
  role: 'parent' | 'admin';
  activeTab: AnnouncementTab;
  searchQuery: string;
  onTabChange: (tab: AnnouncementTab) => void;
  onSearchChange: (query: string) => void;
  onClearFilters?: () => void;
}

export function AnnouncementFilters({
  role,
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
  onClearFilters,
}: AnnouncementFiltersProps) {
  const { t } = useI18n();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const parentTabs: AnnouncementTab[] = ['all', 'active', 'urgent', 'expired'];
  const adminTabs: AnnouncementTab[] = ['draft', 'published', 'archived'];

  const tabs = role === 'parent' ? parentTabs : adminTabs;

  const getTabLabel = (tab: AnnouncementTab) => {
    return t(`dashboard.announcements.filters.${tab}`);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t('dashboard.announcements.filters.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {onClearFilters && (localSearch || activeTab !== tabs[0]) && (
          <button
            onClick={() => {
              setLocalSearch('');
              onClearFilters();
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {t('common.clear')}
          </button>
        )}
      </div>
    </div>
  );
}






