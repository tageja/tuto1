import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function LeftRail() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Top 3 teachers for mini leaderboard (always shown)
  const { data: topTeachers } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, shield_count, shield_rank')
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(3);

  if (!user) {
    return (
      <aside className="hidden lg:block space-y-3">
        {/* Guest value-prop card */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-2">Cộng đồng học tập của trường bạn</h3>
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Kết nối với giáo viên và phụ huynh cùng trường
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Nhận thông báo về lịch học, sự kiện nhà trường
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Theo dõi thành tích và tiến bộ của con
            </li>
          </ul>
          <Link
            href="/login?mode=register"
            className="block w-full text-center btn-primary mb-2"
          >
            Tạo tài khoản
          </Link>
          <Link
            href="/login"
            className="block w-full text-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>

        {/* Mini leaderboard */}
        {topTeachers && topTeachers.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Giáo viên nổi bật</h3>
            <div className="space-y-3">
              {topTeachers.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/profile/${encodeURIComponent(t.username ?? t.id)}`}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  {t.avatar_url ? (
                    <Image src={t.avatar_url} alt={t.display_name ?? ''} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(t.display_name ?? '?').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.display_name}</p>
                    <p className="text-xs text-gray-500">🛡 {t.shield_count} Shields</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Signed-in user
  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, role, shield_count, shield_rank, school_id, follower_count, following_count')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: school } = profile?.school_id ? await supabase
    .from('schools')
    .select('id, name')
    .eq('id', profile.school_id)
    .maybeSingle() : { data: null };

  return (
    <aside className="hidden lg:block space-y-3">
      {/* Profile card */}
      {profile && (
        <div className="card">
          <Link href={`/profile/${encodeURIComponent(profile.username ?? profile.id)}`}>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name ?? ''}
                width={56}
                height={56}
                className="rounded-full object-cover mx-auto block mb-2"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 mx-auto mb-2">
                {(profile.display_name ?? '?').charAt(0)}
              </div>
            )}
            <p className="font-bold text-gray-900 text-center text-sm truncate">{profile.display_name}</p>
          </Link>

          {/* Role badge */}
          <div className="flex justify-center mt-1 mb-3">
            <span className={[
              'px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
              profile.role === 'teacher'     ? 'bg-violet-500' :
              profile.role === 'schoolAdmin' ? 'bg-orange-500' :
              'bg-emerald-500',
            ].join(' ')}>
              {profile.role === 'teacher' ? 'Giáo viên' : profile.role === 'schoolAdmin' ? 'Nhà trường' : 'Phụ huynh'}
            </span>
            {profile.role === 'teacher' && profile.shield_count > 0 && (
              <span className="ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                🛡 {profile.shield_count}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-6 mb-3 text-center">
            <div>
              <p className="font-bold text-gray-900 text-sm">{profile.follower_count ?? 0}</p>
              <p className="text-xs text-gray-500">Người theo dõi</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{profile.following_count ?? 0}</p>
              <p className="text-xs text-gray-500">Đang theo dõi</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1 border-t border-gray-100 pt-3">
            {school && (
              <Link href={`/school/${profile.school_id}`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-700 hover:bg-surface transition-colors"
              >
                <span>🏫</span> <span className="truncate">{school.name}</span>
              </Link>
            )}
            <Link href="/saved"
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-700 hover:bg-surface transition-colors"
            >
              <span>🔖</span> Đã lưu
            </Link>
            <Link href="/leaderboard"
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-700 hover:bg-surface transition-colors"
            >
              <span>🏆</span> Bảng xếp hạng
            </Link>
            <Link href="/events"
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-700 hover:bg-surface transition-colors"
            >
              <span>📅</span> Sự kiện
            </Link>
            <Link href="/messages"
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-700 hover:bg-surface transition-colors"
            >
              <span>💬</span> Tin nhắn
            </Link>
          </nav>
        </div>
      )}

      {/* Mini leaderboard */}
      {topTeachers && topTeachers.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Giáo viên nổi bật</h3>
          <div className="space-y-3">
            {topTeachers.map((t, i) => (
              <Link
                key={t.id}
                href={`/profile/${encodeURIComponent(t.username ?? t.id)}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                {t.avatar_url ? (
                  <Image src={t.avatar_url} alt={t.display_name ?? ''} width={32} height={32} className="rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {(t.display_name ?? '?').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.display_name}</p>
                  <p className="text-xs text-gray-500">🛡 {t.shield_count} Shields</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/leaderboard" className="text-xs text-primary hover:underline mt-3 block">
            Xem tất cả →
          </Link>
        </div>
      )}
    </aside>
  );
}
