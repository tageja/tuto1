import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import Link                   from 'next/link';
import Image                  from 'next/image';
import type { Metadata }      from 'next';

export const metadata: Metadata = {
  title: 'Sự kiện | tuto.social',
  description: 'Sự kiện sắp tới từ các trường học trong cộng đồng Tuto.',
};

function formatEventDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default async function EventsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: rows } = await supabase
    .from('social_posts')
    .select(`
      id, event, content, created_at, school_id,
      author:social_profiles!social_posts_author_id_fkey(
        id, username, display_name, avatar_url, role, school_id
      )
    `)
    .eq('post_type', 'event')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .not('event', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50);

  const now = Date.now();
  const events = (rows ?? []).filter((r) => {
    const ev = r.event as { date?: string } | null;
    return ev?.date && new Date(ev.date).getTime() > now;
  }).sort((a, b) => {
    const da = new Date((a.event as { date: string }).date).getTime();
    const db = new Date((b.event as { date: string }).date).getTime();
    return da - db;
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📅 Sự kiện sắp tới</h1>
        <Link href="/feed" className="text-sm text-primary hover:underline">← Bảng tin</Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">📅</span>
          <p className="font-semibold text-gray-700">Chưa có sự kiện nào</p>
          <p className="text-sm text-gray-500 mt-1">Các sự kiện từ trường bạn sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((r) => {
            const ev = r.event as { title: string; date: string; location?: string; rsvpCount?: number };
            const a  = r.author as Record<string, unknown> ?? {};
            return (
              <Link key={r.id} href={`/post/${r.id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0 border border-blue-100">
                    <span className="text-xs font-medium text-blue-600">
                      {new Date(ev.date).toLocaleDateString('vi-VN', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-xl font-bold text-blue-700 leading-none">
                      {new Date(ev.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-base line-clamp-2">{ev.title}</h2>
                    <p className="text-sm text-primary mt-0.5">{formatEventDate(ev.date)}</p>
                    {ev.location && <p className="text-sm text-gray-500 mt-0.5">📍 {ev.location}</p>}
                    {r.content && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{r.content as string}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {a.avatar_url ? (
                          <Image src={a.avatar_url as string} alt="" width={20} height={20} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                        <span className="text-xs text-gray-500">{a.display_name as string}</span>
                      </div>
                      {ev.rsvpCount != null && ev.rsvpCount > 0 && (
                        <span className="text-xs text-gray-500">{ev.rsvpCount} người tham gia</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
