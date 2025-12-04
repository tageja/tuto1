'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';

export type SettingsTab = 'profile' | 'preferences' | 'integrations' | 'notifications' | 'privacy';

interface SettingsTabsProps {
  tabs: SettingsTab[];
  activeTab: SettingsTab;
  lastSaved?: string | null;
}

export function SettingsTabs({ tabs, activeTab, lastSaved }: SettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const handleTabChange = (tab: SettingsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabLabels: Record<SettingsTab, string> = {
    profile: t('settings.tabs.profile'),
    preferences: t('settings.tabs.preferences'),
    integrations: t('settings.tabs.integrations'),
    notifications: t('settings.tabs.notifications'),
    privacy: t('settings.tabs.privacy'),
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabels[tab]}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
        
        {lastSaved && (
          <div className="flex items-center gap-2 px-4 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {t('settings.lastSaved')}: {lastSaved}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsTabs;

