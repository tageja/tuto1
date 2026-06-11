'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherProfile {
  id:           string;
  username:     string;
  display_name: string;
  avatar_url:   string | null;
  shield_count: number;
  shield_rank:  string | null;
  bio:          string | null;
  is_verified:  boolean;
}

function FollowButton({ profileId }: { profileId: string }) {
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const { data: myProfile } = await supabase
        .from('social_profiles').select('id').eq('user_id', user.id).single();
      if (!myProfile) return;

      if (following) {
        await supabase.from('social_follows')
          .delete().eq('follower_id', myProfile.id).eq('following_id', profileId);
        setFollowing(false);
      } else {
        await supabase.from('social_follows')
          .upsert({ follower_id: myProfile.id, following_id: profileId }, { onConflict: 'follower_id,following_id' });
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0',
        following
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-primary text-white hover:bg-blue-700',
      ].join(' ')}
    >
      {following ? 'Đang theo dõi' : 'Theo dõi'}
    </button>
  );
}

export default function SuggestedTeachers({ schoolId }: { schoolId?: string }) {
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from('social_profiles')
        .select('id, username, display_name, avatar_url, shield_count, shield_rank, bio, is_verified')
        .eq('role', 'teacher')
        .order('shield_count', { ascending: false })
        .limit(3);

      if (schoolId) query = query.eq('school_id', schoolId);

      const { data } = await query;
      setTeachers((data ?? []) as TeacherProfile[]);
    })();
  }, [supabase, schoolId]);

  if (teachers.length === 0) return null;

  return (
    <div className="card my-3">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Giáo viên bạn có thể theo dõi</h3>
      <div className="space-y-3">
        {teachers.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <Link href={`/profile/${encodeURIComponent(t.username ?? t.id)}`}>
              {t.avatar_url ? (
                <Image
                  src={t.avatar_url}
                  alt={t.display_name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                  {t.display_name.charAt(0)}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${encodeURIComponent(t.username ?? t.id)}`}>
                <p className="text-sm font-semibold text-gray-900 hover:underline truncate">
                  {t.display_name}
                  {t.is_verified && <span className="text-primary ml-1">✓</span>}
                </p>
              </Link>
              <p className="text-xs text-gray-500">
                🛡 {t.shield_count} Shields
                {t.bio && ` · ${t.bio.slice(0, 40)}${t.bio.length > 40 ? '…' : ''}`}
              </p>
            </div>
            {user && <FollowButton profileId={t.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
