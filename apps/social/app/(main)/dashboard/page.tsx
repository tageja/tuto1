import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Tổng quan sáng tạo | tuto.social',
};

export interface DashboardProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  role: string;
  xp: number;
  level: number;
  streak_count: number;
  shield_count: number;
  shield_rank: string;
}

export interface DashboardPostRow {
  id: string;
  content: string | null;
  view_count: number | null;
  like_count: number | null;
  comments_count: number | null;
  created_at: string;
  media_urls: string[] | null;
}

export interface DashboardReelRow {
  id: string;
  description: string | null;
  view_count: number | null;
  like_count: number | null;
  created_at: string;
  thumbnail_url: string | null;
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('social_profiles')
    .select(
      'id, display_name, username, avatar_url, role, xp, level, streak_count, shield_count, shield_rank',
    )
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/feed');

  const p = profile as DashboardProfile;

  const { count: totalPosts } = await supabase
    .from('social_posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', p.id);

  const { count: totalReels } = await supabase
    .from('social_reels')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', p.id);

  const { data: topPosts } = await supabase
    .from('social_posts')
    .select('id, content, view_count, like_count, comments_count, created_at, media_urls')
    .eq('author_id', p.id)
    .order('view_count', { ascending: false })
    .limit(5);

  const { data: topReels } = await supabase
    .from('social_reels')
    .select('id, description, view_count, like_count, created_at, thumbnail_url')
    .eq('author_id', p.id)
    .order('view_count', { ascending: false })
    .limit(5);

  const posts = (topPosts ?? []) as DashboardPostRow[];
  const reels = (topReels ?? []) as DashboardReelRow[];

  const totalViews =
    posts.reduce((s, row) => s + (row.view_count ?? 0), 0) +
    reels.reduce((s, row) => s + (row.view_count ?? 0), 0);

  const totalLikes = posts.reduce((s, row) => s + (row.like_count ?? 0), 0);

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <DashboardClient
        profile={p}
        totalPosts={totalPosts ?? 0}
        totalReels={totalReels ?? 0}
        totalViews={totalViews}
        totalLikes={totalLikes}
        topPosts={posts}
        topReels={reels}
      />
    </main>
  );
}
