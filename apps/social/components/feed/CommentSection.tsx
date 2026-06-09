'use client';

import { useState, useEffect, useCallback } from 'react';
import Image                                from 'next/image';
import { getSupabaseBrowserClient }         from '@/lib/supabase';
import { useFeedInvalidation }              from '@/contexts/FeedInvalidationContext';
import { useAuthGate }                       from '@/contexts/AuthGateContext';

interface Comment {
  id:        string;
  content:   string;
  isPinned:  boolean;
  likeCount: number;
  createdAt: string;
  author: {
    id:          string;
    displayName: string;
    avatarUrl?:  string;
    role:        string;
  };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function CommentSection({ postId }: { postId: string }) {
  // Use singleton to avoid re-creating the client on every render (which would
  // cause useEffect to fire in an infinite loop due to referential inequality).
  const supabase        = getSupabaseBrowserClient();
  const { invalidateFeed } = useFeedInvalidation();
  const { promptAuth }     = useAuthGate();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('social_comments')
          .select(`
            *,
            author:social_profiles!social_comments_author_id_fkey(
              id, display_name, avatar_url, role
            )
          `)
          .eq('post_id', postId)
          .is('parent_id', null)
          .order('is_pinned',   { ascending: false })
          .order('created_at',  { ascending: true });

        if (cancelled) return;
        const mapped = (data ?? []).map((row) => {
          const a = row.author as Record<string, unknown> ?? {};
          return {
            id:        row.id as string,
            content:   row.content as string,
            isPinned:  (row.is_pinned as boolean) ?? false,
            likeCount: (row.like_count as number) ?? 0,
            createdAt: row.created_at as string,
            author: {
              id:          (a.id as string) ?? '',
              displayName: (a.display_name as string) ?? 'Unknown',
              avatarUrl:   a.avatar_url as string | undefined,
              role:        (a.role as string) ?? 'guest',
            },
          };
        });
        setComments(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // supabase is a stable singleton — intentionally excluded from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { promptAuth('Đăng nhập để bình luận.'); return; }

    setSending(true);
    setText('');

    try {

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id, display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: comment, error } = await supabase
        .from('social_comments')
        .insert({ post_id: postId, author_id: profile.id, content: trimmed })
        .select('*')
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id:        comment.id as string,
        content:   comment.content as string,
        isPinned:  false,
        likeCount: 0,
        createdAt: comment.created_at as string,
        author: {
          id:          profile.id as string,
          displayName: profile.display_name as string,
          avatarUrl:   profile.avatar_url as string | undefined,
          role:        profile.role as string,
        },
      };

      setComments((prev) => [...prev, newComment]);

      // Increment comments_count on the parent post. Supabase RPC builders do not
      // expose .catch() — await and destructure error instead.
      const { error: rpcError } = await supabase.rpc('increment_comments_count', { post_id: postId });
      if (rpcError) {
        // Fallback: direct update if RPC doesn't exist yet in this environment
        const { data: postData } = await supabase
          .from('social_posts')
          .select('comments_count')
          .eq('id', postId)
          .single();
        const current = (postData?.comments_count as number) ?? 0;
        await supabase
          .from('social_posts')
          .update({ comments_count: current + 1 })
          .eq('id', postId);
      }

      // Fix A: bump feedVersion so FeedContainer refetches on browser-back
      // (context stays alive across client-side navigation within (main) layout).
      invalidateFeed();
      // Fix B: sessionStorage flag so FeedContainer also refetches on direct
      // URL navigation to /feed (fresh React tree resets context to feedVersion=0).
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('feedNeedsRefresh', '1');
      }
    } catch (err) {
      console.error('Comment error', err);
    } finally {
      setSending(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, sending, postId]);

  return (
    <div>
      <h3 className="font-bold text-gray-900 text-base mb-4">
        Bình luận ({comments.length})
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded-full w-28" />
                <div className="h-3 bg-gray-200 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          Chưa có bình luận. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`flex gap-3 ${c.isPinned ? 'border-l-4 border-amber-400 pl-3 bg-amber-50 rounded-r-lg py-2' : ''}`}
            >
              {c.author.avatarUrl ? (
                <Image
                  src={c.author.avatarUrl}
                  alt={c.author.displayName}
                  width={36}
                  height={36}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600">
                  {c.author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                {c.isPinned && (
                  <p className="text-xs text-amber-600 font-semibold mb-0.5">📌 Đã ghim</p>
                )}
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{c.author.displayName}</p>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-2">{formatRelative(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="flex gap-3 items-end sticky bottom-0 bg-white pt-3 pb-4 border-t border-gray-100">
        <textarea
          className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-surface min-h-[42px] max-h-28"
          placeholder="Viết bình luận..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? '...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
