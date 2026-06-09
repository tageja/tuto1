'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import SearchResults from '@/components/profile/SearchResults';
import type { SocialProfile } from '@/components/profile/types';
import type { SearchPost } from '@/components/profile/SearchResults';

const TRENDING_SUBJECTS = ['Toán', 'Tiếng Anh', 'Vật lý', 'IELTS', 'STEM'];

const POST_QUERY = `
  id,
  post_type,
  content,
  media_urls,
  subjects,
  moderation_status,
  like_count,
  applaud_count,
  curious_count,
  comments_count,
  achievement,
  created_at,
  author:social_profiles!social_posts_author_id_fkey(
    id, username, display_name, avatar_url, role, is_verified
  )
`;

function mapRowToProfile(row: Record<string, unknown>): SocialProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    username: row.username as string,
    displayName: (row.display_name as string) ?? '',
    bio: row.bio as string | undefined,
    avatarUrl: row.avatar_url as string | undefined,
    coverUrl: row.cover_url as string | undefined,
    role: (row.role as string) ?? 'guest',
    isVerified: (row.is_verified as boolean) ?? false,
    followerCount: (row.follower_count as number) ?? 0,
    followingCount: (row.following_count as number) ?? 0,
    postCount: (row.post_count as number) ?? 0,
    schoolName: undefined,
    shieldCount: (row.shield_count as number) ?? 0,
    subjects: (row.subjects as string[]) ?? [],
  };
}

function mapRowToPost(row: Record<string, unknown>): SearchPost {
  const a = row.author as Record<string, unknown> ?? {};
  return {
    id: row.id as string,
    postType: (row.post_type as string) ?? 'text',
    content: (row.content as string) ?? '',
    mediaUrls: (row.media_urls as string[]) ?? [],
    subjects: (row.subjects as string[]) ?? [],
    moderationStatus: (row.moderation_status as string) ?? '',
    reactions: {
      like: (row.like_count as number) ?? 0,
      applaud: (row.applaud_count as number) ?? 0,
      curious: (row.curious_count as number) ?? 0,
    },
    commentsCount: (row.comments_count as number) ?? 0,
    author: {
      id: (a.id as string) ?? '',
      displayName: (a.display_name as string) ?? 'Unknown',
      avatarUrl: a.avatar_url as string | undefined,
      role: (a.role as string) ?? 'guest',
      verified: (a.is_verified as boolean) ?? false,
      username: a.username as string | undefined,
    },
    achievement: row.achievement as SearchPost['achievement'],
    createdAt: row.created_at as string,
  };
}

export default function SearchPageClient() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [users, setUsers] = useState<SocialProfile[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('social_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => setCurrentProfileId(data?.id));
      }
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const search = useCallback(async () => {
    if (!debouncedQuery) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const term = `%${debouncedQuery}%`;

      const [usersRes, postsRes] = await Promise.all([
        supabase
          .from('social_profiles')
          .select('*')
          .or(`display_name.ilike.${term},username.ilike.${term}`)
          .limit(30),
        supabase
          .from('social_posts')
          .select(POST_QUERY)
          .ilike('content', term)
          .in('moderation_status', ['ai_reviewed', 'parent_approved'])
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const userRows = usersRes.data ?? [];
      const postRows = postsRes.data ?? [];

      setUsers(userRows.map((r) => mapRowToProfile(r as Record<string, unknown>)));
      setPosts(postRows.map((r) => mapRowToPost(r as Record<string, unknown>)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    search();
  }, [search]);

  const hasQuery = debouncedQuery.length > 0;
  const showEmpty = !loading && hasQuery && users.length === 0 && posts.length === 0;
  const showHint = !hasQuery;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
        <span className="text-gray-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm..."
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          autoFocus
        />
      </div>

      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'users'
              ? 'text-[#0B5FFF] border-b-2 border-[#0B5FFF]'
              : 'text-gray-500'
          }`}
        >
          Người dùng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'posts'
              ? 'text-[#0B5FFF] border-b-2 border-[#0B5FFF]'
              : 'text-gray-500'
          }`}
        >
          Bài viết
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#0B5FFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : showHint ? (
        <div className="py-8 px-4">
          <p className="text-gray-500 mb-4">
            Tìm kiếm giáo viên, học sinh, trường học...
          </p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0B5FFF] text-sm font-medium hover:bg-blue-100"
              >
                #{s}
              </button>
            ))}
          </div>
        </div>
      ) : showEmpty ? (
        <div className="py-12 text-center text-gray-500">
          Không tìm thấy kết quả
        </div>
      ) : (
        <SearchResults
          activeTab={activeTab}
          users={users}
          posts={posts}
          currentProfileId={currentProfileId}
        />
      )}
    </div>
  );
}
