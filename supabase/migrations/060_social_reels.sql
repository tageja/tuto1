-- Migration: 060_social_reels.sql
-- Reels / Shorts feature — vertical video feed

-- ============================================================================
-- social_reels
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_reels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  school_id         UUID REFERENCES social_profiles(id),
  title             TEXT,
  description       TEXT,
  video_url         TEXT NOT NULL,
  thumbnail_url     TEXT,
  duration_seconds  INTEGER NOT NULL DEFAULT 0,
  width             INTEGER DEFAULT 1080,
  height            INTEGER DEFAULT 1920,
  subjects          TEXT[] DEFAULT '{}',
  audience          TEXT NOT NULL DEFAULT 'public'
                      CHECK (audience IN ('public','school','followers','private')),
  view_count        INTEGER NOT NULL DEFAULT 0,
  like_count        INTEGER NOT NULL DEFAULT 0,
  comment_count     INTEGER NOT NULL DEFAULT 0,
  share_count       INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
                      CHECK (moderation_status IN ('pending','ai_reviewed','parent_approved','rejected')),
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE social_reels ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved public reels
CREATE POLICY "reels_select_public" ON social_reels FOR SELECT
  USING (audience = 'public' AND moderation_status IN ('ai_reviewed','parent_approved'));

-- Authors can read their own reels regardless of status
CREATE POLICY "reels_select_own" ON social_reels FOR SELECT TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Authenticated users can insert (own profile only)
CREATE POLICY "reels_insert" ON social_reels FOR INSERT TO authenticated
  WITH CHECK (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Authors can delete their own
CREATE POLICY "reels_delete_own" ON social_reels FOR DELETE TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_social_reels_author ON social_reels(author_id);
CREATE INDEX IF NOT EXISTS idx_social_reels_school ON social_reels(school_id);
CREATE INDEX IF NOT EXISTS idx_social_reels_created ON social_reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_reels_moderation ON social_reels(moderation_status);

-- ============================================================================
-- social_reel_likes
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_reel_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id    UUID NOT NULL REFERENCES social_reels(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reel_id, profile_id)
);

ALTER TABLE social_reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reel_likes_select" ON social_reel_likes FOR SELECT USING (true);
CREATE POLICY "reel_likes_insert" ON social_reel_likes FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));
CREATE POLICY "reel_likes_delete" ON social_reel_likes FOR DELETE TO authenticated
  USING (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Auto-update like_count via trigger
CREATE OR REPLACE FUNCTION update_reel_like_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_reels SET like_count = like_count + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_reels SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reel_like_count_trigger
  AFTER INSERT OR DELETE ON social_reel_likes
  FOR EACH ROW EXECUTE FUNCTION update_reel_like_count();

-- Seed 3 test reels for development
INSERT INTO social_reels (author_id, video_url, thumbnail_url, duration_seconds, description, moderation_status, audience)
SELECT
  id,
  'https://test-videos.co.uk/vids/bigbuck/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://picsum.photos/seed/' || gen_random_uuid() || '/1080/1920',
  10,
  'Test reel by ' || display_name,
  'ai_reviewed',
  'public'
FROM social_profiles LIMIT 3;
