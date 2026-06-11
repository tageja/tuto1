import { createSupabaseServerClient } from '@/lib/supabase-server';
import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Bảng xếp hạng Giáo viên | tuto.social',
  description:
    'Top giáo viên được đánh giá cao nhất trên tuto.social dựa trên Shield tích lũy.',
};

export interface LeaderboardTeacher {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  shield_count: number;
  shield_rank: string;
  subjects: string[] | null;
  is_verified: boolean;
  follower_count: number;
}

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: teacherRows, error: teacherError } = await supabase
    .from('social_profiles')
    .select(
      'id, username, display_name, avatar_url, shield_count, shield_rank, subjects, is_verified, follower_count',
    )
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(50);

  if (teacherError) {
    console.error('[LeaderboardPage] query error:', teacherError.message);
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Không thể tải bảng xếp hạng</p>
          <p className="text-sm text-gray-400">{teacherError.message}</p>
        </div>
      </main>
    );
  }

  const teachers = (teacherRows ?? []) as LeaderboardTeacher[];

  const { data: { user } } = await supabase.auth.getUser();

  let currentProfileId: string | null = null;
  const followingMap: Record<string, boolean> = {};

  if (user) {
    const { data: myProfile } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (myProfile) {
      currentProfileId = myProfile.id as string;
      const ids = teachers.map((t) => t.id).filter((id) => id !== currentProfileId);
      if (ids.length > 0) {
        const { data: follows } = await supabase
          .from('social_follows')
          .select('following_id')
          .eq('follower_id', currentProfileId)
          .in('following_id', ids);
        for (const f of follows ?? []) {
          followingMap[f.following_id as string] = true;
        }
      }
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <LeaderboardClient
        teachers={teachers}
        currentProfileId={currentProfileId}
        followingMap={followingMap}
      />
    </main>
  );
}
