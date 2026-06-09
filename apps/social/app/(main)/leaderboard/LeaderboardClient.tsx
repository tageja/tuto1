'use client';

import Link from 'next/link';
import Image from 'next/image';
import ProfileFollowButton from '@/components/profile/FollowButton';
import { SHIELD_RANK_COLOR, PODIUM_COLOR } from '@/lib/social-gamification';
import type { LeaderboardTeacher } from './page';
import { cn } from '@/lib/utils';

interface Props {
  teachers: LeaderboardTeacher[];
  currentProfileId: string | null;
  followingMap: Record<string, boolean>;
}

function SubjectTags({ subjects }: { subjects: string[] | null }) {
  const list = (subjects ?? []).filter(Boolean).slice(0, 2);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-center mt-1">
      {list.map((s) => (
        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-primary">
          {s}
        </span>
      ))}
    </div>
  );
}

function PodiumCard({
  teacher,
  podiumIndex,
  size,
  currentProfileId,
  followingMap,
}: {
  teacher: LeaderboardTeacher;
  /** 0 = gold (1st), 1 = silver (2nd), 2 = bronze (3rd) */
  podiumIndex: 0 | 1 | 2;
  size: 'lg' | 'md';
  currentProfileId: string | null;
  followingMap: Record<string, boolean>;
}) {
  const ring = PODIUM_COLOR[podiumIndex];
  const avatarSize = size === 'lg' ? 64 : 56;
  const showFollow =
    currentProfileId && teacher.id !== currentProfileId;

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center px-2',
        size === 'lg' && 'scale-105 z-10',
      )}
    >
      <div
        className="rounded-full p-1"
        style={{ boxShadow: `0 0 0 4px ${ring}` }}
      >
        {teacher.avatar_url ? (
          <Image
            src={teacher.avatar_url}
            alt={teacher.display_name}
            width={avatarSize}
            height={avatarSize}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            className="rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600"
            style={{ width: avatarSize, height: avatarSize }}
          >
            {teacher.display_name?.charAt(0) ?? '?'}
          </div>
        )}
      </div>
      <p className="font-semibold text-text-primary mt-2 text-sm line-clamp-1 max-w-[140px]">
        {teacher.display_name}
      </p>
      <p className="text-xs text-text-secondary">#{teacher.username}</p>
      <p className="text-sm font-medium mt-1">
        🛡 {teacher.shield_count}
      </p>
      <span
        className="mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
        style={{
          backgroundColor:
            SHIELD_RANK_COLOR[teacher.shield_rank ?? 'beginner'] ?? SHIELD_RANK_COLOR.beginner,
        }}
      >
        {teacher.shield_rank ?? 'beginner'}
      </span>
      <SubjectTags subjects={teacher.subjects} />
      <Link
        href={`/profile/${encodeURIComponent(teacher.username)}`}
        className="text-xs text-primary mt-2 hover:underline"
      >
        Xem hồ sơ
      </Link>
      {showFollow && (
        <div className="mt-2">
          <ProfileFollowButton
            targetProfileId={teacher.id}
            initialFollowing={!!followingMap[teacher.id]}
          />
        </div>
      )}
    </div>
  );
}

export default function LeaderboardClient({
  teachers,
  currentProfileId,
  followingMap,
}: Props) {
  const top3 = teachers.slice(0, 3);
  const rest = teachers.slice(3);

  return (
    <div>
      <header className="text-center mb-10">
        <p className="text-4xl mb-2">🏆</p>
        <h1 className="text-2xl font-bold text-text-primary">Bảng xếp hạng Giáo viên</h1>
        <p className="text-text-secondary mt-2 text-sm md:text-base">
          Dựa trên Shield tích lũy từ bài đăng giáo dục
        </p>
      </header>

      {teachers.length === 0 ? (
        <p className="text-center text-text-secondary py-16">
          Chưa có giáo viên nào trong bảng xếp hạng
        </p>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-8 mb-12">
              {top3[1] && (
                <div className="order-2 md:order-1 flex justify-center w-full md:w-auto">
                  <PodiumCard
                    teacher={top3[1]}
                    podiumIndex={1}
                    size="md"
                    currentProfileId={currentProfileId}
                    followingMap={followingMap}
                  />
                </div>
              )}
              {top3[0] && (
                <div className="order-1 md:order-2 flex justify-center w-full md:w-auto">
                  <PodiumCard
                    teacher={top3[0]}
                    podiumIndex={0}
                    size="lg"
                    currentProfileId={currentProfileId}
                    followingMap={followingMap}
                  />
                </div>
              )}
              {top3[2] && (
                <div className="order-3 flex justify-center w-full md:w-auto">
                  <PodiumCard
                    teacher={top3[2]}
                    podiumIndex={2}
                    size="md"
                    currentProfileId={currentProfileId}
                    followingMap={followingMap}
                  />
                </div>
              )}
            </div>
          )}

          <ul className="space-y-0 rounded-card border border-gray-100 overflow-hidden">
            {rest.map((t, i) => {
              const rank = i + 4;
              const bg = i % 2 === 0 ? 'bg-white' : 'bg-surface';
              const showFollow =
                currentProfileId && t.id !== currentProfileId;
              return (
                <li key={t.id} className={cn('border-b border-gray-100 last:border-0', bg)}>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <span className="w-8 text-sm font-semibold text-text-secondary shrink-0">
                      #{rank}
                    </span>
                    <Link
                      href={`/profile/${encodeURIComponent(t.username)}`}
                      className="flex flex-1 items-center gap-3 min-w-0 hover:opacity-90"
                    >
                      {t.avatar_url ? (
                        <Image
                          src={t.avatar_url}
                          alt=""
                          width={48}
                          height={48}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0">
                          {t.display_name?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-primary truncate">
                          {t.display_name}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          #{t.username}
                          {(t.subjects ?? []).slice(0, 2).length > 0 && (
                            <>
                              {' '}
                              · {(t.subjects ?? []).slice(0, 2).join(' · ')}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-medium shrink-0">🛡 {t.shield_count}</span>
                      <span
                        className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize shrink-0"
                        style={{
                          backgroundColor:
                            SHIELD_RANK_COLOR[t.shield_rank ?? 'beginner'] ??
                            SHIELD_RANK_COLOR.beginner,
                        }}
                      >
                        {t.shield_rank ?? 'beginner'}
                      </span>
                    </Link>
                    {showFollow && (
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <ProfileFollowButton
                          targetProfileId={t.id}
                          initialFollowing={!!followingMap[t.id]}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-10 p-4 rounded-card bg-blue-50 border border-blue-100 text-sm text-text-primary">
        <p className="font-semibold mb-2">💡 Cách tích lũy Shield:</p>
        <ul className="list-disc list-inside space-y-1 text-text-secondary">
          <li>+5 Shield mỗi bài đăng giáo dục (có môn học)</li>
          <li>+1 Shield mỗi bài đăng thông thường</li>
          <li>+1 Shield mỗi lượt bình luận nhận được</li>
        </ul>
      </div>
    </div>
  );
}
