-- Migration: 056_social_stories.sql
-- Stories feature — ephemeral content with 24h expiry

-- ============================================================================
-- social_stories
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_stories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  school_id         UUID REFERENCES schools(id) ON DELETE SET NULL,
  media_url         TEXT NOT NULL,
  media_type        VARCHAR(20) NOT NULL DEFAULT 'photo'
                    CHECK (media_type IN ('photo', 'video')),
  duration_seconds  INT NOT NULL DEFAULT 5 CHECK (duration_seconds > 0 AND duration_seconds <= 60),
  text_overlay      TEXT,
  text_color        VARCHAR(20) DEFAULT '#FFFFFF',
  audience          VARCHAR(20) NOT NULL DEFAULT 'school'
                    CHECK (audience IN ('public', 'school', 'followers')),
  view_count        INT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_stories_author_expires_idx
  ON social_stories (author_id, expires_at);
CREATE INDEX IF NOT EXISTS social_stories_school_expires_idx
  ON social_stories (school_id, expires_at) WHERE school_id IS NOT NULL;

-- ============================================================================
-- social_story_views
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_story_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES social_stories(id) ON DELETE CASCADE,
  viewer_id  UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS social_story_views_story_idx ON social_story_views (story_id);

-- Trigger: increment view_count on social_story_views INSERT
CREATE OR REPLACE FUNCTION social_story_views_increment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE social_stories SET view_count = view_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_story_views_count_trigger
  AFTER INSERT ON social_story_views
  FOR EACH ROW EXECUTE FUNCTION social_story_views_increment_count();

-- ============================================================================
-- social_story_reactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_story_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES social_stories(id) ON DELETE CASCADE,
  reactor_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  reaction   VARCHAR(20) NOT NULL DEFAULT 'emoji'
             CHECK (reaction IN ('emoji', 'like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, reactor_id)
);

CREATE INDEX IF NOT EXISTS social_story_reactions_story_idx ON social_story_reactions (story_id);

-- ============================================================================
-- RLS: social_stories
-- ============================================================================
ALTER TABLE social_stories ENABLE ROW LEVEL SECURITY;

-- SELECT: viewer sees if (follows author) OR (same school_id) OR (audience = 'public')
CREATE POLICY "social_stories_select_visible"
  ON social_stories FOR SELECT
  TO authenticated
  USING (
    expires_at > NOW()
    AND (
      author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
      OR audience = 'public'
      OR (audience = 'school' AND school_id = social_my_school_id())
      OR (audience = 'followers' AND EXISTS (
        SELECT 1 FROM social_follows
        WHERE follower_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
        AND following_id = author_id
      ))
    )
  );

CREATE POLICY "social_stories_insert_own"
  ON social_stories FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "social_stories_delete_own"
  ON social_stories FOR DELETE
  TO authenticated
  USING (
    author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- RLS: social_story_views
-- ============================================================================
ALTER TABLE social_story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_story_views_select_author_or_viewer"
  ON social_story_views FOR SELECT
  TO authenticated
  USING (
    viewer_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    OR story_id IN (
      SELECT id FROM social_stories
      WHERE author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "social_story_views_insert_own"
  ON social_story_views FOR INSERT
  TO authenticated
  WITH CHECK (
    viewer_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- RLS: social_story_reactions
-- ============================================================================
ALTER TABLE social_story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_story_reactions_select_authenticated"
  ON social_story_reactions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "social_story_reactions_insert_own"
  ON social_story_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    reactor_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "social_story_reactions_update_own"
  ON social_story_reactions FOR UPDATE
  TO authenticated
  USING (reactor_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()))
  WITH CHECK (reactor_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_story_reactions_delete_own"
  ON social_story_reactions FOR DELETE
  TO authenticated
  USING (reactor_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
SELECT 'social-stories', 'social-stories', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'social-stories');

COMMENT ON TABLE social_stories IS 'tuto.social — Ephemeral stories, 24h expiry. Visible by audience (public/school/followers).';
COMMENT ON TABLE social_story_views IS 'tuto.social — Who viewed which story. Triggers view_count increment.';
COMMENT ON TABLE social_story_reactions IS 'tuto.social — Emoji reactions on stories. One per user per story.';
