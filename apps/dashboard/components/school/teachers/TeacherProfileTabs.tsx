'use client';

import { useState } from 'react';
import { useI18n } from '../../../contexts/I18nContext';

interface TeacherProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
}

export function TeacherProfileTabs({ activeTab, setActiveTab, tabs }: TeacherProfileTabsProps) {
  const { t } = useI18n();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              pb-4 px-1 font-medium text-sm whitespace-nowrap transition-colors
              ${activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}














