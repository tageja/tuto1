import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface SchoolBannerProps {
  schoolId?: string;
}

export default async function SchoolBanner({ schoolId }: SchoolBannerProps) {
  const supabase = await createSupabaseServerClient();

  // If specific school, show that school's banner
  if (schoolId) {
    const { data: school } = await supabase
      .from('schools')
      .select('id, name, logo_url, address')
      .eq('id', schoolId)
      .maybeSingle();

    const { data: branding } = await supabase
      .from('school_branding')
      .select('logo_url, header_url')
      .eq('school_id', schoolId)
      .maybeSingle();

    const { data: adminProfile } = await supabase
      .from('social_profiles')
      .select('id, follower_count, post_count, is_verified')
      .eq('school_id', schoolId)
      .eq('role', 'schoolAdmin')
      .maybeSingle();

    const logoUrl    = branding?.logo_url ?? school?.logo_url ?? null;
    const schoolName = school?.name ?? 'Trường học';
    const followers  = adminProfile?.follower_count ?? 0;
    const postCount  = adminProfile?.post_count ?? 0;
    const verified   = adminProfile?.is_verified ?? false;

    return (
      <div className="card mb-3">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={schoolName}
              width={48}
              height={48}
              className="rounded-xl object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {schoolName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
              {schoolName}
              {verified && <span className="text-primary text-sm">✓</span>}
            </h2>
            <p className="text-xs text-gray-500">
              {postCount} bài viết · {followers.toLocaleString('vi-VN')} người theo dõi
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Guest/no-school: show community aggregate stats
  const { count: postCount } = await supabase
    .from('social_posts')
    .select('id', { count: 'exact', head: true })
    .in('moderation_status', ['ai_reviewed', 'parent_approved']);

  const { count: teacherCount } = await supabase
    .from('social_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'teacher');

  return (
    <div className="card mb-3 bg-gradient-to-r from-primary to-blue-600 text-white">
      <div className="flex items-center gap-3 mb-3">
        <Image src="/images/tuto-logo.png" alt="Tuto" width={40} height={40} className="rounded-xl opacity-90" />
        <div>
          <h2 className="font-bold text-white text-base">Cộng đồng Tuto</h2>
          <p className="text-blue-100 text-xs">Học tập · Kết nối · Phát triển</p>
        </div>
      </div>
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-white text-lg">{(postCount ?? 0).toLocaleString('vi-VN')}</p>
          <p className="text-blue-100 text-xs">Bài viết</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-white text-lg">{(teacherCount ?? 0).toLocaleString('vi-VN')}</p>
          <p className="text-blue-100 text-xs">Giáo viên</p>
        </div>
      </div>
    </div>
  );
}
