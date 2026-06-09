'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProfileFollowButton from './FollowButton';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { SocialProfile } from './types';

const ROLE_GRADIENTS: Record<string, string> = {
  student:    'from-[#0B5FFF] to-[#6366F1]',
  teacher:    'from-[#6366F1] to-[#8B5CF6]',
  parent:     'from-[#10B981] to-[#0B5FFF]',
  schoolAdmin: 'from-[#F59E0B] to-[#F97316]',
  coach:      'from-[#06B6D4] to-[#0B5FFF]',
  institute:  'from-[#EC4899] to-[#8B5CF6]',
  guest:      'from-[#9CA3AF] to-[#6B7280]',
};

interface Props {
  profile: SocialProfile;
  isOwnProfile: boolean;
  initialFollowing?: boolean;
  /** Current viewer's `social_profiles.id` (for starting a DM). */
  myProfileId?: string | null;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  initialFollowing = false,
  myProfileId = null,
}: Props) {
  const router = useRouter();
  const [msgLoading, setMsgLoading] = useState(false);
  const gradient = ROLE_GRADIENTS[profile.role] ?? ROLE_GRADIENTS.guest;

  async function handleMessage() {
    if (!myProfileId || msgLoading || myProfileId === profile.id) return;
    setMsgLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: myRows } = await supabase
        .from('social_conversation_participants')
        .select('conversation_id')
        .eq('profile_id', myProfileId);

      const myConvIds = myRows?.map((r) => r.conversation_id as string) ?? [];

      if (myConvIds.length > 0) {
        const { data: shared } = await supabase
          .from('social_conversation_participants')
          .select('conversation_id, conversation:social_conversations(type)')
          .eq('profile_id', profile.id)
          .in('conversation_id', myConvIds);

        const existing1on1 = shared?.find((r) => {
          const raw = r.conversation as { type: string } | { type: string }[] | null;
          const c = Array.isArray(raw) ? raw[0] : raw;
          return c?.type === '1:1';
        });

        if (existing1on1?.conversation_id) {
          router.push(`/messages/${existing1on1.conversation_id}`);
          return;
        }
      }

      const { data: newConv, error: cErr } = await supabase
        .from('social_conversations')
        .insert({ type: '1:1', created_by: myProfileId })
        .select('id')
        .single();

      if (cErr || !newConv?.id) return;

      const convId = newConv.id as string;
      const { error: pErr } = await supabase.from('social_conversation_participants').insert([
        { conversation_id: convId, profile_id: myProfileId },
        { conversation_id: convId, profile_id: profile.id },
      ]);
      if (!pErr) router.push(`/messages/${convId}`);
    } finally {
      setMsgLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Cover */}
      <div className={`relative h-40 lg:h-56 w-full bg-gradient-to-r ${gradient}`}>
        {profile.coverUrl && (
          <Image
            src={profile.coverUrl}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-16 left-6 lg:left-10">
        <div className="relative h-32 w-32 lg:h-40 lg:w-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={profile.displayName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-4xl font-bold text-gray-500">
              {profile.displayName?.charAt(0) ?? '?'}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 lg:px-10 pt-20 lg:pt-24 pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {profile.displayName}
              </h1>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{
                  backgroundColor:
                    profile.role === 'teacher'
                      ? '#8B5CF6'
                      : profile.role === 'student'
                        ? '#0B5FFF'
                        : profile.role === 'parent'
                          ? '#10B981'
                          : '#6B7280',
                }}
              >
                @{profile.username}
              </span>
            </div>
            {profile.schoolName && (
              <p className="text-sm text-gray-500 mb-2">{profile.schoolName}</p>
            )}
            {profile.role === 'school_admin' && profile.schoolId && (
              <Link
                href={`/school/${profile.schoolId}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                Xem trang trường →
              </Link>
            )}
            {profile.bio && (
              <p className="text-sm text-gray-600 max-w-2xl">{profile.bio}</p>
            )}
            {profile.subjects && profile.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.subjects.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
                  >
                    #{s}
                  </span>
                ))}
              </div>
            )}
            {profile.role === 'teacher' && profile.shieldCount > 0 && (
              <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                🛡️ {profile.shieldCount} Tích điểm
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-6 py-2.5 rounded-xl border border-[#0B5FFF] text-[#0B5FFF] font-medium hover:bg-blue-50 transition-colors"
              >
                Chỉnh sửa hồ sơ
              </Link>
            ) : (
              <>
                <ProfileFollowButton targetProfileId={profile.id} initialFollowing={initialFollowing} />
                <button
                  type="button"
                  onClick={() => void handleMessage()}
                  disabled={!myProfileId || msgLoading}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {msgLoading ? 'Đang mở…' : 'Nhắn tin'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
