'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuthGate } from '@/contexts/AuthGateContext';

interface Comment {
  id:        string;
  content:   string;
  createdAt: string;
  author: {
    id:          string;
    displayName: string;
    avatarUrl?:  string;
    username?:   string;
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface Props {
  postId:        string;
  commentsCount: number;
}

export default function InlineComments({ postId, commentsCount }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { promptAuth } = useAuthGate();

  const [comments, setComments] = useState<Comment[]>([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('social_comments')
      .select(`
        id, content, created_at,
        author:social_profiles!social_comments_author_id_fkey(
          id, display_name, avatar_url, username
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(2);

    const mapped = (data ?? []).reverse().map((r) => {
      const a = (r.author as unknown as Record<string, unknown>) ?? {};
      return {
        id:        r.id as string,
        content:   r.content as string,
        createdAt: r.created_at as string,
        author: {
          id:          (a.id as string) ?? '',
          displayName: (a.display_name as string) ?? 'Unknown',
          avatarUrl:   a.avatar_url as string | undefined,
          username:    a.username as string | undefined,
        },
      };
    });
    setComments(mapped);
    setLoaded(true);
  }, [supabase, postId]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { promptAuth('Đăng nhập để bình luận.'); return; }

    setSending(true);
    setText('');

    try {
      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id, display_name, avatar_url, username')
        .eq('user_id', user.id)
        .single();
      if (!profile) return;

      const { data: comment } = await supabase
        .from('social_comments')
        .insert({ post_id: postId, author_id: profile.id, content: trimmed })
        .select('id, content, created_at')
        .single();
      if (!comment) return;

      await supabase.rpc('increment_comments_count', { post_id: postId });

      setComments((prev) => [
        ...prev.slice(-1),
        {
          id:        comment.id as string,
          content:   comment.content as string,
          createdAt: comment.created_at as string,
          author: {
            id:          profile.id as string,
            displayName: profile.display_name as string,
            avatarUrl:   profile.avatar_url as string | undefined,
            username:    profile.username as string | undefined,
          },
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      {/* Top 2 comments */}
      {loaded && comments.length > 0 && (
        <div className="space-y-2 mb-2">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              {c.author.avatarUrl ? (
                <Image
                  src={c.author.avatarUrl}
                  alt={c.author.displayName}
                  width={28}
                  height={28}
                  className="rounded-full object-cover flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                  {c.author.displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-900">{c.author.displayName} </span>
                <span className="text-xs text-gray-700">{c.content}</span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-1.5">{timeAgo(c.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* View all comments link */}
      {commentsCount > 2 && (
        <Link
          href={`/post/${postId}`}
          className="text-xs text-gray-500 hover:text-primary mb-2 block"
        >
          Xem thêm {commentsCount - 2} bình luận
        </Link>
      )}

      {/* Inline comment input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Viết bình luận..."
          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {text.trim() && (
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="text-sm font-semibold text-primary disabled:opacity-50"
          >
            Gửi
          </button>
        )}
      </div>
    </div>
  );
}
