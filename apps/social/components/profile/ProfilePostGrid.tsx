'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  postType: string;
  content?: string;
  mediaUrls?: string[];
  achievement?: { type?: string; badge?: string };
  reactions?: { like: number; applaud: number; curious: number };
  commentsCount?: number;
}

interface Props {
  posts: Post[];
}

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  academic: '🏆',
  streak: '🔥',
  score: '⭐',
  first: '🎀',
  certificate: '📜',
};

export default function ProfilePostGrid({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>Chưa có bài viết nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="aspect-square relative group overflow-hidden rounded-sm bg-gray-100"
        >
          {post.postType === 'achievement' ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-4xl">
                {ACHIEVEMENT_EMOJI[post.achievement?.type ?? 'academic'] ?? '🏆'}
              </span>
            </div>
          ) : post.mediaUrls?.[0] ? (
            <Image
              src={post.mediaUrls[0]}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <p className="text-xs text-gray-500 line-clamp-3 text-center">
                {post.content?.slice(0, 30) ?? ''}
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-4 text-white text-sm font-medium">
              <span>❤️ {(post.reactions?.like ?? 0) + (post.reactions?.applaud ?? 0)}</span>
              <span>💬 {post.commentsCount ?? 0}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
