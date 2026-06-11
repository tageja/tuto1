'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAuthGate }              from '@/contexts/AuthGateContext';
import ShareModal                   from './ShareModal';

type ReactionType = 'like' | 'applaud' | 'curious';

interface Props {
  postId:        string;
  initialCounts: { like: number; applaud: number; curious: number };
  commentsCount: number;
  preview?:      string;
  userReaction?: ReactionType;
  saved?:        boolean;
}

const REACTION_ICON: Record<ReactionType, string> = {
  like:    '❤️',
  applaud: '👏',
  curious: '🤔',
};

const REACTION_COLOR: Record<ReactionType, string> = {
  like:    'text-rose-500',
  applaud: 'text-indigo-500',
  curious: 'text-amber-500',
};

const REACTION_LABEL: Record<ReactionType, string> = {
  like:    'Thích',
  applaud: 'Hay',
  curious: 'Tò mò',
};

export default function PostInteractions({
  postId,
  initialCounts,
  commentsCount,
  preview = '',
  userReaction: initialReaction,
  saved: initialSaved,
}: Props) {
  const supabase = getSupabaseBrowserClient();
  const { promptAuth } = useAuthGate();

  const [counts,       setCounts]       = useState(initialCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialReaction ?? null);
  const [saved,        setSaved]        = useState(initialSaved ?? false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [isPending,    startTransition] = useTransition();

  const handleReact = (type: ReactionType) => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { promptAuth('Đăng nhập để bày tỏ cảm xúc với bài viết.'); return; }

      const isToggling = userReaction === type;
      setCounts((prev) => {
        const next = { ...prev };
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
        if (!isToggling) next[type] += 1;
        return next;
      });
      setUserReaction(isToggling ? null : type);

      if (isToggling) {
        await supabase.from('social_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('social_likes').upsert(
          { post_id: postId, user_id: user.id, reaction_type: type },
          { onConflict: 'post_id,user_id' },
        );
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { promptAuth('Đăng nhập để lưu bài viết.'); return; }

      setSaved((prev) => !prev);
      if (saved) {
        await supabase.from('social_saves').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('social_saves').insert({ post_id: postId, user_id: user.id });
      }
    });
  };

  const totalReactions = counts.like + counts.applaud + counts.curious;
  const topReactions   = (Object.entries(counts) as [ReactionType, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const reactions: ReactionType[] = ['like', 'applaud', 'curious'];

  return (
    <>
      {/* Reaction aggregate row (FB pattern) */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1.5 py-2 border-b border-gray-100">
          <div className="flex -space-x-1">
            {topReactions.map((type) => (
              <span key={type} className="text-sm leading-none">{REACTION_ICON[type]}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">{totalReactions.toLocaleString('vi-VN')}</span>
          {commentsCount > 0 && (
            <Link href={`/post/${postId}`} className="ml-auto text-xs text-gray-500 hover:text-gray-700">
              {commentsCount} bình luận
            </Link>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 sm:gap-1 pt-2">
        {reactions.map((type) => (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={isPending}
            className={[
              'flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              userReaction === type
                ? `bg-gray-100 ${REACTION_COLOR[type]}`
                : 'text-gray-500 hover:bg-gray-100',
            ].join(' ')}
          >
            <span>{REACTION_ICON[type]}</span>
            <span className="hidden sm:inline">{REACTION_LABEL[type]}</span>
          </button>
        ))}

        <div className="flex-1" />

        <Link
          href={`/post/${postId}`}
          className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100 whitespace-nowrap"
        >
          <span>💬</span>
          <span className="text-xs font-semibold">{commentsCount}</span>
        </Link>

        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100"
          aria-label="Chia sẻ"
        >
          <span>📤</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isPending}
          className={[
            'flex items-center gap-1 px-1.5 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            saved ? 'text-primary' : 'text-gray-500 hover:bg-gray-100',
          ].join(' ')}
        >
          <span>{saved ? '🔖' : '🏷️'}</span>
        </button>
      </div>

      {shareOpen && <ShareModal postId={postId} preview={preview} onClose={() => setShareOpen(false)} />}
    </>
  );
}
