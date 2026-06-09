'use client';

import { useState, useTransition } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
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

  const [counts,       setCounts]       = useState(initialCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialReaction ?? null);
  const [saved,        setSaved]        = useState(initialSaved ?? false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [isPending,    startTransition] = useTransition();

  const handleReact = (type: ReactionType) => {
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const isToggling = userReaction === type;

      // Optimistic
      setCounts((prev) => {
        const next = { ...prev };
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
        if (!isToggling) next[type] += 1;
        return next;
      });
      setUserReaction(isToggling ? null : type);

      if (isToggling) {
        await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('social_likes')
          .upsert(
            { post_id: postId, user_id: user.id, reaction_type: type },
            { onConflict: 'post_id,user_id' },
          );
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setSaved((prev) => !prev);

      if (saved) {
        await supabase
          .from('social_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('social_saves')
          .insert({ post_id: postId, user_id: user.id });
      }
    });
  };

  const reactions: ReactionType[] = ['like', 'applaud', 'curious'];

  return (
    <>
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
        {reactions.map((type) => (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              userReaction === type
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span>{REACTION_ICON[type]}</span>
            <span>{REACTION_LABEL[type]}</span>
            <span className="text-xs font-semibold">{counts[type] ?? 0}</span>
          </button>
        ))}

        <div className="flex-1" />

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100">
          <span>💬</span>
          <span className="text-xs font-semibold">{commentsCount}</span>
        </button>

        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100"
          aria-label="Chia sẻ"
        >
          <span>📤</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            saved ? 'text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <span>{saved ? '🔖' : '🏷️'}</span>
        </button>
      </div>

      {shareOpen && (
        <ShareModal
          postId={postId}
          preview={preview}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
