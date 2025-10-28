'use client';

import { useI18n } from '../contexts/I18nContext';
import { Button } from './ui/Button';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          lang === 'en'
            ? 'bg-white text-[#0B5FFF] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('vi')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          lang === 'vi'
            ? 'bg-white text-[#0B5FFF] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        VI
      </button>
    </div>
  );
}

export default LanguageToggle;
