'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGate } from '@/contexts/AuthGateContext';
import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function MobileTabBar() {
  const pathname   = usePathname();
  const { user }   = useAuth();
  const { promptAuth } = useAuthGate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from('social_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnread(count ?? 0));
  }, [user]);

  const handleGated = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      promptAuth('Đăng nhập để tiếp tục.');
    }
  };

  const tabs = [
    { href: '/feed',          icon: '🏠', label: 'Bảng tin',  gated: false },
    { href: '/search',        icon: '🔍', label: 'Tìm kiếm',  gated: false },
    { href: '/create',        icon: '➕', label: 'Đăng',       gated: true  },
    { href: '/notifications', icon: '🔔', label: 'Thông báo', gated: true, badge: unread },
    { href: user ? `/profile/${user?.email?.split('@')[0] ?? ''}` : '/login',
      icon: '👤', label: 'Hồ sơ', gated: false },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/feed' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={tab.gated ? handleGated : undefined}
              className={[
                'flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors',
                isActive ? 'text-primary' : 'text-gray-500',
              ].join(' ')}
            >
              <span className="relative text-xl leading-none">
                {tab.icon}
                {'badge' in tab && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold px-0.5">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
