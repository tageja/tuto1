// tuto.social — Creator analytics (views, stats, top content)

import { socialSupabase } from './api.client';

export interface PostSummary {
  id: string;
  content: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  media_urls?: string[];
}

export interface ReelSummary {
  id: string;
  caption: string | null;
  view_count: number;
  likes_count: number;
  created_at: string;
  video_url?: string;
  thumbnail_url?: string;
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  shieldCount: number;
  shieldRank: string;
  subjects: string[];
  isVerified: boolean;
}

export interface CreatorStats {
  totalPosts: number;
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  topPosts: PostSummary[];
  topReels: ReelSummary[];
  xp: number;
  level: number;
  streakCount: number;
  shieldCount: number;
  shieldRank: string;
}

// Session-level dedup — only call RPC once per content item per app session
const viewedIds = new Set<string>();

export async function incrementViewCount(
  type: 'post' | 'reel',
  id: string,
): Promise<void> {
  const key = `${type}:${id}`;
  if (viewedIds.has(key)) return;
  viewedIds.add(key);

  await socialSupabase.rpc('increment_view_count', {
    p_content_type: type,
    p_content_id: id,
  });
}

export async function getCreatorStats(profileId: string): Promise<CreatorStats> {
  const [profileRes, postsCountRes, reelsCountRes, postsRes, reelsRes] = await Promise.all([
    socialSupabase
      .from('social_profiles')
      .select('xp, level, streak_count, shield_count, shield_rank')
      .eq('id', profileId)
      .single(),
    socialSupabase
      .from('social_posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', profileId),
    socialSupabase
      .from('social_reels')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', profileId),
    socialSupabase
      .from('social_posts')
      .select('id, content, view_count, like_count, applaud_count, curious_count, comments_count, created_at, media_urls')
      .eq('author_id', profileId)
      .order('view_count', { ascending: false })
      .limit(5),
    socialSupabase
      .from('social_reels')
      .select('id, caption, view_count, like_count, created_at, video_url, thumbnail_url')
      .eq('author_id', profileId)
      .order('view_count', { ascending: false })
      .limit(5),
  ]);

  const profile = profileRes.data;
  const posts = postsRes.data ?? [];
  const reels = reelsRes.data ?? [];

  const totalPosts = postsCountRes.count ?? posts.length;
  const totalReels = reelsCountRes.count ?? reels.length;

  const totalViews =
    posts.reduce((s, p) => s + (p.view_count ?? 0), 0) +
    reels.reduce((s, r) => s + (r.view_count ?? 0), 0);

  const totalLikes =
    posts.reduce(
      (s, p) =>
        s +
        (p.like_count ?? 0) +
        (p.applaud_count ?? 0) +
        (p.curious_count ?? 0),
      0,
    ) + reels.reduce((s, r) => s + (r.like_count ?? 0), 0);

  const totalComments = posts.reduce((s, p) => s + (p.comments_count ?? 0), 0);

  const topPosts: PostSummary[] = posts.map((p) => ({
    id: p.id,
    content: p.content ?? '',
    view_count: p.view_count ?? 0,
    likes_count: (p.like_count ?? 0) + (p.applaud_count ?? 0) + (p.curious_count ?? 0),
    comments_count: p.comments_count ?? 0,
    created_at: p.created_at ?? '',
    media_urls: (p as { media_urls?: string[] }).media_urls,
  }));

  const topReels: ReelSummary[] = reels.map((r) => ({
    id: r.id,
    caption: r.caption ?? null,
    view_count: r.view_count ?? 0,
    likes_count: r.like_count ?? 0,
    created_at: r.created_at ?? '',
    video_url: (r as { video_url?: string }).video_url,
    thumbnail_url: (r as { thumbnail_url?: string }).thumbnail_url,
  }));

  return {
    totalPosts,
    totalReels,
    totalViews,
    totalLikes,
    totalComments,
    topPosts,
    topReels,
    xp: profile?.xp ?? 0,
    level: profile?.level ?? 1,
    streakCount: profile?.streak_count ?? 0,
    shieldCount: profile?.shield_count ?? 0,
    shieldRank: (profile?.shield_rank as string) ?? 'beginner',
  };
}

export async function getTeacherLeaderboard(
  limit = 20,
  offset = 0,
): Promise<LeaderboardEntry[]> {
  const { data } = await socialSupabase
    .from('social_profiles')
    .select('id, display_name, username, avatar_url, role, shield_count, shield_rank, subjects, is_verified')
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .range(offset, offset + limit - 1);

  return (data ?? []).map((p) => ({
    id: p.id,
    displayName: (p.display_name as string) ?? '',
    username: (p.username as string) ?? '',
    avatarUrl: p.avatar_url as string | null,
    role: (p.role as string) ?? 'teacher',
    shieldCount: (p.shield_count as number) ?? 0,
    shieldRank: (p.shield_rank as string) ?? 'beginner',
    subjects: (p.subjects as string[]) ?? [],
    isVerified: (p.is_verified as boolean) ?? false,
  }));
}
