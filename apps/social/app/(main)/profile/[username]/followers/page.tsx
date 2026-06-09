import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

interface FollowerProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  followerCount: number;
}

const PROFILE_SELECT = 'id, username, display_name, avatar_url, role, follower_count';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Người theo dõi · @${username} | tuto.social`,
  };
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params;
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

  const { data: profileRow } = await supabase
    .from('social_profiles')
    .select('id, display_name, follower_count')
    .ilike('username', username)
    .single();

  if (!profileRow) notFound();

  const profileId = profileRow.id as string;
  const displayName = (profileRow.display_name as string) ?? username;
  const followersCount = (profileRow.follower_count as number) ?? 0;

  const { data: followRows } = await supabase
    .from('social_follows')
    .select('follower_id')
    .eq('following_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  const followerIds = (followRows ?? []).map((r) => r.follower_id);
  const followers: FollowerProfile[] = [];

  if (followerIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('social_profiles')
      .select(PROFILE_SELECT)
      .in('id', followerIds);

    if (profileRows) {
      for (const p of profileRows) {
        followers.push({
          id: p.id,
          username: p.username,
          displayName: (p.display_name as string) ?? '',
          avatarUrl: p.avatar_url ?? undefined,
          role: (p.role as string) ?? 'guest',
          followerCount: (p.follower_count as number) ?? 0,
        });
      }
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/profile/${encodeURIComponent(username)}`}
          className="text-sm text-gray-600 hover:text-[#0B5FFF]"
        >
          ← {displayName}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {followersCount} Người theo dõi
        </h1>
      </div>

      <ul className="divide-y divide-gray-200">
        {followers.map((f) => (
          <li key={f.id} className="py-4 flex items-center gap-4">
            <Link href={`/profile/${encodeURIComponent(f.username)}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 shrink-0">
                {f.avatarUrl ? (
                  <Image src={f.avatarUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                    {f.displayName?.charAt(0) ?? '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{f.displayName}</p>
                <p className="text-sm text-gray-500 truncate">@{f.username}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {followers.length === 0 && (
        <p className="text-gray-500 py-8 text-center">Chưa có người theo dõi</p>
      )}
    </main>
  );
}
