'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getXpProgressForLevel,
  SHIELD_RANK_COLOR,
  shieldsToNextRank,
  nextRankLabel,
} from '@/lib/social-gamification';
import type { DashboardProfile, DashboardPostRow, DashboardReelRow } from './page';
import { cn } from '@/lib/utils';

interface Props {
  profile: DashboardProfile;
  totalPosts: number;
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  topPosts: DashboardPostRow[];
  topReels: DashboardReelRow[];
}

type Tab = 'posts' | 'reels';

export default function DashboardClient({
  profile,
  totalPosts,
  totalReels,
  totalViews,
  totalLikes,
  topPosts,
  topReels,
}: Props) {
  const [tab, setTab] = useState<Tab>('posts');
  const xp = profile.xp ?? 0;
  const { level, current, needed, isMax, nextThreshold } = getXpProgressForLevel(xp);
  const progressPct = needed > 0 ? Math.min(100, (current / needed) * 100) : 100;
  const showStreak = (profile.streak_count ?? 0) >= 3;
  const isTeacher = profile.role === 'teacher';
  const shieldsLeft = isTeacher
    ? shieldsToNextRank(profile.shield_count ?? 0, profile.shield_rank)
    : null;
  const nextRank = isTeacher ? nextRankLabel(profile.shield_rank) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-card overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={56}
              height={56}
              className="rounded-full object-cover border-2 border-white/50"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {profile.display_name?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{profile.display_name}</h1>
            <p className="text-sm opacity-90 mt-1">
              Cấp {level}
              {showStreak && (
                <span className="ml-2">
                  🔥 {profile.streak_count} ngày
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4">
          {isMax ? (
            <p className="text-sm font-medium">Cấp tối đa 🏆</p>
          ) : (
            <>
              <div className="h-2 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs mt-2 flex flex-wrap gap-x-2 justify-between opacity-95">
                <span>{current} XP</span>
                <span>
                  Cấp {level + 1}
                  {nextThreshold != null && ` (${nextThreshold} XP)`}
                </span>
              </p>
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-card border border-gray-100 p-3 text-center bg-white">
          <p className="text-xl mb-1">📝</p>
          <p className="text-lg font-bold text-text-primary">{totalPosts}</p>
          <p className="text-xs text-text-secondary">Posts</p>
        </div>
        <div className="rounded-card border border-gray-100 p-3 text-center bg-white">
          <p className="text-xl mb-1">🎬</p>
          <p className="text-lg font-bold text-text-primary">{totalReels}</p>
          <p className="text-xs text-text-secondary">Reels</p>
        </div>
        <div className="rounded-card border border-gray-100 p-3 text-center bg-white">
          <p className="text-xl mb-1">👁</p>
          <p className="text-lg font-bold text-text-primary">{totalViews}</p>
          <p className="text-xs text-text-secondary">Views</p>
        </div>
        <div className="rounded-card border border-gray-100 p-3 text-center bg-white">
          <p className="text-xl mb-1">❤️</p>
          <p className="text-lg font-bold text-text-primary">{totalLikes}</p>
          <p className="text-xs text-text-secondary">Likes</p>
        </div>
      </section>

      {isTeacher && (
        <section className="rounded-card border border-gray-100 p-4 bg-surface">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text-primary">
              🛡 {profile.shield_count ?? 0} Shield
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
              style={{
                backgroundColor:
                  SHIELD_RANK_COLOR[profile.shield_rank ?? 'beginner'] ??
                  SHIELD_RANK_COLOR.beginner,
              }}
            >
              {profile.shield_rank ?? 'beginner'}
            </span>
          </div>
          {shieldsLeft != null && shieldsLeft > 0 && nextRank && (
            <p className="text-sm text-text-secondary mt-2">
              Còn {shieldsLeft} Shield nữa để đạt {nextRank}
            </p>
          )}
          <Link
            href="/leaderboard"
            className="inline-block mt-3 text-sm text-primary font-medium hover:underline"
          >
            Xem bảng xếp hạng →
          </Link>
        </section>
      )}

      <section>
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px',
              tab === 'posts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            Bài viết
          </button>
          <button
            type="button"
            onClick={() => setTab('reels')}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px',
              tab === 'reels'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            Reels
          </button>
        </div>

        {tab === 'posts' && (
          <ul className="space-y-2">
            {topPosts.length === 0 ? (
              <li className="text-text-secondary text-center py-8">Chưa có bài viết nào</li>
            ) : (
              topPosts.map((post) => {
                const thumb = post.media_urls?.[0];
                const snippet =
                  post.content?.slice(0, 80) ?? (thumb ? 'Ảnh' : 'Bài viết');
                return (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex gap-3 p-3 rounded-card border border-gray-100 hover:bg-surface transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        {thumb ? (
                          <Image src={thumb} alt="" fill className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 p-1 text-center line-clamp-3">
                            {snippet}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary line-clamp-2">
                          {post.content || '—'}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          👁 {post.view_count ?? 0} · ❤️ {post.like_count ?? 0} · 💬{' '}
                          {post.comments_count ?? 0}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        )}

        {tab === 'reels' && (
          <ul className="space-y-2">
            {topReels.length === 0 ? (
              <li className="text-text-secondary text-center py-8">Chưa có Reel nào</li>
            ) : (
              topReels.map((reel) => (
                <li
                  key={reel.id}
                  className="flex gap-3 p-3 rounded-card border border-gray-100 bg-white"
                >
                  <div className="w-16 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                    {reel.thumbnail_url ? (
                      <Image src={reel.thumbnail_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                        Reel
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary line-clamp-2">
                      {reel.description || '—'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      👁 {reel.view_count ?? 0} · ❤️ {reel.like_count ?? 0}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <div className="text-center pb-4">
        <Link
          href={`/profile/${encodeURIComponent(profile.username)}`}
          className="text-sm text-primary font-medium hover:underline"
        >
          Bài đăng của tôi →
        </Link>
      </div>
    </div>
  );
}
