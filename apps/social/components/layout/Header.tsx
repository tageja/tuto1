'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import EcosystemSwitcher from '@/components/layout/EcosystemSwitcher';

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    try {
      const { count } = await supabase
        .from('social_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      setUnreadCount(count ?? 0);
    } catch {
      // Ignore notification count errors
    }
  }, [user]);

  // Re-fetch on mount and whenever the user navigates (clears dot after visiting /notifications)
  useEffect(() => {
    void fetchUnreadNotifications();
  }, [fetchUnreadNotifications, pathname]);

  // Realtime: increment dot on new notification, clear on read
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`notif-count:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_notifications', filter: `recipient_id=eq.${user.id}` },
        () => { setUnreadCount((prev) => prev + 1); },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'social_notifications', filter: `recipient_id=eq.${user.id}` },
        () => { void fetchUnreadNotifications(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnreadNotifications]);

  useEffect(() => {
    if (!profile?.id) return;
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      try {
        const { data: unreadConvs } = await supabase
          .from('social_conversation_participants')
          .select('last_read_at, conversation:social_conversations(last_message_at)')
          .eq('profile_id', profile.id);

        const n = (unreadConvs ?? []).filter((r) => {
          const conv = r.conversation as { last_message_at?: string | null } | null;
          if (!conv?.last_message_at) return false;
          if (!r.last_read_at) return true;
          return new Date(conv.last_message_at) > new Date(r.last_read_at);
        }).length;
        setUnreadMessageCount(n);
      } catch {
        setUnreadMessageCount(0);
      }
    })();
  }, [profile?.id]);

  // Update document.title with unread badge
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const base = 'Cộng đồng Tuto';
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
  }, [unreadCount]);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + wordmark */}
        <Link href="/feed" className="flex items-center gap-2.5 flex-shrink-0">
          <Image
            src="/images/tuto-logo.png"
            alt="Tuto"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <span className="font-bold text-text-primary text-base tracking-tight">
            tuto<span className="text-primary">.social</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link href="/feed" className="hover:text-primary transition-colors">
            Bảng tin
          </Link>
          <Link href="/explore" className="hover:text-primary transition-colors">
            Khám phá
          </Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">
            Bảng xếp hạng
          </Link>
          <Link href="/messages" className="relative hover:text-primary transition-colors">
            Tin nhắn
            {unreadMessageCount > 0 && (
              <span
                className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500"
                aria-label={`${unreadMessageCount} cuộc trò chuyện chưa đọc`}
              />
            )}
          </Link>
          <Link href="/notifications" className="relative hover:text-primary transition-colors">
            Thông báo
            {unreadCount > 0 && (
              <span
                className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1"
                aria-label={`${unreadCount} thông báo chưa đọc`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User actions */}
        {!loading && (
          <div className="flex items-center gap-3">
            <EcosystemSwitcher />
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="Tài khoản"
                >
                  <Avatar
                    src={profile.avatarUrl}
                    name={profile.displayName}
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium text-text-primary max-w-[120px] truncate">
                    {profile.displayName}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-card shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Tổng quan sáng tạo
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Cài đặt
                    </Link>
                    <Link
                      href={`/profile/${profile.username}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Hồ sơ của tôi
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary">
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
