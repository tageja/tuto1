// tuto.social — Post, comment, and notification types

import {
  PostType,
  PostVisibility,
  ReactionType,
  ModerationStatus,
  NotificationType,
  AchievementType,
} from './common.types';
import { SocialUser } from './profile.types';

// --------------------------------------------------------------------------
// Post type-specific payloads
// --------------------------------------------------------------------------

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  options: PollOption[];
  endDate: string;     // ISO date string
  userVoted?: string;  // option id the current user voted for
  totalVotes: number;
}

export interface EventData {
  title: string;
  date: string;        // ISO date string
  time: string;        // e.g. "14:00"
  location?: string;
  online?: string;     // meeting link for virtual events
  rsvpCount: number;
  userRsvp?: 'going' | 'interested';
}

export interface AssignmentData {
  subject: string;
  dueDate: string;     // ISO date string
  attachments?: string[];
  submitted?: boolean;
}

export interface AchievementData {
  type: AchievementType;
  badge: string;       // emoji or image URL
  title: string;
  description: string;
  subject?: string;
  gradeLevel?: string;
}

export interface VideoData {
  url: string;
  thumbnailUrl: string;
  durationSeconds: number;
  isShorts?: boolean;
  captionsUrl?: string;
  ageAppropriate?: boolean;
}

// --------------------------------------------------------------------------
// Reactions summary
// --------------------------------------------------------------------------

export interface ReactionCounts {
  like: number;
  applaud: number;
  curious: number;
}

// --------------------------------------------------------------------------
// Main post type
// --------------------------------------------------------------------------

export interface SocialPost {
  id: string;
  author: SocialUser;
  postType: PostType;
  content: string;
  mediaUrls: string[];
  visibility: PostVisibility;
  audienceLabel?: string;
  subjects: string[];
  location?: string;
  schoolId?: string;
  classId?: string;
  moderationStatus: ModerationStatus;
  reactions: ReactionCounts;
  userReaction?: ReactionType;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewCount: number;
  saved?: boolean;
  isPinned: boolean;
  pinOrder?: number;
  // Type-specific payloads (null if not applicable)
  poll?: Poll;
  event?: EventData;
  assignment?: AssignmentData;
  achievement?: AchievementData;
  video?: VideoData;
  createdAt: string;   // ISO date string
  updatedAt: string;
}

/** Payload for creating a new post */
export interface CreatePostPayload {
  postType: PostType;
  content: string;
  mediaUrls?: string[];
  visibility: PostVisibility;
  audienceLabel?: string;
  subjects?: string[];
  location?: string;
  schoolId?: string;
  classId?: string;
  poll?: Omit<Poll, 'totalVotes' | 'userVoted'>;
  event?: Omit<EventData, 'rsvpCount' | 'userRsvp'>;
  assignment?: Omit<AssignmentData, 'submitted'>;
  achievement?: AchievementData;
}

// --------------------------------------------------------------------------
// Comments
// --------------------------------------------------------------------------

export interface SocialComment {
  id: string;
  postId: string;
  author: SocialUser;
  parentId?: string;      // null = top-level comment
  content: string;
  isPinned: boolean;
  isTeacherPin: boolean;
  likeCount: number;
  userLiked?: boolean;
  replies?: SocialComment[];
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  parentId?: string;
}

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

export interface SocialNotification {
  id: string;
  recipientId: string;
  actor?: SocialUser;
  type: NotificationType;
  postId?: string;
  post?: Pick<SocialPost, 'id' | 'postType' | 'content' | 'mediaUrls'>;
  commentId?: string;
  reelId?: string;
  data: Record<string, unknown>;   // flexible payload
  read: boolean;
  createdAt: string;
}
