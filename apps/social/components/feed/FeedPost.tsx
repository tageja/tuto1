'use client';

import { useState, useEffect } from 'react';
import Link            from 'next/link';
import Image           from 'next/image';
import PostInteractions from './PostInteractions';
import PostOptionsDropdown from './PostOptionsDropdown';
import InlineComments   from './InlineComments';
import { cn }          from '../../lib/utils';
import { getSupabaseBrowserClient } from '../../lib/supabase';
import { useAuthGate } from '../../contexts/AuthGateContext';

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
    schoolId?:   string;
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
      <Image src="/images/tuto-logo.png" alt="Tuto" width={24} height={24} className="opacity-40" />
    </div>
  );
}

// ---------- Lightbox ----------

function Lightbox({
  urls,
  startIndex,
  onClose,
}: {
  urls: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white text-2xl p-2 hover:bg-white/10 rounded-full"
        onClick={onClose}
        aria-label="Đóng"
      >
        ×
      </button>
      {idx > 0 && (
        <button
          type="button"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-white/10 rounded-full"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i - 1); }}
          aria-label="Trước"
        >
          ‹
        </button>
      )}
      {idx < urls.length - 1 && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-white/10 rounded-full"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i + 1); }}
          aria-label="Tiếp"
        >
          ›
        </button>
      )}
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={urls[idx]}
          alt={`Ảnh ${idx + 1}`}
          width={1200}
          height={900}
          className="object-contain max-h-[90vh] max-w-[90vw]"
          unoptimized
        />
        <p className="text-center text-white/60 text-sm mt-2">{idx + 1} / {urls.length}</p>
      </div>
    </div>
  );
}

// ---------- Photo grid ----------

function PhotoGrid({ urls }: { urls: string[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const shown    = urls.slice(0, 4);
  const overflow = urls.length - 4;

  return (
    <>
      <div className={cn('grid gap-1 mb-3 rounded-xl overflow-hidden', shown.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
        {shown.map((url, i) => {
          const isLast = i === 3 && overflow > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIdx(i)}
              className={cn('relative', shown.length === 1 ? 'aspect-video' : 'aspect-square')}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="400px" unoptimized />
              {isLast && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{overflow}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {lightboxIdx !== null && (
        <Lightbox urls={urls} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
}

// ---------- Event card (with RSVP) ----------

function EventCard({ postId, event }: { postId: string; event: NonNullable<FeedPostData['event']> }) {
  const { promptAuth }            = useAuthGate();
  const [rsvpCount, setRsvpCount] = useState(event.rsvpCount);
  const [rsvped,    setRsvped]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Hydrate: fetch live count + viewer's existing RSVP from DB
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function hydrate() {
      // Live count from social_event_rsvps
      const { count } = await supabase
        .from('social_event_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId)
        .neq('status', 'not_going');

      if (!cancelled && count != null) setRsvpCount(count);

      // Viewer's existing RSVP
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from('social_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (!profile || cancelled) return;

      const { data: existing } = await supabase
        .from('social_event_rsvps')
        .select('status')
        .eq('post_id', postId)
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!cancelled && existing && existing.status !== 'not_going') setRsvped(true);
    }

    hydrate();
    return () => { cancelled = true; };
  }, [postId]);

  const handleRsvp = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { promptAuth('Đăng nhập để đăng ký tham gia sự kiện.'); return; }

    const { data: profile } = await supabase
      .from('social_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) return;

    setLoading(true);
    if (rsvped) {
      // Toggle off — mark not_going
      await supabase.from('social_event_rsvps').upsert(
        { post_id: postId, profile_id: profile.id, status: 'not_going' },
        { onConflict: 'post_id,profile_id' },
      );
      setRsvped(false);
      setRsvpCount((n) => Math.max(0, n - 1));
    } else {
      // RSVP going
      await supabase.from('social_event_rsvps').upsert(
        { post_id: postId, profile_id: profile.id, status: 'going' },
        { onConflict: 'post_id,profile_id' },
      );
      setRsvped(true);
      setRsvpCount((n) => n + 1);
    }
    setLoading(false);
  };

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 mb-3">
      <p className="font-bold text-blue-800 mb-1.5">{event.title}</p>
      <p className="text-sm text-blue-700">
        {new Date(event.date).toLocaleDateString('vi-VN', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>
      {event.location && <p className="text-sm text-blue-700 mt-0.5">{event.location}</p>}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-blue-500">{rsvpCount} người tham gia</p>
        <button
          type="button"
          onClick={handleRsvp}
          disabled={loading}
          className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
            rsvped
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-primary text-white hover:bg-blue-700',
            loading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {rsvped ? '✓ Đã tham gia' : 'Tham gia'}
        </button>
      </div>
    </div>
  );
}

// ---------- Main component ----------

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
          {post.author.username ? (
            <Link href={`/profile/${encodeURIComponent(post.author.username)}`} className="flex-shrink-0 hover:opacity-90">
              {post.author.avatarUrl ? (
                <Image src={post.author.avatarUrl} alt={post.author.displayName} width={44} height={44} className="rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">{initials}</div>
              )}
            </Link>
          ) : (
            <div className="flex-shrink-0">
              {post.author.avatarUrl ? (
                <Image src={post.author.avatarUrl} alt={post.author.displayName} width={44} height={44} className="rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">{initials}</div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.author.username ? (
                <Link href={`/profile/${encodeURIComponent(post.author.username)}`} className="font-semibold text-gray-900 hover:underline">
                  {post.author.displayName}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">{post.author.displayName}</span>
              )}
              {isSchoolAdmin(post.author.role) && post.author.schoolId ? (
                <Link href={`/school/${post.author.schoolId}`} className={cn('role-badge', ROLE_COLOR[post.author.role])}>
                  {ROLE_LABEL[post.author.role] ?? post.author.role}{post.author.verified && ' ✓'}
                </Link>
              ) : (
                <span className={cn('role-badge', ROLE_COLOR[post.author.role])}>
                  {ROLE_LABEL[post.author.role] ?? post.author.role}{post.author.verified && ' ✓'}
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

      {/* Subject chips */}
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
      {post.location && <p className="text-xs text-gray-400 mb-3">📍 {post.location}</p>}

      {/* Photo grid with lightbox */}
      {post.mediaUrls.length > 0 && <PhotoGrid urls={post.mediaUrls} />}

      {/* Event card */}
      {post.postType === 'event' && post.event && (
        <EventCard postId={post.id} event={post.event} />
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

      {/* Reaction aggregate + interactions */}
      <PostInteractions
        postId={post.id}
        initialCounts={post.reactions}
        commentsCount={post.commentsCount}
        preview={post.content}
        userReaction={post.userReaction}
        saved={post.saved}
      />

      {/* Inline comment preview (top 2 + input) */}
      <InlineComments postId={post.id} commentsCount={post.commentsCount} />
    </article>
  );
}
