-- Migration: 052_social_indexes.sql
-- Performance indexes for all tuto.social tables

-- --------------------------------------------------------------------------
-- social_profiles
-- --------------------------------------------------------------------------
-- Username lookup (auth, profile pages)
CREATE INDEX IF NOT EXISTS social_profiles_username_lower_idx
  ON social_profiles (LOWER(username));

-- User ID lookup (SSO, profile fetch)
CREATE INDEX IF NOT EXISTS social_profiles_user_id_btree_idx
  ON social_profiles (user_id);

-- School roster queries
CREATE INDEX IF NOT EXISTS social_profiles_school_id_idx
  ON social_profiles (school_id);

-- Teacher discovery by role + school
CREATE INDEX IF NOT EXISTS social_profiles_role_school_idx
  ON social_profiles (role, school_id);

-- Teacher leaderboard (shield_count DESC)
CREATE INDEX IF NOT EXISTS social_profiles_shield_count_idx
  ON social_profiles (shield_count DESC) WHERE role = 'teacher';

-- --------------------------------------------------------------------------
-- social_posts
-- --------------------------------------------------------------------------
-- Default feed (newest first)
CREATE INDEX IF NOT EXISTS social_posts_created_at_desc_idx
  ON social_posts (created_at DESC);

-- Author's post list
CREATE INDEX IF NOT EXISTS social_posts_author_id_idx
  ON social_posts (author_id, created_at DESC);

-- School feed (primary access pattern — most important index)
CREATE INDEX IF NOT EXISTS social_posts_school_created_idx
  ON social_posts (school_id, created_at DESC)
  WHERE moderation_status IN ('ai_reviewed', 'parent_approved');

-- Moderation queue admin view
CREATE INDEX IF NOT EXISTS social_posts_moderation_status_idx
  ON social_posts (moderation_status, created_at DESC);

-- Public posts (cross-school explore)
CREATE INDEX IF NOT EXISTS social_posts_public_idx
  ON social_posts (created_at DESC)
  WHERE visibility = 'public' AND moderation_status IN ('ai_reviewed', 'parent_approved');

-- Post type filter (e.g. achievements feed)
CREATE INDEX IF NOT EXISTS social_posts_type_idx
  ON social_posts (post_type, created_at DESC);

-- Pinned posts per school
CREATE INDEX IF NOT EXISTS social_posts_pinned_idx
  ON social_posts (school_id, pin_order)
  WHERE is_pinned = TRUE;

-- --------------------------------------------------------------------------
-- social_likes
-- --------------------------------------------------------------------------
-- Look up all reactions on a post
CREATE INDEX IF NOT EXISTS social_likes_post_id_idx
  ON social_likes (post_id);

-- Look up all reactions by a user
CREATE INDEX IF NOT EXISTS social_likes_user_id_idx
  ON social_likes (user_id);

-- --------------------------------------------------------------------------
-- social_saves
-- --------------------------------------------------------------------------
-- User's saved posts list
CREATE INDEX IF NOT EXISTS social_saves_user_id_idx
  ON social_saves (user_id, created_at DESC);

-- --------------------------------------------------------------------------
-- social_follows
-- --------------------------------------------------------------------------
-- "Who does X follow?" — following feed
CREATE INDEX IF NOT EXISTS social_follows_follower_idx
  ON social_follows (follower_id);

-- "Who follows X?" — followers list
CREATE INDEX IF NOT EXISTS social_follows_following_idx
  ON social_follows (following_id);

-- --------------------------------------------------------------------------
-- social_comments
-- --------------------------------------------------------------------------
-- All comments on a post (ordered)
CREATE INDEX IF NOT EXISTS social_comments_post_id_idx
  ON social_comments (post_id, created_at ASC);

-- Replies to a comment
CREATE INDEX IF NOT EXISTS social_comments_parent_id_idx
  ON social_comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- Pinned comments per post
CREATE INDEX IF NOT EXISTS social_comments_pinned_idx
  ON social_comments (post_id, is_pinned DESC)
  WHERE is_pinned = TRUE;

-- --------------------------------------------------------------------------
-- social_notifications
-- --------------------------------------------------------------------------
-- Already created in 049, listed here for documentation completeness:
-- social_notifications_recipient_read_idx ON social_notifications (recipient_id, read, created_at DESC)

-- Recent notifications per type (for grouping — e.g. "45 people liked")
CREATE INDEX IF NOT EXISTS social_notifications_type_recipient_idx
  ON social_notifications (recipient_id, type, created_at DESC);

-- --------------------------------------------------------------------------
-- social_moderation_queue
-- --------------------------------------------------------------------------
-- Already created in 050; additional index for post author look-up:
CREATE INDEX IF NOT EXISTS social_moderation_post_status_idx
  ON social_moderation_queue (post_id, status);
