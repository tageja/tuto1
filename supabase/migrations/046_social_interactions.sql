-- Migration: 046_social_interactions.sql
-- Likes (with reaction type) and saves on posts

-- Reactions table: like / applaud / curious
CREATE TABLE IF NOT EXISTS social_likes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type  VARCHAR(10) NOT NULL DEFAULT 'like'
                 CHECK (reaction_type IN ('like','applaud','curious')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One reaction per user per post (any type)
CREATE UNIQUE INDEX IF NOT EXISTS social_likes_post_user_idx
  ON social_likes (post_id, user_id);

-- Saves table
CREATE TABLE IF NOT EXISTS social_saves (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS social_saves_post_user_idx
  ON social_saves (post_id, user_id);

-- --------------------------------------------------------------------------
-- Triggers: keep denormalised counters on social_posts in sync
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION social_likes_update_counters()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment the specific reaction counter
    IF NEW.reaction_type = 'like' THEN
      UPDATE social_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.reaction_type = 'applaud' THEN
      UPDATE social_posts SET applaud_count = applaud_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.reaction_type = 'curious' THEN
      UPDATE social_posts SET curious_count = curious_count + 1 WHERE id = NEW.post_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE social_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.reaction_type = 'applaud' THEN
      UPDATE social_posts SET applaud_count = GREATEST(0, applaud_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.reaction_type = 'curious' THEN
      UPDATE social_posts SET curious_count = GREATEST(0, curious_count - 1) WHERE id = OLD.post_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type <> NEW.reaction_type THEN
    -- Reaction type changed — decrement old, increment new
    CASE OLD.reaction_type
      WHEN 'like'    THEN UPDATE social_posts SET like_count    = GREATEST(0, like_count - 1)    WHERE id = OLD.post_id;
      WHEN 'applaud' THEN UPDATE social_posts SET applaud_count = GREATEST(0, applaud_count - 1) WHERE id = OLD.post_id;
      WHEN 'curious' THEN UPDATE social_posts SET curious_count = GREATEST(0, curious_count - 1) WHERE id = OLD.post_id;
    END CASE;
    CASE NEW.reaction_type
      WHEN 'like'    THEN UPDATE social_posts SET like_count    = like_count + 1    WHERE id = NEW.post_id;
      WHEN 'applaud' THEN UPDATE social_posts SET applaud_count = applaud_count + 1 WHERE id = NEW.post_id;
      WHEN 'curious' THEN UPDATE social_posts SET curious_count = curious_count + 1 WHERE id = NEW.post_id;
    END CASE;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER social_likes_counters_trigger
  AFTER INSERT OR UPDATE OR DELETE ON social_likes
  FOR EACH ROW EXECUTE FUNCTION social_likes_update_counters();

CREATE OR REPLACE FUNCTION social_saves_update_counter()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER social_saves_counter_trigger
  AFTER INSERT OR DELETE ON social_saves
  FOR EACH ROW EXECUTE FUNCTION social_saves_update_counter();

COMMENT ON TABLE social_likes IS 'tuto.social — Post reactions (like / applaud / curious). One per user per post.';
COMMENT ON TABLE social_saves IS 'tuto.social — Saved posts bookmarks. One per user per post.';
