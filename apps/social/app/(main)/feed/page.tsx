import { createServerClient }  from '@supabase/ssr';
import { cookies }              from 'next/headers';
import FeedContainer            from '../../../components/feed/FeedContainer';
import StoryBar                 from '../../../components/stories/StoryBar';
import LeftRail                 from '../../../components/layout/LeftRail';
import RightRail                from '../../../components/layout/RightRail';
import MobileTabBar             from '../../../components/layout/MobileTabBar';
import FeedComposerWrapper      from '../../../components/feed/FeedComposerWrapper';
import type { Metadata }        from 'next';

export const metadata: Metadata = {
  title:       'Cộng đồng Tuto',
  description: 'Chia sẻ thành tích học tập, sự kiện và cập nhật từ trường của bạn.',
};

const POST_QUERY = `
  *,
  author:social_profiles!social_posts_author_id_fkey(
    id, user_id, username, display_name, avatar_url, role, is_verified, school_id
  )
`;

export default async function FeedPage() {
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

  const { data: rows } = await supabase
    .from('social_posts')
    .select(POST_QUERY)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(20);

  const initialPosts = (rows ?? []).map((row) => {
    const a = row.author as Record<string, unknown> ?? {};
    return {
      id:               row.id,
      postType:         row.post_type,
      content:          row.content ?? '',
      mediaUrls:        row.media_urls ?? [],
      subjects:         (row.subjects ?? []).filter((s: string) => s.trim().length > 0),
      location:         row.location,
      moderationStatus: row.moderation_status,
      reactions: {
        like:    row.like_count    ?? 0,
        applaud: row.applaud_count ?? 0,
        curious: row.curious_count ?? 0,
      },
      commentsCount: row.comments_count ?? 0,
      savesCount:    row.saves_count    ?? 0,
      isPinned:      row.is_pinned      ?? false,
      author: {
        id:          a.id ?? '',
        username:    a.username ?? '',
        displayName: (a.display_name as string) || 'Tác giả',
        avatarUrl:   a.avatar_url,
        role:        (a.role as string) || 'parent',
        verified:    a.is_verified ?? false,
        schoolId:    a.school_id as string | undefined,
      },
      event:       row.event,
      assignment:  row.assignment,
      poll:        row.poll,
      achievement: row.achievement,
      createdAt:   row.created_at,
    };
  });

  return (
    <>
      {/* 3-column layout */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,600px)_320px] lg:gap-6 lg:justify-center">
          {/* Left rail */}
          <LeftRail />

          {/* Center feed */}
          <main className="min-w-0">
            <StoryBar />
            <FeedComposerWrapper />
            <FeedContainer initialPosts={initialPosts as never} />
          </main>

          {/* Right rail */}
          <RightRail />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </>
  );
}
