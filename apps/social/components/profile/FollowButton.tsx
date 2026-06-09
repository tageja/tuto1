'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface Props {
  targetProfileId: string;
  initialFollowing?: boolean;
}

export default function ProfileFollowButton({
  targetProfileId,
  initialFollowing = false,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const prev = following;
    setFollowing(!following);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myProfile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!myProfile) {
        setFollowing(prev);
        return;
      }

      if (following) {
        await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', myProfile.id)
          .eq('following_id', targetProfileId);
      } else {
        await supabase.from('social_follows').insert({
          follower_id: myProfile.id,
          following_id: targetProfileId,
        });
      }
    } catch {
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        following
          ? 'px-6 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors'
          : 'px-6 py-2.5 rounded-xl bg-[#0B5FFF] text-white font-medium hover:bg-[#0952E0] transition-colors'
      }
    >
      {loading ? '...' : following ? 'Đang theo dõi' : 'Theo dõi'}
    </button>
  );
}
