import { createServerClient } from '@supabase/ssr';
import { cookies }             from 'next/headers';
import { notFound, redirect }  from 'next/navigation';
import FeedPost                from '../../../../components/feed/FeedPost';
import CommentSection          from '../../../../components/feed/CommentSection';
import type { Metadata }       from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Bài viết · Tuto Social',
  };
}

export default async function PostDetailPage({ params }: Props) {
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

  const { data: row, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !row) notFound();

  const a = row.author as Record<string, unknown> ?? {};

  const post = {
    id:               row.id,
    postType:         row.post_type,
    content:          row.content ?? '',
    mediaUrls:        row.media_urls ?? [],
    subjects:         row.subjects   ?? [],
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
      id:          (a.id as string) ?? '',
      displayName: (a.display_name as string) ?? 'Unknown',
      avatarUrl:   a.avatar_url as string | undefined,
      role:        (a.role as string) ?? 'guest',
      verified:    (a.is_verified as boolean) ?? false,
    },
    event:       row.event,
    assignment:  row.assignment,
    poll:        row.poll,
    achievement: row.achievement,
    createdAt:   row.created_at,
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <FeedPost post={post as never} />

      <div className="card mt-4">
        <CommentSection postId={params.id} />
      </div>
    </main>
  );
}
