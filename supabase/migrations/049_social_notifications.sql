-- Migration: 049_social_notifications.sql
-- Notification system for all social activity types

CREATE TABLE IF NOT EXISTS social_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL = system notification
  type          VARCHAR(30) NOT NULL
                CHECK (type IN (
                  'like',
                  'applaud',
                  'curious',
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
                )),
  post_id       UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  comment_id    UUID REFERENCES social_comments(id) ON DELETE SET NULL,
  data          JSONB NOT NULL DEFAULT '{}',  -- flexible payload (e.g. achievement name, shield count)
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: unread notifications per user
CREATE INDEX IF NOT EXISTS social_notifications_recipient_read_idx
  ON social_notifications (recipient_id, read, created_at DESC);

COMMENT ON TABLE social_notifications IS 'tuto.social — All in-app notifications. actor_id NULL = system-generated.';
COMMENT ON COLUMN social_notifications.data IS 'Flexible JSON payload. E.g. {reactionType:"applaud"} or {achievementTitle:"Math Star"}.';
