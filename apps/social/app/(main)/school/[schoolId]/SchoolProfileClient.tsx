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
  academic: '🏆', streak: '🔥', score: '⭐', first: '🎀', certificate: '📜',
};

type Tab = 'posts' | 'about' | 'photos' | 'events' | 'staff';

interface PostLike {
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
    schoolId?: string;
  };
  event: { title: string; date: string; location?: string; rsvpCount: number } | null;
  assignment: null;
  poll: null;
  achievement: Record<string, unknown> | null;
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

interface SchoolInfo {
  name: string;
  bio?: string | null;
  address?: string | null;
  founded?: string | null;
}

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#6B7280',
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#FFD700',
  elite:    '#FF6B35',
};

interface Props {
  posts:        PostLike[];
  staff:        StaffMember[];
  achievements: AchievementCard[];
  events:       PostLike[];
  photos:       PostLike[];
  schoolInfo:   SchoolInfo;
}

export default function SchoolProfileClient({ posts, staff, achievements, events, photos, schoolInfo }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'posts',  label: 'Bài viết'   },
    { key: 'about',  label: 'Giới thiệu' },
    { key: 'photos', label: 'Ảnh'        },
    { key: 'events', label: 'Sự kiện'    },
    { key: 'staff',  label: 'Giáo viên'  },
  ];

  return (
    <div className="mt-6">
      {/* Scrollable tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px transition-colors whitespace-nowrap flex-shrink-0',
              activeTab === key
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bài viết tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">📝</span>
              <p className="font-medium">Chưa có bài viết nào</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="relative">
                {post.isPinned && (
                  <span className="absolute top-2 right-2 z-10 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">📌 Ghim</span>
                )}
                <FeedPost post={post as never} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Giới thiệu tab */}
      {activeTab === 'about' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Thông tin trường</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tên trường</p>
              <p className="text-sm text-gray-900">{schoolInfo.name}</p>
            </div>
            {schoolInfo.bio && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Giới thiệu</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{schoolInfo.bio}</p>
              </div>
            )}
            {schoolInfo.address && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Địa chỉ</p>
                <p className="text-sm text-gray-700">📍 {schoolInfo.address}</p>
              </div>
            )}
            {staff.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Đội ngũ giáo viên</p>
                <p className="text-sm text-gray-700">{staff.length} giáo viên</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ảnh tab */}
      {activeTab === 'photos' && (
        <div>
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">📷</span>
              <p className="font-medium">Chưa có ảnh nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.flatMap((p) => (p.mediaUrls ?? []).map((url, i) => (
                <Link key={`${p.id}-${i}`} href={`/post/${p.id}`} className="aspect-square relative block rounded overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover hover:opacity-90 transition-opacity" sizes="150px" unoptimized />
                </Link>
              )))}
            </div>
          )}
        </div>
      )}

      {/* Sự kiện tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">📅</span>
              <p className="font-medium">Chưa có sự kiện nào</p>
            </div>
          ) : (
            events.map((post) => (
              <FeedPost key={post.id} post={post as never} />
            ))
          )}
        </div>
      )}

      {/* Giáo viên tab */}
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
                  <Image src={t.avatar_url} alt={t.display_name} width={48} height={48} className="rounded-full object-cover" />
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
                  style={{ backgroundColor: SHIELD_RANK_COLORS[t.shield_rank ?? 'beginner'] }}
                >
                  🛡 {t.shield_count}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
