import { createSupabaseServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import SchoolProfileClient from './SchoolProfileClient';
import ProfileFollowButton from '@/components/profile/FollowButton';

interface Props {
  params: Promise<{ schoolId: string }>;
}

const FULL_POST_QUERY = `
  id, content, post_type, is_pinned, created_at, like_count, applaud_count, curious_count,
  comments_count, saves_count, media_urls, subjects, event, achievement, moderation_status,
  author:social_profiles!social_posts_author_id_fkey(
    id, username, display_name, avatar_url, role, is_verified, school_id
  )
`;

function mapToFeedPost(row: Record<string, unknown>) {
  const a = (row.author ?? {}) as Record<string, unknown>;
  return {
    id:               row.id as string,
    postType:         row.post_type as string,
    content:          (row.content as string) ?? '',
    mediaUrls:        (row.media_urls as string[]) ?? [],
    subjects:         (row.subjects as string[]) ?? [],
    moderationStatus: (row.moderation_status as string),
    reactions: {
      like:    (row.like_count as number)    ?? 0,
      applaud: (row.applaud_count as number) ?? 0,
      curious: (row.curious_count as number) ?? 0,
    },
    commentsCount: (row.comments_count as number) ?? 0,
    savesCount:    (row.saves_count as number)    ?? 0,
    isPinned:      (row.is_pinned as boolean)     ?? false,
    author: {
      id:          (a.id as string) ?? '',
      username:    (a.username as string) ?? '',
      displayName: (a.display_name as string) || 'Tác giả',
      avatarUrl:   a.avatar_url as string | undefined,
      role:        (a.role as string) || 'parent',
      verified:    (a.is_verified as boolean) ?? false,
      schoolId:    a.school_id as string | undefined,
    },
    event:       (row.event as { title: string; date: string; location?: string; rsvpCount: number } | null),
    assignment:  null,
    poll:        null,
    achievement: row.achievement as Record<string, unknown> | null,
    createdAt:   row.created_at as string,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { schoolId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: school } = await supabase
    .from('schools')
    .select('name')
    .eq('id', schoolId)
    .maybeSingle();
  return {
    title: `${school?.name ?? 'Trường học'} | tuto.social`,
  };
}

export default async function SchoolProfilePage({ params }: Props) {
  const { schoolId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // School admin profile (for cover/bio/follower_count)
  const { data: adminRow } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, bio, avatar_url, cover_url, is_verified, follower_count, post_count, school_id')
    .eq('school_id', schoolId)
    .in('role', ['schoolAdmin', 'school_admin'])
    .maybeSingle();

  if (!adminRow) notFound();

  // School basic info
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, address')
    .eq('id', schoolId)
    .maybeSingle();

  // School branding (cover/logo)
  const { data: branding } = await supabase
    .from('school_branding')
    .select('logo_url, header_url')
    .eq('school_id', schoolId)
    .maybeSingle();

  const admin      = adminRow as Record<string, unknown>;
  const schoolName = (admin.display_name as string) || school?.name || 'Trường học';
  const coverUrl   = (admin.cover_url as string | null) ?? branding?.header_url ?? null;
  const logoUrl    = (admin.avatar_url as string | null) ?? branding?.logo_url ?? null;

  // Check if current user follows this school
  let initialFollowing = false;
  if (user) {
    const { data: myProfile } = await supabase
      .from('social_profiles').select('id').eq('user_id', user.id).single();
    if (myProfile) {
      const { data: followRow } = await supabase
        .from('social_follows').select('id')
        .eq('follower_id', myProfile.id).eq('following_id', admin.id as string).maybeSingle();
      initialFollowing = !!followRow;
    }
  }

  // Staff (teachers)
  const { data: staffRows } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, shield_count, shield_rank, is_verified')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(20);

  // All posts for this school (Bài viết tab)
  const { data: postRows } = await supabase
    .from('social_posts')
    .select(FULL_POST_QUERY)
    .eq('school_id', schoolId)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  // Event posts (Sự kiện tab)
  const { data: eventRows } = await supabase
    .from('social_posts')
    .select(FULL_POST_QUERY)
    .eq('school_id', schoolId)
    .eq('post_type', 'event')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(20);

  // Photo posts (Ảnh tab)
  const { data: photoRows } = await supabase
    .from('social_posts')
    .select(FULL_POST_QUERY)
    .eq('school_id', schoolId)
    .eq('post_type', 'photo')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(30);

  const staffCount = staffRows?.length ?? 0;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      {/* Cover */}
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden -mx-4 mt-4">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B5FFF] to-[#6366F1]" />
        )}
      </div>

      {/* Avatar + header */}
      <div className="relative -mt-9 px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative h-[72px] w-[72px] rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt={schoolName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white text-2xl font-bold">
                  {schoolName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {schoolName}
                {(admin.is_verified as boolean) && (
                  <span className="text-primary" title="Đã xác minh">✓</span>
                )}
              </h1>
              {(admin.bio as string) && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{admin.bio as string}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <strong>{admin.post_count as number ?? 0}</strong> bài viết ·{' '}
                <strong>{(admin.follower_count as number ?? 0).toLocaleString('vi-VN')}</strong> người theo dõi ·{' '}
                <strong>{staffCount}</strong> giáo viên
              </p>
            </div>
          </div>
          <ProfileFollowButton targetProfileId={admin.id as string} initialFollowing={initialFollowing} />
        </div>
      </div>

      <SchoolProfileClient
        posts={(postRows ?? []).map((r) => mapToFeedPost(r as Record<string, unknown>))}
        staff={(staffRows ?? []) as never[]}
        achievements={[]}
        events={(eventRows ?? []).map((r) => mapToFeedPost(r as Record<string, unknown>))}
        photos={(photoRows ?? []).map((r) => mapToFeedPost(r as Record<string, unknown>))}
        schoolInfo={{
          name:    schoolName,
          bio:     admin.bio as string | null,
          address: school?.address ?? null,
        }}
      />
    </main>
  );
}
