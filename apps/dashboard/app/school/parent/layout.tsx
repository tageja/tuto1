'use client';

import { ParentSidebar } from '../../../components/school/ParentSidebar';
import { SchoolDropdown } from '../../../components/school/SchoolDropdown';
import { Bell, Search, Globe } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useI18n();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'vi' : 'en');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase font-medium">{lang}</span>
              </button>

              {/* School Dropdown */}
              <SchoolDropdown />

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                AD
              </div>
            </div>
          </div>

          {/* Demo Mode Banner - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-800">
                  <strong>🧪 Dev Mode</strong> - Switch Role:
                </span>
                <button 
                  onClick={() => window.location.href = '/school/admin'}
                  className="px-3 py-1 bg-white border border-purple-300 text-purple-700 text-xs rounded hover:bg-purple-50 transition-colors"
                >
                  Admin →
                </button>
                <button 
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                  disabled
                  title="Currently viewing Parent dashboard"
                >
                  Parent
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live data
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


