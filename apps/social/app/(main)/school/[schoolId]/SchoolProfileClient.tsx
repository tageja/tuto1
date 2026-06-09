'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FeedPost from '@/components/feed/FeedPost';
import { cn } from '@/lib/utils';

const ACHIEVEMENT_GRADIENT: Record<string, string> = {
  academic: 'from-amber-400 to-orange-500',
  streak: 'from-blue-500 to-teal-500',
  score: 'from-violet-500 to-indigo-500',
  first: 'from-emerald-500 to-green-600',
  certificate: 'from-amber-400 to-yellow-400',
};

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  academic: '🏆',
  streak: '🔥',
  score: '⭐',
  first: '🎀',
  certificate: '📜',
};

type Tab = 'announcements' | 'staff' | 'achievements';

interface AnnouncementPost {
  id: string;
  postType: string;
  content: string;
  mediaUrls: string[];
  subjects: string[];
  moderationStatus: string;
  reactions: { like: number; applaud: number; curious: number };
  commentsCount: number;
  savesCount: number;
  isPinned: boolean;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
    verified: boolean;
    username?: string;
  };
  event: null;
  assignment: null;
  poll: null;
  achievement: null;
  createdAt: string;
}

interface StaffMember {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  shield_count: number;
  shield_rank: string | null;
  is_verified: boolean;
}

interface AchievementCard {
  id: string;
  content: string;
  achievement: Record<string, unknown> | null;
  authorDisplayName: string;
  createdAt: string;
}

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#6B7280',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

interface Props {
  announcements: AnnouncementPost[];
  staff: StaffMember[];
  achievements: AchievementCard[];
}

export default function SchoolProfileClient({ announcements, staff, achievements }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'announcements', label: 'Thông báo' },
    { key: 'staff', label: 'Giáo viên' },
    { key: 'achievements', label: 'Thành tích' },
  ];

  return (
    <div className="mt-6">
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px transition-colors',
              activeTab === key
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">📢</span>
              <p className="font-medium">Chưa có thông báo nào</p>
            </div>
          ) : (
            announcements.map((post) => (
              <div key={post.id} className="relative">
                {post.isPinned && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                    📌 Ghim
                  </span>
                )}
                <FeedPost post={post as never} />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-3">
          {staff.length === 0 ? (
            <p className="text-gray-500 text-center py-12">Chưa có giáo viên nào</p>
          ) : (
            staff.map((t) => (
              <Link
                key={t.id}
                href={`/profile/${encodeURIComponent(t.username)}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {t.avatar_url ? (
                  <Image
                    src={t.avatar_url}
                    alt={t.display_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                    {t.display_name?.charAt(0) ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">{t.display_name}</span>
                    {t.is_verified && <span className="text-primary">✓</span>}
                  </div>
                  <span className="text-sm text-gray-500">@{t.username}</span>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: SHIELD_RANK_COLORS[t.shield_rank ?? 'beginner'] ?? SHIELD_RANK_COLORS.beginner,
                  }}
                >
                  🛡 {t.shield_count}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-2 gap-4">
          {achievements.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">🏆</span>
              <p className="font-medium">Chưa có thành tích nào</p>
            </div>
          ) : (
            achievements.map((a) => {
              const ach = (a.achievement ?? {}) as { type?: string; title?: string; description?: string };
              const gradient = ACHIEVEMENT_GRADIENT[ach.type ?? 'academic'] ?? ACHIEVEMENT_GRADIENT.academic;
              const emoji = ACHIEVEMENT_EMOJI[ach.type ?? 'academic'] ?? '🏆';
              return (
                <Link
                  key={a.id}
                  href={`/post/${a.id}`}
                  className="block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={cn('p-3 bg-gradient-to-r text-white', gradient)}>
                    <span className="text-2xl">{emoji}</span>
                    <p className="font-bold text-sm mt-1 line-clamp-1">{ach.title ?? 'Thành tích'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.authorDisplayName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
