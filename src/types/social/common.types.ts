// tuto.social — Common / primitive types shared across all social features

export type UserRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'coach'
  | 'schoolAdmin'
  | 'institute'
  | 'guest';

export type PostVisibility =
  | 'public'
  | 'schoolOnly'
  | 'classOnly'
  | 'followers'
  | 'private';

export type PostType =
  | 'text'
  | 'photo'
  | 'video'
  | 'album'
  | 'poll'
  | 'event'
  | 'assignment'
  | 'achievement'
  | 'question'
  | 'announcement';

export type ReactionType = 'like' | 'applaud' | 'curious';

export type ModerationStatus = 'ai_reviewed' | 'pending' | 'parent_approved' | 'rejected';

export type NotificationType =
  | 'like'
  | 'applaud'
  | 'curious'
  | 'reel_like'
  | 'comment'
  | 'comment_like'
  | 'follow'
  | 'mention'
  | 'achievement'
  | 'assignment_due'
  | 'event_reminder'
  | 'moderation_approved'
  | 'moderation_rejected'
  | 'shield_earned'
  | 'level_up'
  | 'school_announcement';

export type AchievementType = 'academic' | 'streak' | 'score' | 'first' | 'certificate';

export type ModeratorType = 'ai' | 'school_admin' | 'tuto_hq' | 'parent';

/** Role badge color tokens — matches design system */
export const ROLE_COLORS: Record<UserRole, string> = {
  student:     '#0B5FFF',
  parent:      '#10B981',
  teacher:     '#8B5CF6',
  coach:       '#8B5CF6',
  schoolAdmin: '#F97316',
  institute:   '#059669',
  guest:       '#6B7280',
};

/** Reaction color tokens */
export const REACTION_COLORS: Record<ReactionType, string> = {
  like:    '#FF3B5C',
  applaud: '#6366F1',
  curious: '#F59E0B',
};
