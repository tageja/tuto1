'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

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
          <Link href="/notifications" className="hover:text-primary transition-colors">
            Thông báo
          </Link>
        </nav>

        {/* User actions */}
        {!loading && (
          <div className="flex items-center gap-3">
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
