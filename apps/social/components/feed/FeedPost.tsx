'use client';

import Link            from 'next/link';
import Image           from 'next/image';
import PostInteractions from './PostInteractions';
import PostOptionsDropdown from './PostOptionsDropdown';
import { cn }          from '../../lib/utils';

// Mirrors the SocialPost mobile type (subset used in web)
interface FeedPostData {
  id:               string;
  postType:         string;
  content:          string;
  mediaUrls:        string[];
  subjects:         string[];
  location?:        string;
  moderationStatus: string;
  reactions: { like: number; applaud: number; curious: number };
  userReaction?:    'like' | 'applaud' | 'curious';
  commentsCount:    number;
  savesCount:       number;
  saved?:           boolean;
  isPinned:         boolean;
  author: {
    id:          string;
    displayName: string;
    avatarUrl?:  string;
    role:        string;
    verified:    boolean;
    username?:   string;
    schoolId?:  string;
  };
  event?:       { title: string; date: string; location?: string; rsvpCount: number } | null;
  assignment?:  { subject: string; dueDate: string } | null;
  poll?:        { options: { id: string; text: string; votes: number }[]; totalVotes: number } | null;
  achievement?: { type: string; title: string; description?: string } | null;
  createdAt:    string;
}

const ROLE_COLOR: Record<string, string> = {
  student:     'bg-primary text-white',
  parent:      'bg-emerald-500 text-white',
  teacher:     'bg-violet-500 text-white',
  coach:       'bg-cyan-500 text-white',
  schoolAdmin: 'bg-orange-500 text-white',
  school_admin:'bg-orange-500 text-white',
  institute:   'bg-pink-500 text-white',
  guest:       'bg-gray-400 text-white',
};

const ROLE_LABEL: Record<string, string> = {
  student:     'Học sinh',
  parent:      'Phụ huynh',
  teacher:     'Giáo viên',
  coach:       'Huấn luyện',
  schoolAdmin: 'Trường',
  school_admin:'Trường',
  institute:   'Trung tâm',
  guest:       'Khách',
};

const isSchoolAdmin = (role: string) => role === 'school_admin' || role === 'schoolAdmin';

const MOD_BADGE: Record<string, string> = {
  ai_reviewed:     'bg-blue-50 text-blue-600',
  pending:         'bg-amber-50 text-amber-600',
  parent_approved: 'bg-green-50 text-green-600',
  rejected:        'bg-red-50 text-red-600',
};
const MOD_LABEL: Record<string, string> = {
  ai_reviewed:     '✓ AI Reviewed',
  pending:         '⏳ Pending',
  parent_approved: '🛡 Parent Approved',
  rejected:        '✕ Rejected',
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

// --------------------------------------------------------------------------
// Achievement gradient card
// --------------------------------------------------------------------------

const ACHIEVEMENT_GRADIENT: Record<string, string> = {
  academic:    'from-amber-400 to-orange-500',
  streak:      'from-blue-500 to-teal-500',
  score:       'from-violet-500 to-indigo-500',
  first:       'from-emerald-500 to-green-600',
  certificate: 'from-amber-400 to-yellow-400',
};

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  academic: '🏆', streak: '🔥', score: '⭐', first: '🎀', certificate: '📜',
};

