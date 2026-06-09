-- Migration: 047_social_follows.sql
-- Follow graph — school-scoped in Phase 1

CREATE TABLE IF NOT EXISTS social_follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A user cannot follow themselves
  CONSTRAINT social_follows_no_self_follow CHECK (follower_id <> following_id)
);

-- A user can only follow another user once
CREATE UNIQUE INDEX IF NOT EXISTS social_follows_pair_idx
  ON social_follows (follower_id, following_id);

-- --------------------------------------------------------------------------
-- Triggers: keep follower_count / following_count on social_profiles in sync
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION social_follows_update_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE social_profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE social_profiles SET follower_count  = GREATEST(0, follower_count  - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER social_follows_counts_trigger
  AFTER INSERT OR DELETE ON social_follows
  FOR EACH ROW EXECUTE FUNCTION social_follows_update_counts();

COMMENT ON TABLE social_follows IS 'tuto.social — Follow graph. Phase 1 is school-scoped; Phase 2 opens cross-school.';
