import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect }                   from 'next/navigation';
import FeedPost                       from '@/components/feed/FeedPost';
import type { Metadata }              from 'next';

export const metadata: Metadata = {
  title: 'Đã lưu | tuto.social',
};

const POST_QUERY = `
  *,
  author:social_profiles!social_posts_author_id_fkey(
    id, user_id, username, display_name, avatar_url, role, is_verified, school_id
  )
`;

export default async function SavedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/saved');

  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) redirect('/login');

  const { data: saves } = await supabase
    .from('social_saves')
    .select('post_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const postIds = (saves ?? []).map((s) => s.post_id as string);

  let posts: unknown[] = [];
  if (postIds.length > 0) {
    const { data } = await supabase
      .from('social_posts')
      .select(POST_QUERY)
      .in('id', postIds);
    // Sort by save order (saves is already ordered)
    const postMap = new Map((data ?? []).map((p) => [p.id, p]));
    posts = postIds
      .map((id) => postMap.get(id))
      .filter(Boolean);
  }

  const mappedPosts = posts.map((row) => {
    const r = row as Record<string, unknown>;
    const a = r.author as Record<string, unknown> ?? {};
    return {
      id:               r.id,
      postType:         r.post_type,
      content:          r.content ?? '',
      mediaUrls:        r.media_urls ?? [],
      subjects:         (r.subjects as string[] ?? []).filter((s: string) => s.trim()),
      location:         r.location,
      moderationStatus: r.moderation_status,
      reactions: {
        like:    r.like_count    ?? 0,
        applaud: r.applaud_count ?? 0,
        curious: r.curious_count ?? 0,
      },
      commentsCount: r.comments_count ?? 0,
      savesCount:    r.saves_count    ?? 0,
      isPinned:      r.is_pinned      ?? false,
      saved:         true,
      author: {
        id:          a.id ?? '',
        username:    a.username ?? '',
        displayName: (a.display_name as string) || 'Tác giả',
        avatarUrl:   a.avatar_url,
        role:        (a.role as string) || 'parent',
        verified:    a.is_verified ?? false,
        schoolId:    a.school_id as string | undefined,
      },
      event:       r.event,
      assignment:  r.assignment,
      poll:        r.poll,
      achievement: r.achievement,
      createdAt:   r.created_at,
    };
  });

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">🔖 Đã lưu</h1>

      {mappedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🔖</span>
          <p className="font-semibold text-gray-700">Chưa có bài viết nào được lưu</p>
          <p className="text-sm text-gray-500 mt-1">
            Nhấn vào biểu tượng 🏷️ trên bài viết để lưu lại để đọc sau.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mappedPosts.map((post) => (
            <FeedPost
              key={post.id as string}
              post={post as never}
              currentProfileId={profile.id as string}
            />
          ))}
        </div>
      )}
    </main>
  );
}