function AchievementHeader({ achievement }: { achievement: NonNullable<FeedPostData['achievement']> }) {
  const gradient = ACHIEVEMENT_GRADIENT[achievement.type] ?? ACHIEVEMENT_GRADIENT.academic;
  const emoji    = ACHIEVEMENT_EMOJI[achievement.type]    ?? '🏆';

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r mb-3', gradient)}>
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 text-white">
        <p className="font-bold text-base">{achievement.title}</p>
        {achievement.description && (
          <p className="text-sm opacity-80">{achievement.description}</p>
        )}
      </div>
      <Image
        src="/images/tuto-logo.png"
        alt="Tuto"
        width={24}
        height={24}
        className="opacity-40"
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// Main component
// --------------------------------------------------------------------------

interface FeedPostProps {
  post: FeedPostData;
  currentProfileId?: string;
  onBlockAuthor?: (authorId: string) => void;
}

export default function FeedPost({ post, currentProfileId, onBlockAuthor }: FeedPostProps) {
  const initials = post.author.displayName.charAt(0).toUpperCase();

  return (
    <article className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar — links to profile if username available */}
          {post.author.username ? (
            <Link href={`/profile/${encodeURIComponent(post.author.username)}`} className="flex-shrink-0 hover:opacity-90">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">
                  {initials}
                </div>
              )}
            </Link>
          ) : (
            <div className="flex-shrink-0">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">
                  {initials}
                </div>
              )}
            </div>
          )}

          {/* Name row + role chip + timestamp — each link is a sibling, never nested */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.author.username ? (
                <Link
                  href={`/profile/${encodeURIComponent(post.author.username)}`}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  {post.author.displayName}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">{post.author.displayName}</span>
              )}

              {isSchoolAdmin(post.author.role) && post.author.schoolId ? (
                <Link
                  href={`/school/${post.author.schoolId}`}
                  className={cn('role-badge', ROLE_COLOR[post.author.role])}
                >
                  {ROLE_LABEL[post.author.role] ?? post.author.role}
                  {post.author.verified && ' ✓'}
                </Link>
              ) : (
                <span className={cn('role-badge', ROLE_COLOR[post.author.role])}>
                  {ROLE_LABEL[post.author.role] ?? post.author.role}
                  {post.author.verified && ' ✓'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('mod-badge', MOD_BADGE[post.moderationStatus])}>
            {MOD_LABEL[post.moderationStatus]}
          </span>
          <PostOptionsDropdown
            postId={post.id}
            authorId={post.author.id}
            authorName={post.author.displayName}
            isOwnPost={currentProfileId === post.author.id}
            onBlock={() => onBlockAuthor?.(post.author.id)}
          />
        </div>
      </div>

      {/* Achievement header */}
      {post.postType === 'achievement' && post.achievement && (
        <AchievementHeader achievement={post.achievement} />
      )}

      {/* Content */}
      {post.content && (
        <Link href={`/post/${post.id}`}>
          <p className="text-gray-800 text-base leading-relaxed mb-3 line-clamp-5 hover:text-gray-900">
            {post.content}
          </p>
        </Link>
      )}

      {/* Subject chips — filter empty strings (Bug #8) */}
      {post.subjects.filter((s) => s.trim().length > 0).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.subjects.filter((s) => s.trim().length > 0).map((s) => (
            <span key={s} className="text-xs font-medium text-primary bg-blue-50 rounded-full px-2.5 py-1">
              #{s}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {post.location && (
        <p className="text-xs text-gray-400 mb-3">📍 {post.location}</p>
      )}

      {/* Photo grid */}
      {post.mediaUrls.length > 0 && (
        <div className={cn('grid gap-1 mb-3 rounded-xl overflow-hidden', post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className={cn('relative', post.mediaUrls.length === 1 ? 'aspect-video' : 'aspect-square')}>
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Event card */}
      {post.postType === 'event' && post.event && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 mb-3">
          <p className="font-bold text-blue-800 mb-2">{post.event.title}</p>
          <p className="text-sm text-blue-700">
            📅 {new Date(post.event.date).toLocaleDateString('vi-VN')}
          </p>
          {post.event.location && <p className="text-sm text-blue-700">📍 {post.event.location}</p>}
          <p className="text-xs text-blue-500 mt-1">{post.event.rsvpCount} người quan tâm</p>
          <button className="btn-primary mt-3 text-sm py-2 w-full">Tham gia</button>
        </div>
      )}

      {/* Assignment card */}
      {post.postType === 'assignment' && post.assignment && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-3">
          <p className="font-bold text-amber-800">📝 {post.assignment.subject}</p>
          <p className="text-sm text-amber-700 mt-1">
            Hạn nộp: {new Date(post.assignment.dueDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}

      {/* Poll */}
      {post.postType === 'poll' && post.poll && (
        <div className="space-y-2 mb-3">
          {post.poll.options.map((opt) => {
            const pct = post.poll!.totalVotes > 0
              ? Math.round((opt.votes / post.poll!.totalVotes) * 100)
              : 0;
            return (
              <div key={opt.id} className="relative h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center px-3">
                <div className="absolute inset-0 bg-blue-100" style={{ width: `${pct}%` }} />
                <span className="relative text-sm font-medium text-gray-800 flex-1">{opt.text}</span>
                <span className="relative text-xs text-gray-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactions */}
      <PostInteractions
        postId={post.id}
        initialCounts={post.reactions}
        commentsCount={post.commentsCount}
        preview={post.content}
        userReaction={post.userReaction}
        saved={post.saved}
      />
    </article>
  );
}
