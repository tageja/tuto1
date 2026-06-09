'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  Loader2,
  Check,
  X,
  Shield,
  FileText,
  Film,
  BookImage,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

type Tab = 'posts' | 'reels' | 'stories';
type Action = 'approve' | 'reject';

interface Author {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface PendingPost {
  id: string;
  content: string | null;
  post_type: string;
  media_urls: string[] | null;
  created_at: string;
  author: Author | null;
}

interface PendingReel {
  id: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  created_at: string;
  author: Author | null;
}

interface PendingStory {
  id: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  author: Author | null;
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  parent: 'bg-green-100 text-green-700',
  teacher: 'bg-purple-100 text-purple-700',
  schoolAdmin: 'bg-orange-100 text-orange-700',
};

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const cls = ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {role}
    </span>
  );
}

function AuthorRow({ author }: { author: Author | null }) {
  const name = author?.display_name ?? author?.username ?? 'Unknown';
  return (
    <div className="flex items-center gap-2 mb-2">
      {author?.avatar_url ? (
        <img src={author.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border">
          <User className="w-4 h-4 text-text-muted" />
        </div>
      )}
      <span className="text-sm font-medium text-text">{name}</span>
      <RoleBadge role={author?.role ?? null} />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ActionButtons({
  id,
  type,
  actioning,
  onAction,
}: {
  id: string;
  type: 'post' | 'reel' | 'story';
  actioning: string | null;
  onAction: (id: string, type: 'post' | 'reel' | 'story', action: Action) => void;
}) {
  const busy = actioning === id;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onAction(id, type, 'approve')}
        disabled={!!actioning}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors min-w-[90px] justify-center"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Approve</>}
      </button>
      <button
        onClick={() => onAction(id, type, 'reject')}
        disabled={!!actioning}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors min-w-[80px] justify-center"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" />Reject</>}
      </button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield className="w-12 h-12 text-text-muted opacity-30 mb-3" />
      <p className="font-medium text-text mb-1">All clear</p>
      <p className="text-sm text-text-muted">No pending {label} to review.</p>
    </div>
  );
}

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center inline-block">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function TutoAdminModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [reels, setReels] = useState<PendingReel[]>([]);
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [storiesUnavailable, setStoriesUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Posts — all schools, no school_id filter
      const { data: postData, error: postErr } = await supabase
        .from('social_posts')
        .select(`
          id,
          content,
          post_type,
          media_urls,
          created_at,
          author:social_profiles!social_posts_author_id_fkey(display_name, username, avatar_url, role)
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

      if (postErr) throw postErr;
      setPosts(
        ((postData ?? []) as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>;
          const a = row.author;
          return { ...row, author: (Array.isArray(a) ? a[0] : a) ?? null } as PendingPost;
        })
      );

      // Reels
      const { data: reelData, error: reelErr } = await supabase
        .from('social_reels')
        .select(`
          id,
          description,
          thumbnail_url,
          video_url,
          created_at,
          author:social_profiles!social_reels_author_id_fkey(display_name, username, avatar_url, role)
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

      if (reelErr) throw reelErr;
      setReels(
        ((reelData ?? []) as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>;
          const a = row.author;
          return { ...row, author: (Array.isArray(a) ? a[0] : a) ?? null } as PendingReel;
        })
      );

      // Stories — table may not exist until migrations are applied
      try {
        const { data: storyData, error: storyErr } = await supabase
          .from('social_stories')
          .select(`
            id,
            media_url,
            media_type,
            created_at,
            author:social_profiles!social_stories_author_id_fkey(display_name, username, avatar_url, role)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        if (storyErr) {
          setStoriesUnavailable(true);
          setStories([]);
        } else {
          setStoriesUnavailable(false);
          setStories(
            ((storyData ?? []) as unknown[]).map((r: unknown) => {
              const row = r as Record<string, unknown>;
              const a = row.author;
              return { ...row, author: (Array.isArray(a) ? a[0] : a) ?? null } as PendingStory;
            })
          );
        }
      } catch {
        setStoriesUnavailable(true);
        setStories([]);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[TutoAdmin Moderation] fetch error:', err);
      setError('Failed to load moderation queue. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAction = useCallback(
    async (id: string, type: 'post' | 'reel' | 'story', action: Action) => {
      setActioning(id);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');

        const res = await fetch('/api/social/moderate', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type, id, action }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? 'Action failed');

        if (type === 'post') setPosts((prev) => prev.filter((p) => p.id !== id));
        if (type === 'reel') setReels((prev) => prev.filter((r) => r.id !== id));
        if (type === 'story') setStories((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error('[TutoAdmin Moderation] action error:', err);
        alert(err instanceof Error ? err.message : 'Action failed. Please try again.');
      } finally {
        setActioning(null);
      }
    },
    []
  );

  const totalPending = posts.length + reels.length + stories.length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">Community Moderation</h1>
            <p className="text-sm text-text-muted mt-0.5">
              Manually review all pending content across the platform.
              {' '}
              <span className="text-amber-600 font-medium">
                AI screening activates when an OpenAI key is configured.
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <p className="text-xs text-text-muted">
              Last refreshed {timeAgo(lastRefreshed.toISOString())}
            </p>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending Posts', count: posts.length, icon: FileText },
            { label: 'Pending Reels', count: reels.length, icon: Film },
            { label: 'Pending Stories', count: storiesUnavailable ? '—' : stories.length, icon: BookImage },
          ].map(({ label, count, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${count !== '—' && count > 0 ? 'bg-red-50' : 'bg-surface'}`}>
                <Icon className={`w-5 h-5 ${count !== '—' && count > 0 ? 'text-red-500' : 'text-text-muted'}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${count !== '—' && count > 0 ? 'text-red-600' : 'text-text'}`}>{count}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchAll} className="ml-auto text-red-600 underline text-xs font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-0">
          {(
            [
              { key: 'posts' as Tab, label: 'Posts', icon: FileText, count: posts.length },
              { key: 'reels' as Tab, label: 'Reels', icon: Film, count: reels.length },
              { key: 'stories' as Tab, label: 'Stories', icon: BookImage, count: storiesUnavailable ? 0 : stories.length },
            ] as const
          ).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <TabBadge count={count} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-text-muted">Loading moderation queue...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Posts */}
          {activeTab === 'posts' && (
            posts.length === 0 ? <EmptyState label="posts" /> :
            posts.map((post) => (
              <div key={post.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex justify-between gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <AuthorRow author={post.author} />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-surface text-text-muted px-2 py-0.5 rounded-md capitalize border border-border">
                        {post.post_type}
                      </span>
                      <span className="text-xs text-text-muted">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-sm text-text line-clamp-3 leading-relaxed">
                      {post.content || <span className="italic text-text-muted">(No text content)</span>}
                    </p>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {post.media_urls.slice(0, 4).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="media"
                            className="w-20 h-14 object-cover rounded-lg border border-border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ))}
                        {post.media_urls.length > 4 && (
                          <div className="w-20 h-14 rounded-lg border border-border bg-surface flex items-center justify-center text-xs text-text-muted">
                            +{post.media_urls.length - 4} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <ActionButtons id={post.id} type="post" actioning={actioning} onAction={handleAction} />
                </div>
              </div>
            ))
          )}

          {/* Reels */}
          {activeTab === 'reels' && (
            reels.length === 0 ? <EmptyState label="reels" /> :
            reels.map((reel) => (
              <div key={reel.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex justify-between gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <AuthorRow author={reel.author} />
                    <span className="text-xs text-text-muted">{timeAgo(reel.created_at)}</span>
                    {reel.description && (
                      <p className="text-sm text-text mt-2 line-clamp-2 leading-relaxed">{reel.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {reel.thumbnail_url && (
                        <img
                          src={reel.thumbnail_url}
                          alt="thumbnail"
                          className="w-24 h-16 object-cover rounded-lg border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      {reel.video_url && (
                        <a
                          href={reel.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                        >
                          <Film className="w-3.5 h-3.5" />
                          Watch video
                        </a>
                      )}
                    </div>
                  </div>
                  <ActionButtons id={reel.id} type="reel" actioning={actioning} onAction={handleAction} />
                </div>
              </div>
            ))
          )}

          {/* Stories */}
          {activeTab === 'stories' && (
            storiesUnavailable ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-amber-200 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-3" />
                <p className="font-medium text-text mb-1">Stories not available yet</p>
                <p className="text-sm text-text-muted max-w-sm">
                  The stories table will be created when database migrations 056–073 are applied to Supabase.
                </p>
              </div>
            ) : stories.length === 0 ? <EmptyState label="stories" /> :
            stories.map((story) => (
              <div key={story.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex justify-between gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <AuthorRow author={story.author} />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-surface text-text-muted px-2 py-0.5 rounded-md border border-border capitalize">
                        {story.media_type ?? 'image'}
                      </span>
                      <span className="text-xs text-text-muted">{timeAgo(story.created_at)}</span>
                    </div>
                    {story.media_url && (
                      <img
                        src={story.media_url}
                        alt="story"
                        className="w-24 h-16 object-cover rounded-lg border border-border mt-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <ActionButtons id={story.id} type="story" actioning={actioning} onAction={handleAction} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
