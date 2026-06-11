import { createServerClient } from '@supabase/ssr';
import { cookies }             from 'next/headers';
import { notFound }            from 'next/navigation';
import FeedPost                from '../../../../components/feed/FeedPost';
import CommentSection          from '../../../../components/feed/CommentSection';
import type { Metadata }       from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchPost(id: string) {
  try {
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

    const { data: row, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        author:social_profiles!social_posts_author_id_fkey(
          id, user_id, username, display_name, avatar_url, role, is_verified, school_id
        )
      `)
      .eq('id', id)
      .single();

    if (error || !row) return null;
    return row;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchPost(id);
  if (!row) return { title: 'Bài viết · Tuto Social' };

  const a = (Array.isArray(row.author) ? row.author[0] : row.author) as Record<string, unknown> | null ?? {};
  const authorName = (a.display_name as string) ?? 'Tuto Social';
  const excerpt = ((row.content as string) ?? '').slice(0, 160);

  return {
    title: `${authorName} · Tuto Social`,
    description: excerpt || 'Xem bài viết trên tuto.social',
    openGraph: {
      title: `${authorName} · Tuto Social`,
      description: excerpt || 'Xem bài viết trên tuto.social',
      images: (row.media_urls as string[] | null)?.[0]
        ? [{ url: (row.media_urls as string[])[0] }]
        : [{ url: '/images/tuto-logo.png' }],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;

  // Community-first: post detail is public (anon-read RLS). Interactions are
  // gated client-side via the auth-gate modal.
  const row = await fetchPost(id);
  if (!row) notFound();

  const a = (Array.isArray(row!.author) ? row!.author[0] : row!.author) as Record<string, unknown> | null ?? {};

  const post = {
    id:               row!.id as string,
    postType:         (row!.post_type as string) ?? 'text',
    content:          (row!.content as string) ?? '',
    mediaUrls:        (row!.media_urls as string[]) ?? [],
    subjects:         ((row!.subjects as string[]) ?? []).filter((s: string) => s.trim().length > 0),
    location:         row!.location as string | undefined,
    moderationStatus: (row!.moderation_status as string) ?? 'pending',
    reactions: {
      like:    (row!.like_count    as number) ?? 0,
      applaud: (row!.applaud_count as number) ?? 0,
      curious: (row!.curious_count as number) ?? 0,
    },
    commentsCount: (row!.comments_count as number) ?? 0,
    savesCount:    (row!.saves_count    as number) ?? 0,
    isPinned:      (row!.is_pinned      as boolean) ?? false,
    author: {
      id:          (a.id          as string)  ?? '',
      username:    (a.username    as string)  ?? '',
      displayName: (a.display_name as string) ?? 'Tác giả',
      avatarUrl:   a.avatar_url   as string | undefined,
      role:        (a.role        as string)  ?? 'guest',
      verified:    (a.is_verified as boolean) ?? false,
      schoolId:    a.school_id    as string | undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event:       (row!.event       ?? null) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignment:  (row!.assignment  ?? null) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poll:        (row!.poll        ?? null) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    achievement: (row!.achievement ?? null) as any,
    createdAt:   row!.created_at  as string,
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FeedPost post={post as any} />

      <div className="card mt-4">
        <CommentSection postId={id} />
      </div>
    </main>
  );
}
