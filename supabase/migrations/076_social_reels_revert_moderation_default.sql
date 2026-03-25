-- Migration: 076_social_reels_revert_moderation_default.sql
-- Revert QA bypass: ensure new reels default to pending moderation.
-- The social_reels_auto_approve.sql (if it existed) would have set default to ai_reviewed.
-- This migration ensures DEFAULT is 'pending' for production.

ALTER TABLE social_reels ALTER COLUMN moderation_status SET DEFAULT 'pending';
