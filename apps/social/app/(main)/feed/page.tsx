import { createServerClient }  from '@supabase/ssr';
import { cookies }              from 'next/headers';
import { redirect }             from 'next/navigation';
import FeedContainer            from '../../../components/feed/FeedContainer';
import type { Metadata }        from 'next';

export const metadata: Metadata = {
  title:       'Cộng đồng Tuto',
  description: 'Chia sẻ thành tích học tập, sự kiện và cập nhật từ trường của bạn.',
};

// Columns explicitly selected for SSR hydration
const POST_QUERY = `
  *,
  author:social_profiles!social_posts_author_id_fkey(
    id, user_id, username, display_name, avatar_url, role, is_verified
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch initial posts server-side (school + public, approved only)
  const { data: rows } = await supabase
    .from('social_posts')
    .select(POST_QUERY)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(20);

  // Map DB rows to the shape FeedContainer expects
  const initialPosts = (rows ?? []).map((row) => {
    const a = row.author as Record<string, unknown> ?? {};
    return {
      id:               row.id,
      postType:         row.post_type,
      content:          row.content ?? '',
      mediaUrls:        row.media_urls ?? [],
      subjects:         row.subjects ?? [],
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
        displayName: a.display_name ?? 'Unknown',
        avatarUrl:   a.avatar_url,
        role:        a.role ?? 'guest',
        verified:    a.is_verified ?? false,
      },
      event:       row.event,
      assignment:  row.assignment,
      poll:        row.poll,
      achievement: row.achievement,
      createdAt:   row.created_at,
    };
  });

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <FeedContainer initialPosts={initialPosts as never} />
    </main>
  );
}
