import { createSupabaseServerClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePostGrid from '@/components/profile/ProfilePostGrid';
import type { SocialProfile } from '@/components/profile/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

const PROFILE_QUERY = `
  id,
  user_id,
  username,
  display_name,
  bio,
  avatar_url,
  cover_url,
  role,
  is_verified,
  follower_count,
  following_count,
  post_count,
  shield_count,
  school_id
`;

function mapRowToProfile(row: Record<string, unknown>, schoolName?: string): SocialProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    username: row.username as string,
    displayName: (row.display_name as string) ?? '',
    bio: row.bio as string | undefined,
    avatarUrl: row.avatar_url as string | undefined,
    coverUrl: row.cover_url as string | undefined,
    role: (row.role as string) ?? 'guest',
    isVerified: (row.is_verified as boolean) ?? false,
    followerCount: (row.follower_count as number) ?? 0,
    followingCount: (row.following_count as number) ?? 0,
    postCount: (row.post_count as number) ?? 0,
    schoolName,
    schoolId: row.school_id as string | undefined,
    shieldCount: (row.shield_count as number) ?? 0,
    subjects: (row.subjects as string[] | undefined) ?? [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rawUsername = (await params).username;
  const username = typeof rawUsername === 'string' ? decodeURIComponent(rawUsername).trim() : '';
  if (!username) return { title: 'Profile | tuto.social' };
  const supabase = await createSupabaseServerClient();

  const { data: row } = await supabase
    .from('social_profiles')
    .select('display_name')
    .ilike('username', username)
    .maybeSingle();

  const displayName = (row?.display_name as string) ?? username;
  return {
    title: `${displayName} | tuto.social`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const rawUsername = (await params).username;
  const username = typeof rawUsername === 'string' ? decodeURIComponent(rawUsername).trim() : '';
  if (!username) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Use ilike for case-insensitive match (URL may have different casing than DB)
  const { data: row } = await supabase
    .from('social_profiles')
    .select(PROFILE_QUERY)
    .ilike('username', username)
    .maybeSingle();

  if (!row) notFound();

  const r = row as Record<string, unknown>;
  let schoolName: string | undefined;
  if (r.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name')
      .eq('id', r.school_id)
      .single();
    schoolName = school?.name as string | undefined;
  }
  const profile = mapRowToProfile(r, schoolName);

  const { data: myProfile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const isOwnProfile = myProfile?.id === profile.id;

  let initialFollowing = false;
  if (!isOwnProfile && myProfile) {
    const { data: followRow } = await supabase
      .from('social_follows')
      .select('id')
      .eq('follower_id', myProfile.id)
      .eq('following_id', profile.id)
      .single();
    initialFollowing = !!followRow;
  }

  const { data: postRows } = await supabase
    .from('social_posts')
    .select('id, post_type, content, media_urls, like_count, applaud_count, curious_count, comments_count, achievement')
    .eq('author_id', profile.id)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(30);

  const posts = (postRows ?? []).map((p) => ({
    id: p.id,
    postType: p.post_type ?? 'text',
    content: p.content ?? '',
    mediaUrls: p.media_urls ?? [],
    reactions: {
      like: p.like_count ?? 0,
      applaud: p.applaud_count ?? 0,
      curious: p.curious_count ?? 0,
    },
    commentsCount: p.comments_count ?? 0,
    achievement: p.achievement,
  }));

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        initialFollowing={initialFollowing}
        myProfileId={myProfile?.id ?? null}
      />

      {/* Stats row */}
      <div className="flex gap-8 py-4 border-b border-gray-200">
        <span className="text-sm text-gray-600">
          <strong className="text-gray-900">{profile.postCount}</strong> Bài viết
        </span>
        <Link
          href={`/profile/${encodeURIComponent(profile.username)}/followers`}
          className="text-sm text-gray-600 hover:text-[#0B5FFF]"
        >
          <strong className="text-gray-900">{profile.followerCount}</strong> Người theo dõi
        </Link>
        <Link
          href={`/profile/${encodeURIComponent(profile.username)}/following`}
          className="text-sm text-gray-600 hover:text-[#0B5FFF]"
        >
          <strong className="text-gray-900">{profile.followingCount}</strong> Đang theo dõi
        </Link>
      </div>

      {/* Post grid */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bài viết</h2>
        <ProfilePostGrid posts={posts} />
      </div>
    </main>
  );
}
