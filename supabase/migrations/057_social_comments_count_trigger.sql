-- Migration: 057_social_comments_count_trigger.sql
-- Auto-maintain social_posts.comments_count via DB trigger so any insert/delete
-- to social_comments (from any surface: app, admin, SSO) keeps the count correct.

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_posts
       SET comments_count = COALESCE(comments_count, 0) + 1
     WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_posts
       SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
     WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_comments_count ON social_comments;

CREATE TRIGGER trg_social_comments_count
AFTER INSERT OR DELETE ON social_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

COMMENT ON TRIGGER trg_social_comments_count ON social_comments
  IS 'Keeps social_posts.comments_count in sync after every insert/delete on social_comments';
