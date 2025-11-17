'use client';

import { useState, ReactNode } from 'react';
import { ProfileTab } from '../../lib/types/students';
import { useI18n } from '../../contexts/I18nContext';

interface ProfileTabsProps {
  defaultTab?: ProfileTab;
  children: (activeTab: ProfileTab) => ReactNode;
}

export function ProfileTabs({ defaultTab = 'overview', children }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);
  const { t } = useI18n();

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: t('dashboard.students.tabs.overview') || 'Overview' },
    { key: 'attendance', label: t('dashboard.students.tabs.attendance') || 'Attendance' },
    { key: 'fees', label: t('dashboard.students.tabs.fees') || 'Fees' },
    { key: 'notes', label: t('dashboard.students.tabs.notes') || 'Notes' },
    { key: 'contacts', label: t('dashboard.students.tabs.contacts') || 'Contacts' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, tab: ProfileTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.key === activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].key);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.key === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].key);
      }
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, tab.key)}
            className={`pb-4 px-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {children(activeTab)}
      </div>
    </div>
  );
}

