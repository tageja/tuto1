'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient }                  from '@/lib/supabase';
import { useFeedInvalidation }                       from '@/contexts/FeedInvalidationContext';
import { useAuthGate }                               from '@/contexts/AuthGateContext';
import FeedPost         from './FeedPost';
import FeedSkeleton     from './FeedSkeleton';
import SuggestedTeachers from './SuggestedTeachers';

type FeedTab = 'school' | 'forYou' | 'following';

interface Post {
  id:               string;
  postType:         string;
  content:          string;
  mediaUrls:        string[];
  subjects:         string[];
  location?:        string;
  moderationStatus: string;
  reactions: { like: number; applaud: number; curious: number };
  commentsCount:    number;
  savesCount:       number;
  isPinned:         boolean;
  author: {
    id:          string;
    username?:   string;
    displayName: string;
    avatarUrl?:  string;
    role:        string;
    verified:    boolean;
    schoolId?:   string;
  };
  event?:       { title: string; date: string; location?: string; rsvpCount: number } | null;
  assignment?:  { subject: string; dueDate: string } | null;
  poll?:        { options: { id: string; text: string; votes: number }[]; totalVotes: number } | null;
  achievement?: { type: string; title: string; description?: string } | null;
  createdAt:    string;
}

const ALL_TABS: { key: FeedTab; label: string }[] = [
  { key: 'school',    label: 'Trường học' },
  { key: 'forYou',   label: 'Dành cho bạn' },
  { key: 'following', label: 'Đang theo dõi' },
];

function mapRow(row: Record<string, unknown>): Post {
  const a = row.author as Record<string, unknown> ?? {};
  return {
    id:               row.id as string,
    postType:         row.post_type as string,
    content:          (row.content as string) ?? '',
    mediaUrls:        (row.media_urls as string[]) ?? [],
    subjects:         (row.subjects as string[]) ?? [],
    location:         row.location as string | undefined,
    moderationStatus: row.moderation_status as string,
    reactions: {
      like:    (row.like_count    as number) ?? 0,
      applaud: (row.applaud_count as number) ?? 0,
      curious: (row.curious_count as number) ?? 0,
    },
    commentsCount: (row.comments_count as number) ?? 0,
    savesCount:    (row.saves_count as number) ?? 0,
    isPinned:      (row.is_pinned as boolean) ?? false,
    author: {
      id:          (a.id as string) ?? '',
      username:    (a.username as string) ?? '',
      displayName: (a.display_name as string) || 'Tác giả',
      avatarUrl:   a.avatar_url as string | undefined,
      role:        (a.role as string) || 'parent',
      verified:    (a.is_verified as boolean) ?? false,
      schoolId:    a.school_id as string | undefined,
    },
    event:       row.event as Post['event'],
    assignment:  row.assignment as Post['assignment'],
    poll:        row.poll as Post['poll'],
    achievement: row.achievement as Post['achievement'],
    createdAt:   row.created_at as string,
  };
}

interface UserProfile {
  id:       string;
  schoolId: string | null;
}

