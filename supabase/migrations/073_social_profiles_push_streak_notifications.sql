-- Migration: 073_social_profiles_push_streak_notifications.sql
-- Part 7: Add push_token, streak columns to social_profiles; add reel_id and reel_like type to social_notifications

-- ============================================================================
-- social_profiles: push token (Expo Push), streak for post/reel contribution
-- ============================================================================
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0;
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS last_streak_date DATE;

CREATE INDEX IF NOT EXISTS idx_social_profiles_push_token
  ON social_profiles(push_token) WHERE push_token IS NOT NULL;

COMMENT ON COLUMN social_profiles.push_token IS 'Expo Push token for mobile push notifications';
COMMENT ON COLUMN social_profiles.streak_count IS 'Consecutive days with at least 1 post or reel created';
COMMENT ON COLUMN social_profiles.last_streak_date IS 'Last calendar date that counted toward streak (post/reel create only)';

-- ============================================================================
-- social_notifications: reel_id column + reel_like type
-- ============================================================================
ALTER TABLE social_notifications ADD COLUMN IF NOT EXISTS reel_id UUID REFERENCES social_reels(id) ON DELETE SET NULL;

-- Add reel_like to type constraint (drop existing, recreate with expanded list)
ALTER TABLE social_notifications DROP CONSTRAINT IF EXISTS social_notifications_type_check;
ALTER TABLE social_notifications ADD CONSTRAINT social_notifications_type_check
  CHECK (type IN (
    'like',
    'applaud',
    'curious',
    'reel_like',
    'comment',
    'comment_like',
    'follow',
    'mention',
    'achievement',
    'assignment_due',
    'event_reminder',
    'moderation_approved',
    'moderation_rejected',
    'shield_earned',
    'level_up',
    'school_announcement'
  ));

COMMENT ON COLUMN social_notifications.reel_id IS 'Reel reference for reel_like notifications';
