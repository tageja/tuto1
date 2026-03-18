-- Migration: 045_social_posts.sql
-- Social posts table — supports all 9 post types with moderation gate

CREATE TABLE IF NOT EXISTS social_posts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id          UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  post_type          VARCHAR(20) NOT NULL DEFAULT 'text'
                     CHECK (post_type IN (
                       'text','photo','video','album','poll',
                       'event','assignment','achievement','question','announcement'
                     )),
  content            TEXT NOT NULL DEFAULT '',
  media_urls         TEXT[] NOT NULL DEFAULT '{}',
  visibility         VARCHAR(20) NOT NULL DEFAULT 'schoolOnly'
                     CHECK (visibility IN ('public','schoolOnly','classOnly','followers','private')),
  audience_label     VARCHAR(100),         -- e.g. "Lớp 5A", "THCS Lê Quý Đôn"
  subjects           TEXT[] NOT NULL DEFAULT '{}',
  location           VARCHAR(255),
  school_id          UUID REFERENCES schools(id) ON DELETE SET NULL,
  class_id           UUID,                 -- references class when visibility=classOnly
  moderation_status  VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (moderation_status IN ('ai_reviewed','pending','parent_approved')),
  -- Denormalised counters (updated by triggers)
  like_count         INT NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  applaud_count      INT NOT NULL DEFAULT 0 CHECK (applaud_count >= 0),
  curious_count      INT NOT NULL DEFAULT 0 CHECK (curious_count >= 0),
  comments_count     INT NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  shares_count       INT NOT NULL DEFAULT 0 CHECK (shares_count >= 0),
  saves_count        INT NOT NULL DEFAULT 0 CHECK (saves_count >= 0),
  view_count         INT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  -- Type-specific JSONB payloads
  poll               JSONB,  -- { options:[{id,text,votes}], endDate, userVoted }
  event              JSONB,  -- { title, date, time, location, online, rsvpCount }
  assignment         JSONB,  -- { subject, dueDate, attachments }
  achievement        JSONB,  -- { type, badge, title, description }
  -- Feed control
  is_pinned          BOOLEAN NOT NULL DEFAULT FALSE,
  pin_order          SMALLINT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION social_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_posts_updated_at_trigger
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION social_posts_updated_at();

-- Increment author's post_count on new post
CREATE OR REPLACE FUNCTION social_posts_increment_post_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE social_profiles
  SET post_count = post_count + 1
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_posts_increment_count_trigger
  AFTER INSERT ON social_posts
  FOR EACH ROW EXECUTE FUNCTION social_posts_increment_post_count();

-- Decrement on delete
CREATE OR REPLACE FUNCTION social_posts_decrement_post_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE social_profiles
  SET post_count = GREATEST(0, post_count - 1)
  WHERE id = OLD.author_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER social_posts_decrement_count_trigger
  AFTER DELETE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION social_posts_decrement_post_count();

COMMENT ON TABLE social_posts IS 'tuto.social — All posts. Every post starts as pending moderation.';
COMMENT ON COLUMN social_posts.moderation_status IS 'ai_reviewed | pending | parent_approved. Gates visibility in feed.';
COMMENT ON COLUMN social_posts.school_id IS 'School-scoped post. RLS enforces cross-school isolation.';
COMMENT ON COLUMN social_posts.achievement IS 'Populated by backend trigger from Tuto milestone system.';
