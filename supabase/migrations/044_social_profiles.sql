-- Migration: 044_social_profiles.sql
-- Social profiles table — extends auth.users with tuto.social identity

CREATE TABLE IF NOT EXISTS social_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username         VARCHAR(30) UNIQUE NOT NULL,
  display_name     VARCHAR(100),
  bio              TEXT,
  avatar_url       TEXT,
  cover_url        TEXT,
  role             VARCHAR(20) NOT NULL DEFAULT 'parent'
                   CHECK (role IN ('student','parent','teacher','schoolAdmin','coach','institute','guest')),
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  is_private       BOOLEAN NOT NULL DEFAULT FALSE,
  follower_count   INT NOT NULL DEFAULT 0 CHECK (follower_count >= 0),
  following_count  INT NOT NULL DEFAULT 0 CHECK (following_count >= 0),
  post_count       INT NOT NULL DEFAULT 0 CHECK (post_count >= 0),
  school_id        UUID REFERENCES schools(id) ON DELETE SET NULL,
  xp               INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level            SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  shield_count     INT NOT NULL DEFAULT 0 CHECK (shield_count >= 0),
  linked_tuto_id   VARCHAR(255),
  settings         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one profile per auth user
CREATE UNIQUE INDEX IF NOT EXISTS social_profiles_user_id_idx ON social_profiles (user_id);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION social_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_profiles_updated_at_trigger
  BEFORE UPDATE ON social_profiles
  FOR EACH ROW EXECUTE FUNCTION social_profiles_updated_at();

COMMENT ON TABLE social_profiles IS 'tuto.social — User social identities. One per auth.users row.';
COMMENT ON COLUMN social_profiles.role IS 'student | parent | teacher | schoolAdmin | coach | institute | guest';
COMMENT ON COLUMN social_profiles.shield_count IS 'Teacher gamification currency. Earned through educational content.';
COMMENT ON COLUMN social_profiles.xp IS 'Student XP for achievements and streaks.';
COMMENT ON COLUMN social_profiles.linked_tuto_id IS 'ID in the existing Tuto system for SSO cross-reference.';
