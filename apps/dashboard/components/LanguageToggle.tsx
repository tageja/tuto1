'use client';

import { useI18n } from '../contexts/I18nContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  // Show the language you can SWITCH TO (not the current language)
  const toggleToLang = lang === 'vi' ? 'en' : 'vi';
  const displayText = toggleToLang === 'en' ? 'EN' : 'VI';

  return (
    <button
      onClick={() => setLang(toggleToLang)}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
      title={`Switch to ${displayText}`}
    >
      <Globe className="w-4 h-4" />
      {displayText}
    </button>
  );
}

export default LanguageToggle;
