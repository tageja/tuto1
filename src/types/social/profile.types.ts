// tuto.social — Profile and user identity types

import { UserRole } from './common.types';

/** Lightweight user reference embedded in posts, comments, notifications */
export interface SocialUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  verified?: boolean;
  school?: string;
  institute?: string;
  subjects?: string[];
  username?: string;
}

/** Full social profile (maps to social_profiles table) */
export interface SocialProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  role: UserRole;
  isVerified: boolean;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  schoolId?: string;
  schoolName?: string;         // denormalised for display
  xp: number;
  level: number;               // 1–10
  streakCount: number;         // post/reel streak (days)
  shieldCount: number;         // teachers only
  shieldRank?: 'beginner' | 'bronze' | 'silver' | 'gold' | 'elite';
  linkedTutoId?: string;
  subjects?: string[];         // for teachers/students
  settings: SocialProfileSettings;
  createdAt: string;           // ISO date string
  updatedAt: string;
}

export interface SocialProfileSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  allowDirectMessages: boolean;
  showInDiscovery: boolean;
  language: 'vi' | 'en';
}

/** Payload for creating a new social profile */
export interface CreateSocialProfilePayload {
  username: string;
  displayName: string;
  role: UserRole;
  schoolId?: string;
  linkedTutoId?: string;
  avatarUrl?: string;
}

/** Payload for updating a social profile */
export interface UpdateSocialProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isPrivate?: boolean;
  subjects?: string[];
  settings?: Partial<SocialProfileSettings>;
}

/** Follow relationship */
export interface SocialFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

/** Teacher shield leaderboard entry */
export interface TeacherShieldEntry {
  profile: SocialProfile;
  rank: number;
  shieldCount: number;
  rankLabel: 'beginner' | 'bronze' | 'silver' | 'gold' | 'elite';
}
