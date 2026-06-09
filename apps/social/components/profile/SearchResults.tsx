'use client';

import Link from 'next/link';
import Image from 'next/image';
import UserGrid from './UserGrid';
import type { SocialProfile } from './types';
import { cn } from '@/lib/utils';

export interface SearchPost {
  id: string;
  postType: string;
  content: string;
  mediaUrls: string[];
  subjects: string[];
  moderationStatus: string;
  reactions: { like: number; applaud: number; curious: number };
  commentsCount: number;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
    verified: boolean;
    username?: string;
  };
  achievement?: { type: string; title: string; description?: string } | null;
  createdAt: string;
}

const ROLE_COLOR: Record<string, string> = {
  student:     'bg-[#0B5FFF] text-white',
  parent:      'bg-emerald-500 text-white',
  teacher:     'bg-violet-500 text-white',
  coach:       'bg-cyan-500 text-white',
  schoolAdmin: 'bg-orange-500 text-white',
  institute:   'bg-pink-500 text-white',
  guest:       'bg-gray-400 text-white',
};

const ROLE_LABEL: Record<string, string> = {
  student:     'Học sinh',
  parent:      'Phụ huynh',
  teacher:     'Giáo viên',
  coach:       'Huấn luyện',
  schoolAdmin: 'Trường',
  institute:   'Trung tâm',
  guest:       'Khách',
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

interface Props {
  activeTab: 'users' | 'posts';
  users: SocialProfile[];
  posts: SearchPost[];
  currentProfileId?: string;
}

export default function SearchResults({
  activeTab,
  users,
  posts,
  currentProfileId,
}: Props) {
  if (activeTab === 'users') {
    return <UserGrid users={users} currentProfileId={currentProfileId} />;
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="block p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {post.author.avatarUrl ? (
                <Image src={post.author.avatarUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                  {post.author.displayName?.charAt(0) ?? '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{post.author.displayName}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    ROLE_COLOR[post.author.role] ?? ROLE_COLOR.guest,
                  )}
                >
                  {ROLE_LABEL[post.author.role] ?? post.author.role}
                  {post.author.verified && ' ✓'}
                </span>
                <span className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700 line-clamp-2">{post.content || '(Không có nội dung)'}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>❤️ {(post.reactions.like ?? 0) + (post.reactions.applaud ?? 0)}</span>
                <span>💬 {post.commentsCount ?? 0}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
