// tuto.social — Supabase client for social features
//
// Re-exports the shared Supabase client from src/config/supabase.ts.
// Social services import from here so the import path is predictable
// and refactoring the client location only requires changing this file.

export { supabase as socialSupabase, getCurrentUser, getCurrentSession } from '../../config/supabase';

// Social-specific table names (typed constants prevent typos)
export const SOCIAL_TABLES = {
  profiles:         'social_profiles',
  posts:            'social_posts',
  likes:            'social_likes',
  saves:            'social_saves',
  follows:          'social_follows',
  comments:         'social_comments',
  commentLikes:     'social_comment_likes',
  notifications:    'social_notifications',
  moderationQueue:  'social_moderation_queue',
} as const;

export type SocialTableName = typeof SOCIAL_TABLES[keyof typeof SOCIAL_TABLES];
