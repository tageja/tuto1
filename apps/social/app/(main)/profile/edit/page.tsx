import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import EditProfileClient from './EditProfileClient';

export const metadata: Metadata = {
  title: 'Chỉnh sửa hồ sơ | tuto.social',
};

export default async function EditProfilePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileRow, error } = await supabase
    .from('social_profiles')
    .select('id, user_id, username, display_name, bio, avatar_url, cover_url, role, is_verified, follower_count, following_count, post_count, school_id, shield_count, subjects')
    .eq('user_id', user.id)
    .single();

  if (error || !profileRow) redirect('/login');

  const profile = {
    id: profileRow.id,
    userId: profileRow.user_id,
    username: profileRow.username,
    displayName: (profileRow.display_name as string) ?? '',
    bio: (profileRow.bio as string) ?? '',
    avatarUrl: profileRow.avatar_url ?? undefined,
    coverUrl: profileRow.cover_url ?? undefined,
    role: (profileRow.role as string) ?? 'guest',
    isVerified: (profileRow.is_verified as boolean) ?? false,
    followerCount: (profileRow.follower_count as number) ?? 0,
    followingCount: (profileRow.following_count as number) ?? 0,
    postCount: (profileRow.post_count as number) ?? 0,
    schoolName: undefined,
    shieldCount: (profileRow.shield_count as number) ?? 0,
    subjects: (profileRow.subjects as string[]) ?? [],
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <EditProfileClient profile={profile} />
    </main>
  );
}
