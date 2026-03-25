'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { supabase } from '../../../../../lib/supabase';
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
        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
          <User className="w-4 h-4 text-text-muted" />
        </div>
      )}
      <span className="text-sm font-medium text-text">{name}</span>
      <RoleBadge role={author?.role ?? null} />
    </div>
  );
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
      <Button
        size="sm"
        variant="default"
        onClick={() => onAction(id, type, 'approve')}
        disabled={!!actioning}
        className="min-w-[90px]"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4 mr-1" />
            Approve
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onAction(id, type, 'reject')}
        disabled={!!actioning}
        className="min-w-[80px]"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <X className="w-4 h-4 mr-1" />
            Reject
          </>
        )}
      </Button>
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

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [reels, setReels] = useState<PendingReel[]>([]);
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [storiesUnavailable, setStoriesUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Posts
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
        .limit(50);

      if (postErr) throw postErr;
      setPosts(
        ((postData ?? []) as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>;
          const rawAuthor = row.author;
          const author = Array.isArray(rawAuthor) ? rawAuthor[0] : rawAuthor;
          return { ...row, author: author ?? null } as PendingPost;
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
        .limit(50);

      if (reelErr) throw reelErr;
      setReels(
        ((reelData ?? []) as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>;
          const rawAuthor = row.author;
          const author = Array.isArray(rawAuthor) ? rawAuthor[0] : rawAuthor;
          return { ...row, author: author ?? null } as PendingReel;
        })
      );

      // Stories — table may not exist yet (migrations pending)
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
          .limit(50);

        if (storyErr) {
          setStoriesUnavailable(true);
          setStories([]);
        } else {
          setStoriesUnavailable(false);
          setStories(
            ((storyData ?? []) as unknown[]).map((r: unknown) => {
              const row = r as Record<string, unknown>;
              const rawAuthor = row.author;
              const author = Array.isArray(rawAuthor) ? rawAuthor[0] : rawAuthor;
              return { ...row, author: author ?? null } as PendingStory;
            })
          );
        }
      } catch {
        setStoriesUnavailable(true);
        setStories([]);
      }
    } catch (err) {
      console.error('[Moderation] fetch error:', err);
      setError('Failed to load moderation queue. Please refresh.');
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
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? 'Action failed');
        }

        // Optimistic removal from local state
        if (type === 'post') setPosts((prev) => prev.filter((p) => p.id !== id));
        if (type === 'reel') setReels((prev) => prev.filter((r) => r.id !== id));
        if (type === 'story') setStories((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error('[Moderation] action error:', err);
        alert(err instanceof Error ? err.message : 'Action failed. Please try again.');
      } finally {
        setActioning(null);
      }
    },
    []
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" />, count: posts.length },
    { key: 'reels', label: 'Reels', icon: <Film className="w-4 h-4" />, count: reels.length },
    {
      key: 'stories',
      label: 'Stories',
      icon: <BookImage className="w-4 h-4" />,
      count: stories.length,
    },
  ];

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text">Moderation Queue</h1>
          <p className="text-sm text-text-muted">
            Manually review and approve content before it appears in the community feed.
            AI screening activates automatically once an OpenAI key is configured.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchAll} className="ml-auto text-red-600 underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.icon}
            {tab.label}
            {!loading && tab.count > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}

        <button
          onClick={fetchAll}
          disabled={loading}
          className="ml-auto text-xs text-text-muted hover:text-text px-2 py-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Posts tab */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {posts.length === 0 ? (
                <EmptyState label="posts" />
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex justify-between gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <AuthorRow author={post.author} />
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium bg-surface text-text-muted px-2 py-0.5 rounded capitalize">
                            {post.post_type}
                          </span>
                          <span className="text-xs text-text-muted">{timeAgo(post.created_at)}</span>
                        </div>
                        <p className="text-sm text-text line-clamp-3">
                          {post.content || '(No text content)'}
                        </p>
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {post.media_urls.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="media"
                                className="w-16 h-16 object-cover rounded-md border border-border"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ))}
                            {post.media_urls.length > 4 && (
                              <div className="w-16 h-16 rounded-md border border-border bg-surface flex items-center justify-center text-xs text-text-muted">
                                +{post.media_urls.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <ActionButtons
                        id={post.id}
                        type="post"
                        actioning={actioning}
                        onAction={handleAction}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Reels tab */}
          {activeTab === 'reels' && (
            <div className="space-y-3">
              {reels.length === 0 ? (
                <EmptyState label="reels" />
              ) : (
                reels.map((reel) => (
                  <Card key={reel.id} className="p-4">
                    <div className="flex justify-between gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <AuthorRow author={reel.author} />
                        <span className="text-xs text-text-muted">{timeAgo(reel.created_at)}</span>
                        {reel.description && (
                          <p className="text-sm text-text mt-1 line-clamp-2">{reel.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {reel.thumbnail_url && (
                            <img
                              src={reel.thumbnail_url}
                              alt="thumbnail"
                              className="w-20 h-14 object-cover rounded-md border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          {reel.video_url && (
                            <a
                              href={reel.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline flex items-center gap-1"
                            >
                              <Film className="w-3 h-3" />
                              View video
                            </a>
                          )}
                        </div>
                      </div>
                      <ActionButtons
                        id={reel.id}
                        type="reel"
                        actioning={actioning}
                        onAction={handleAction}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Stories tab */}
          {activeTab === 'stories' && (
            <div className="space-y-3">
              {storiesUnavailable ? (
                <Card className="p-6 text-center">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-text mb-1">Stories not available yet</p>
                  <p className="text-xs text-text-muted">
                    The stories table will be created when database migrations 056–073 are applied.
                  </p>
                </Card>
              ) : stories.length === 0 ? (
                <EmptyState label="stories" />
              ) : (
                stories.map((story) => (
                  <Card key={story.id} className="p-4">
                    <div className="flex justify-between gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <AuthorRow author={story.author} />
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-surface text-text-muted px-2 py-0.5 rounded capitalize">
                            {story.media_type ?? 'image'}
                          </span>
                          <span className="text-xs text-text-muted">{timeAgo(story.created_at)}</span>
                        </div>
                        {story.media_url && (
                          <img
                            src={story.media_url}
                            alt="story"
                            className="w-20 h-14 object-cover rounded-md border border-border mt-1"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <ActionButtons
                        id={story.id}
                        type="story"
                        actioning={actioning}
                        onAction={handleAction}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="p-12 text-center">
      <Shield className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
      <p className="text-text font-medium mb-1">All clear</p>
      <p className="text-sm text-text-muted">No pending {label} to review.</p>
    </Card>
  );
}
