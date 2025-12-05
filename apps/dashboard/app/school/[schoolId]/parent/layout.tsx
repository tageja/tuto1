'use client';

import { useParams, useRouter } from 'next/navigation';
import { ParentSidebar } from '../../../../components/school/ParentSidebar';
import { SchoolDropdown } from '../../../../components/school/SchoolDropdown';
import { SchoolLogo } from '../../../../components/school/SchoolLogo';
import { Search, Globe, LogOut, Settings, User } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { useSchool } from '../../../../contexts/SchoolContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { NotificationBell } from '../../../../components/notifications/NotificationBell';

export default function ParentLayoutURLBased({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { selectedSchool, schoolIdFromUrl } = useSchool();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const schoolId = decodeURIComponent(params.schoolId as string);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'vi' : 'en');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Log for debugging
  useEffect(() => {
    console.log('URL-based Parent Layout:', { schoolId, selectedSchool, schoolIdFromUrl });
  }, [schoolId, selectedSchool, schoolIdFromUrl]);

  return (
    <div className="flex min-h-screen bg-bg">
      <ParentSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                  className="w-full pl-10 pr-4 py-2 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* School Logo */}
              <SchoolLogo schoolId={schoolId} size="md" />

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase font-medium">{lang}</span>
              </button>

              {/* School Dropdown */}
              <SchoolDropdown />

              {/* Notifications */}
              <NotificationBell role="parent" schoolIdOverride={schoolId} />

              {/* User Avatar with Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border hover:border-primary transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                      {getInitials(user?.name || user?.email || 'U')}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text">{user?.name || 'User'}</p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push(`/school/${schoolId}/parent/settings`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {lang === 'vi' ? 'Cài đặt' : 'Settings'}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push(`/school/${schoolId}/parent/settings?tab=profile`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {lang === 'vi' ? 'Hồ sơ' : 'Profile'}
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {lang === 'vi' ? 'Đăng xuất' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* URL-based Route Indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-accent">
                  <strong>🆕 URL-based Routing (Parent)</strong> - School: {schoolId}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                Read-only
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
