import { createSupabaseServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import SchoolProfileClient from './SchoolProfileClient';
import ProfileFollowButton from '@/components/profile/FollowButton';

interface Props {
  params: Promise<{ schoolId: string }>;
}

interface SchoolAdminRow {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_verified: boolean;
  follower_count: number;
  post_count: number;
  school_id: string;
}

interface StaffRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  shield_count: number;
  shield_rank: string | null;
  is_verified: boolean;
}

interface AnnouncementRow {
  id: string;
  content: string;
  post_type: string;
  is_pinned: boolean;
  created_at: string;
  like_count: number;
  comments_count: number;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    is_verified: boolean;
  } | null;
}

interface AchievementRow {
  id: string;
  content: string;
  post_type: string;
  created_at: string;
  like_count: number;
  achievement: Record<string, unknown> | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    is_verified: boolean;
  } | null;
}

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#6B7280',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

function mapAnnouncementToFeedPost(row: AnnouncementRow) {
  const a = (row.author ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    postType: row.post_type,
    content: row.content ?? '',
    mediaUrls: [] as string[],
    subjects: [] as string[],
    moderationStatus: 'ai_reviewed',
    reactions: { like: row.like_count ?? 0, applaud: 0, curious: 0 },
    commentsCount: row.comments_count ?? 0,
    savesCount: 0,
    isPinned: row.is_pinned ?? false,
    author: {
      id: (a.id as string) ?? '',
      displayName: (a.display_name as string) ?? 'Unknown',
      avatarUrl: a.avatar_url as string | undefined,
      role: (a.role as string) ?? 'guest',
      verified: (a.is_verified as boolean) ?? false,
      username: (a.username as string) ?? undefined,
    },
    event: null,
    assignment: null,
    poll: null,
    achievement: null,
    createdAt: row.created_at,
  };
}

function mapAchievementToCard(row: AchievementRow) {
  const a = (row.author ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    content: row.content ?? '',
    achievement: row.achievement,
    authorDisplayName: (a.display_name as string) ?? 'Unknown',
    createdAt: row.created_at,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { schoolId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from('social_profiles')
    .select('display_name, bio')
    .eq('school_id', schoolId)
    .eq('role', 'school_admin')
    .maybeSingle();

  if (!row) return { title: 'School | tuto.social' };
  const name = (row.display_name as string) ?? 'School';
  const bio = (row.bio as string) ?? '';
  return {
    title: `${name} | tuto.social`,
    description: bio || undefined,
  };
}

export default async function SchoolProfilePage({ params }: Props) {
  const { schoolId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: schoolAdminRow } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, bio, avatar_url, cover_url, is_verified, follower_count, post_count, school_id')
    .eq('school_id', schoolId)
    .eq('role', 'school_admin')
    .maybeSingle();

  if (!schoolAdminRow) notFound();

  const admin = schoolAdminRow as unknown as SchoolAdminRow;
  const schoolName = admin.display_name ?? 'Trường học';

  let initialFollowing = false;
  if (user) {
    const { data: myProfile } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (myProfile) {
      const { data: followRow } = await supabase
        .from('social_follows')
        .select('id')
        .eq('follower_id', myProfile.id)
        .eq('following_id', admin.id)
        .maybeSingle();
      initialFollowing = !!followRow;
    }
  }

  const { data: staffRows } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, shield_count, shield_rank, is_verified')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(20);

  const { data: announcementRows } = await supabase
    .from('social_posts')
    .select(`
      id, content, post_type, is_pinned, created_at, like_count, comments_count,
      author:social_profiles!social_posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'announcement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: achievementRows } = await supabase
    .from('social_posts')
    .select(`
      id, content, post_type, created_at, like_count, achievement,
      author:social_profiles!social_posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'achievement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(6);

  const staffCount = staffRows?.length ?? 0;
  const announcements = (announcementRows ?? []).map((r) => mapAnnouncementToFeedPost(r as unknown as AnnouncementRow));
  const achievements = (achievementRows ?? []).map((r) => mapAchievementToCard(r as unknown as AchievementRow));
  const staff = (staffRows ?? []) as StaffRow[];

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      {/* Cover */}
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden -mx-4 mt-4">
        {admin.cover_url ? (
          <Image src={admin.cover_url} alt="" fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B5FFF] to-[#6366F1]" />
        )}
      </div>

      {/* Avatar + header */}
      <div className="relative -mt-9 px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative h-[72px] w-[72px] rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {admin.avatar_url ? (
                <Image src={admin.avatar_url} alt={schoolName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-2xl font-bold text-gray-500">
                  {schoolName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {schoolName}
                {admin.is_verified && (
                  <span className="text-primary" title="Đã xác minh">
                    ✓
                  </span>
                )}
              </h1>
              {admin.bio && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-3" id="school-bio">
                  {admin.bio}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <strong>{admin.post_count ?? 0}</strong> bài viết · <strong>{admin.follower_count ?? 0}</strong> người theo dõi · <strong>{staffCount}</strong> giáo viên
              </p>
            </div>
          </div>
          <ProfileFollowButton targetProfileId={admin.id} initialFollowing={initialFollowing} />
        </div>
      </div>

      <SchoolProfileClient
        announcements={announcements}
        staff={staff}
        achievements={achievements}
      />
    </main>
  );
}
