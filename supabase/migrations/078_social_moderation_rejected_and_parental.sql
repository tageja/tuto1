-- Migration: 078_social_moderation_rejected_and_parental.sql
-- Add 'rejected' to social_posts moderation_status + parental_settings for Part 9

-- Allow rejected status on social_posts (for moderation reject flow)
ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_moderation_status_check;
ALTER TABLE social_posts ADD CONSTRAINT social_posts_moderation_status_check
  CHECK (moderation_status IN ('ai_reviewed', 'pending', 'parent_approved', 'rejected'));

-- Parental controls: JSONB on social_profiles for child profiles
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS parental_settings JSONB DEFAULT '{}';
COMMENT ON COLUMN social_profiles.parental_settings IS 'Screen time limits, content filter level, activity report frequency. Set by parent for linked children.';
