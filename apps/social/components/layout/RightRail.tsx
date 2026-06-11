import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

function formatEventDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function RightRail() {
  const supabase = await createSupabaseServerClient();

  // Upcoming events: event-type posts ordered by event.date, next 3
  const { data: eventRows } = await supabase
    .from('social_posts')
    .select(`
      id, event, school_id,
      author:social_profiles!social_posts_author_id_fkey(display_name)
    `)
    .eq('post_type', 'event')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .not('event', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  // Filter to upcoming events (event.date > now) in JS since we can't jsonb-filter via PostgREST easily
  const now = new Date();
  const upcomingEvents = (eventRows ?? [])
    .filter((r) => {
      const ev = r.event as { date?: string } | null;
      if (!ev?.date) return false;
      return new Date(ev.date) > now;
    })
    .slice(0, 3);

  // Top 3 teachers by shield_count
  const { data: topTeachers } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, shield_count, shield_rank')
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(3);

  // Trending hashtags: top subjects from posts in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentPosts } = await supabase
    .from('social_posts')
    .select('subjects')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .gte('created_at', thirtyDaysAgo)
    .not('subjects', 'is', null);

  const subjectCounts: Record<string, number> = {};
  for (const post of recentPosts ?? []) {
    const subs = post.subjects as string[] ?? [];
    for (const s of subs) {
      if (s.trim()) subjectCounts[s.trim()] = (subjectCounts[s.trim()] ?? 0) + 1;
    }
  }
  const trendingHashtags = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  return (
    <aside className="hidden lg:block space-y-3">
      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Sự kiện sắp tới</h3>
            <Link href="/events" className="text-xs text-primary hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((r) => {
              const ev = r.event as { title: string; date: string; location?: string; rsvpCount?: number };
              return (
                <Link
                  key={r.id}
                  href={`/post/${r.id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{ev.title}</p>
                      <p className="text-xs text-primary mt-0.5">{formatEventDate(ev.date)}</p>
                      {ev.rsvpCount != null && ev.rsvpCount > 0 && (
                        <p className="text-xs text-gray-500">{ev.rsvpCount} người tham gia</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured teachers */}
      {topTeachers && topTeachers.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Giáo viên nổi bật</h3>
          </div>
          <div className="space-y-3">
            {topTeachers.map((t) => (
              <Link
                key={t.id}
                href={`/profile/${encodeURIComponent(t.username ?? t.id)}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                {t.avatar_url ? (
                  <Image src={t.avatar_url} alt={t.display_name ?? ''} width={36} height={36} className="rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {(t.display_name ?? '?').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.display_name}</p>
                  <p className="text-xs text-gray-500">🛡 {t.shield_count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending hashtags */}
      {trendingHashtags.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Chủ đề thịnh hành</h3>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map(({ tag, count }) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-primary text-xs font-medium rounded-full"
              >
                #{tag} <span className="text-gray-400">·{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