export default function FeedContainer({ initialPosts }: { initialPosts: Post[] }) {
  const supabase                    = getSupabaseBrowserClient();
  const { feedVersion }             = useFeedInvalidation();
  const { promptAuth }              = useAuthGate();
  const [isGuest,      setIsGuest]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<FeedTab>('forYou');
  const [posts,        setPosts]        = useState<Post[]>(initialPosts);
  const [loading,      setLoading]      = useState(false);
  const [hasMore,      setHasMore]      = useState(true);
  const [feedError,    setFeedError]    = useState<string | null>(null);
  const [userProfile,  setUserProfile]  = useState<UserProfile | null>(null);

  // Tabs visible to current viewer: guests only see forYou + following
  const visibleTabs = isGuest
    ? ALL_TABS.filter((t) => t.key !== 'school')
    : ALL_TABS;

  const didInitialLoad = useRef(false);
  const cursorRef      = useRef<string | null>(null);
  const observerRef    = useRef<IntersectionObserver | null>(null);
  const sentinelRef    = useRef<HTMLDivElement | null>(null);

  // Fetch the current user's social profile once on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsGuest(true);
        return;
      }
      setIsGuest(false);
      const { data } = await supabase
        .from('social_profiles')
        .select('id, school_id')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUserProfile({ id: data.id as string, schoolId: data.school_id as string | null });
      }
    })();
  }, [supabase]);

  const loadPosts = useCallback(async (tab: FeedTab, reset = false, profile?: UserProfile | null) => {
    setLoading(true);
    if (reset) setFeedError(null);
    try {
      const activeProfile = profile ?? userProfile;

      // For 'following' tab, fetch the list of followed profile IDs first
      let followedIds: string[] = [];
      if (tab === 'following' && activeProfile) {
        const { data: follows } = await supabase
          .from('social_follows')
          .select('following_id')
          .eq('follower_id', activeProfile.id);
        followedIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
      }

      let query = supabase
        .from('social_posts')
        .select(`
          *,
          author:social_profiles!social_posts_author_id_fkey(
            id, user_id, username, display_name, avatar_url, role, is_verified, school_id
          )
        `)
        .in('moderation_status', ['ai_reviewed', 'parent_approved'])
        .order('created_at', { ascending: false })
        .limit(21);

      // Tab-specific filters
      if (tab === 'school') {
        if (!activeProfile?.schoolId) {
          // Signed-in user with no school — return empty so CTA renders
          if (reset) setPosts([]);
          setHasMore(false);
          return;
        }
        query = query.eq('school_id', activeProfile.schoolId);
      } else if (tab === 'following') {
        if (followedIds.length === 0) {
          // No follows yet — return empty
          if (reset) setPosts([]);
          setHasMore(false);
          return;
        }
        query = query.in('author_id', followedIds);
      }
      // 'forYou' — no additional filter (all approved posts)

      if (!reset && cursorRef.current) {
        query = query.lt('created_at', cursorRef.current);
      }

      const { data, error } = await query;

      if (error) {
        const msg = (error as { message?: string }).message ?? JSON.stringify(error);
        console.warn('[FeedContainer] query error:', msg);
        setFeedError(msg);
        return;
      }

      const rows = data ?? [];
      const hasMorePosts = rows.length > 20;
      const slice = hasMorePosts ? rows.slice(0, 20) : rows;

      cursorRef.current = slice.length > 0 ? (slice[slice.length - 1].created_at as string) : null;
      setHasMore(hasMorePosts);

      const mapped = slice.map((r) => mapRow(r as Record<string, unknown>));
      if (reset) setPosts(mapped);
      else setPosts((prev) => [...prev, ...mapped]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[FeedContainer] unexpected error:', msg);
      setFeedError(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase, userProfile]);

  // Refetch when tab changes OR feedVersion bumps (comment posted on detail page).
  // Guard: only skip the initial client fetch when feedVersion is still 0 (no
  // invalidation has occurred yet). If feedVersion > 0 on mount it means the
  // user browser-backed after posting a comment — force a fresh fetch regardless
  // of whether server already hydrated initialPosts.
  useEffect(() => {
    if (!didInitialLoad.current && initialPosts.length > 0 && feedVersion === 0) {
      didInitialLoad.current = true;
      cursorRef.current = initialPosts[initialPosts.length - 1].createdAt;
      return;
    }
    didInitialLoad.current = true;
    cursorRef.current = null;
    loadPosts(activeTab, true);
  }, [activeTab, feedVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fix B — sessionStorage fallback for direct URL navigation to /feed.
  // React Context resets on a full page load (fresh React tree), so feedVersion
  // goes back to 0 and the dep-array change never fires. sessionStorage survives
  // within the same browser tab across page loads.
  // CommentSection writes 'feedNeedsRefresh' = '1' after a successful insert.
  // This effect runs once on mount, reads the flag, clears it, and triggers a
  // fresh fetch — guaranteeing staleness is resolved even on direct URL nav.
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem('feedNeedsRefresh') === '1') {
      sessionStorage.removeItem('feedNeedsRefresh');
      cursorRef.current = null;
      loadPosts(activeTab, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadPosts(activeTab, false);
      }
    }, { threshold: 0.1 });

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, activeTab, loadPosts]);

  return (
    <div>
      {/* Tab switcher — guests see forYou + following only */}
      <div className="flex border-b border-gray-200 mb-4 bg-white sticky top-0 z-10">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'text-primary border-primary'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-3">
        {loading && posts.length === 0 ? (
          <FeedSkeleton />
        ) : feedError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">Không thể tải bài viết</p>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              {feedError.includes('does not exist')
                ? 'Cơ sở dữ liệu chưa được khởi tạo. Vui lòng chạy migrations Supabase.'
                : feedError}
            </p>
            <button
              onClick={() => loadPosts(activeTab, true)}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : posts.length === 0 ? (
          activeTab === 'school' && !isGuest && !userProfile?.schoolId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <p className="font-semibold text-gray-700 mb-1">Tham gia trường của bạn</p>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">
                Kết nối với trường học để xem bài viết từ giáo viên và phụ huynh trong cùng trường.
              </p>
              <a
                href="/settings"
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Tham gia trường
              </a>
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">Chưa có bài viết nào</p>
            <p className="text-sm text-gray-400">Hãy là người đầu tiên chia sẻ trong cộng đồng!</p>
          </div>
          )
        ) : (
          posts.map((post, idx) => (
            <div key={post.id}>
              <FeedPost
                post={post as never}
                currentProfileId={userProfile?.id}
                onBlockAuthor={(authorId) => setPosts((prev) => prev.filter((p) => p.author.id !== authorId))}
              />
              {/* Insert SuggestedTeachers after every 5th post */}
              {(idx + 1) % 5 === 0 && (
                <SuggestedTeachers schoolId={userProfile?.schoolId ?? undefined} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10" />

      {/* Load more indicator */}
      {loading && posts.length > 0 && (
        <div className="py-6 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-6">Bạn đã xem hết bài viết</p>
      )}
    </div>
  );
}
