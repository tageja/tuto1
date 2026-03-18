-- Migration: 050_social_moderation.sql
-- Moderation queue — every post goes through a gate before appearing in feed

CREATE TABLE IF NOT EXISTS social_moderation_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  moderator_type  VARCHAR(20)
                  CHECK (moderator_type IN ('ai','school_admin','tuto_hq','parent')),
  moderator_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decision_at     TIMESTAMPTZ,
  reason          TEXT,              -- rejection reason shown to author
  ai_score        FLOAT              -- 0–1 safety score from AI screening
                  CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 1)),
  ai_categories   JSONB DEFAULT '{}', -- OpenAI moderation API category flags
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_moderation_queue_status_idx
  ON social_moderation_queue (status, created_at DESC);

CREATE INDEX IF NOT EXISTS social_moderation_queue_post_idx
  ON social_moderation_queue (post_id);

-- Auto-enqueue every new post into the moderation queue
CREATE OR REPLACE FUNCTION social_moderation_auto_enqueue()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO social_moderation_queue (post_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_posts_auto_enqueue_trigger
  AFTER INSERT ON social_posts
  FOR EACH ROW EXECUTE FUNCTION social_moderation_auto_enqueue();

-- When moderation is approved, update the post's moderation_status
CREATE OR REPLACE FUNCTION social_moderation_sync_post_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE social_posts
    SET moderation_status = CASE NEW.moderator_type
      WHEN 'ai'     THEN 'ai_reviewed'
      WHEN 'parent' THEN 'parent_approved'
      ELSE               'ai_reviewed'
    END
    WHERE id = NEW.post_id;
    NEW.decision_at = NOW();
  ELSIF NEW.status = 'rejected' THEN
    NEW.decision_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_moderation_sync_status_trigger
  BEFORE UPDATE ON social_moderation_queue
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved','rejected'))
  EXECUTE FUNCTION social_moderation_sync_post_status();

COMMENT ON TABLE social_moderation_queue IS 'tuto.social — Every post is auto-enqueued here on creation. Legal requirement for Vietnam child safety.';
COMMENT ON COLUMN social_moderation_queue.ai_score IS 'Probability score from OpenAI moderation API. 0 = safe, 1 = unsafe.';
COMMENT ON COLUMN social_moderation_queue.moderator_type IS 'ai = automated pass; school_admin = admin reviewed; tuto_hq = platform reviewed; parent = parent approved student post.';
