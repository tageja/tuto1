import Link  from 'next/link';
import Image from 'next/image';

const SOCIAL_URL = process.env.NEXT_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001';

const ROLE_COLOR: Record<string, string> = {
  student:     'bg-blue-500',
  parent:      'bg-emerald-500',
  teacher:     'bg-violet-500',
  schoolAdmin: 'bg-orange-500',
  coach:       'bg-cyan-500',
};

const ROLE_LABEL: Record<string, string> = {
  student:     'Học sinh',
  parent:      'Phụ huynh',
  teacher:     'Giáo viên',
  schoolAdmin: 'Trường',
  coach:       'Huấn luyện',
};

interface PostPreview {
  id:          string;
  content:     string;
  reactions:   { like: number; applaud: number; curious: number };
  commentsCount: number;
  createdAt:   string;
  author: {
    displayName: string;
    avatarUrl?:  string;
    role:        string;
    verified:    boolean;
  };
  achievement?: { type: string; title: string } | null;
  postType:    string;
}

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  academic: '🏆', streak: '🔥', score: '⭐', first: '🎀', certificate: '📜',
};

export default function FeedPreviewCard({ post }: { post: PostPreview }) {
  const totalReactions = post.reactions.like + post.reactions.applaud + post.reactions.curious;
  const isAchievement  = post.postType === 'achievement' && post.achievement;

  return (
    <Link href={`${SOCIAL_URL}/post/${post.id}`} target="_blank" rel="noopener">
      <div className="rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow p-4 group">
        {/* Achievement badge */}
        {isAchievement && (
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2">
            <span>{ACHIEVEMENT_EMOJI[post.achievement!.type] ?? '🏆'}</span>
            <span>{post.achievement!.title}</span>
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-2.5 mb-3">
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
              {post.author.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{post.author.displayName}</span>
            <span
              className={`text-xs text-white px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[post.author.role] ?? 'bg-gray-400'}`}
            >
              {ROLE_LABEL[post.author.role] ?? post.author.role}
            </span>
          </div>
        </div>

        {/* Content preview */}
        {post.content && (
          <p className="text-sm text-gray-700 line-clamp-3 mb-3 group-hover:text-gray-900 transition-colors">
            {post.content}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {totalReactions > 0 && (
            <span>❤️ {totalReactions}</span>
          )}
          {post.commentsCount > 0 && (
            <span>💬 {post.commentsCount}</span>
          )}
          <span className="ml-auto">
            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </Link>
  );
}
