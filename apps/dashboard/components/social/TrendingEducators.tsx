import { createClient } from '@supabase/supabase-js';
import Link             from 'next/link';

interface EducatorProfile {
  username:     string;
  display_name: string;
  avatar_url:   string | null;
  shield_count: number;
}

const SOCIAL_URL = process.env.NEXT_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001';

async function getTopEducators(): Promise<EducatorProfile[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('social_profiles')
    .select('username, display_name, avatar_url, shield_count')
    .eq('role', 'teacher')
    .eq('is_verified', true)
    .order('shield_count', { ascending: false })
    .limit(3);

  return (data ?? []) as EducatorProfile[];
}

export default async function TrendingEducators() {
  const educators = await getTopEducators();

  const placeholderInitials = ['T', 'G', 'K'];

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          🏅 Giáo viên nổi bật
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {educators.length === 0
            ? placeholderInitials.map((initial, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300">Chưa có giáo viên</p>
                    <p className="text-xs text-gray-200">—</p>
                  </div>
                </div>
              ))
            : educators.map((educator) => (
                <Link
                  key={educator.username}
                  href={`${SOCIAL_URL}/profile/${educator.username}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
                >
                  {/* Avatar */}
                  {educator.avatar_url ? (
                    <img
                      src={educator.avatar_url}
                      alt={educator.display_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {educator.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                      {educator.display_name}
                    </p>
                    <p className="text-xs text-gray-500">@{educator.username}</p>
                  </div>

                  {/* Shield count */}
                  <div className="shrink-0 flex items-center gap-1 bg-amber-50 text-amber-600 rounded-full px-2 py-0.5">
                    <span className="text-xs">🛡️</span>
                    <span className="text-xs font-semibold">{educator.shield_count}</span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
