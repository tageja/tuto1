-- Migration: 048_social_comments.sql
-- Threaded comments — 1 level of nesting enforced in Phase 1

CREATE TABLE IF NOT EXISTS social_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES social_comments(id) ON DELETE CASCADE,  -- NULL = top-level
  content         TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  is_teacher_pin  BOOLEAN NOT NULL DEFAULT FALSE,  -- teacher-pinned comment gets visual treatment
  like_count      INT NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION social_comments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_comments_updated_at_trigger
  BEFORE UPDATE ON social_comments
  FOR EACH ROW EXECUTE FUNCTION social_comments_updated_at();

-- Increment / decrement comments_count on social_posts
CREATE OR REPLACE FUNCTION social_comments_update_post_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER social_comments_post_count_trigger
  AFTER INSERT OR DELETE ON social_comments
  FOR EACH ROW EXECUTE FUNCTION social_comments_update_post_count();

-- Comment likes (separate small table, avoids joining social_likes which is post-scoped)
CREATE TABLE IF NOT EXISTS social_comment_likes (
  comment_id UUID NOT NULL REFERENCES social_comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE OR REPLACE FUNCTION social_comment_likes_update_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER social_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON social_comment_likes
  FOR EACH ROW EXECUTE FUNCTION social_comment_likes_update_count();

COMMENT ON TABLE social_comments IS 'tuto.social — Post comments. parent_id = NULL means top-level.';
COMMENT ON COLUMN social_comments.is_teacher_pin IS 'Teacher can pin their own comment; displayed prominently on achievement cards.';
