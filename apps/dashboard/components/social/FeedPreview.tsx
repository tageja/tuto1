import { createClient }  from '@supabase/supabase-js';
import Link              from 'next/link';
import Image             from 'next/image';
import FeedPreviewCard   from './FeedPreviewCard';

export default async function FeedPreview() {
  // Public posts only — no auth needed, use anon client directly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Fetch 3 most recent public approved posts
  const { data: rows } = await supabase
    .from('social_posts')
    .select(`
      id, post_type, content, like_count, applaud_count, curious_count,
      comments_count, created_at, achievement,
      author:social_profiles!social_posts_author_id_fkey(
        display_name, avatar_url, role, is_verified
      )
    `)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(3);

  const posts = (rows ?? []).map((row) => {
    const a = row.author as Record<string, unknown> ?? {};
    return {
      id:      row.id as string,
      postType: row.post_type as string,
      content: row.content as string ?? '',
      reactions: {
        like:    (row.like_count    as number) ?? 0,
        applaud: (row.applaud_count as number) ?? 0,
        curious: (row.curious_count as number) ?? 0,
      },
      commentsCount: (row.comments_count as number) ?? 0,
      createdAt:     row.created_at as string,
      author: {
        displayName: (a.display_name as string) ?? 'Unknown',
        avatarUrl:   a.avatar_url as string | undefined,
        role:        (a.role as string) ?? 'guest',
        verified:    (a.is_verified as boolean) ?? false,
      },
      achievement: row.achievement as { type: string; title: string } | null,
    };
  });

  if (posts.length === 0) return null;

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/tuto-logo.png"
              alt="Tuto Social"
              width={36}
              height={36}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cộng đồng Tuto</h2>
              <p className="text-sm text-gray-500">Chia sẻ từ phụ huynh, giáo viên và học sinh</p>
            </div>
          </div>
          <Link
            href="https://tuto.social"
            target="_blank"
            rel="noopener"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Xem thêm →
          </Link>
        </div>

        {/* Post cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {posts.map((post) => (
            <FeedPreviewCard key={post.id} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="https://tuto.social"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Tham gia tuto.social
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
