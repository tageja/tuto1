-- Migration: 081_social_shield_on_comment.sql
-- Award +1 shield to teacher when someone comments on their post (not self-comment)

CREATE OR REPLACE FUNCTION award_shield_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_role        TEXT;
BEGIN
  -- Find the post author
  SELECT author_id INTO v_post_author
  FROM social_posts
  WHERE id = NEW.post_id;

  IF v_post_author IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only award if post author is a teacher
  SELECT role INTO v_role
  FROM social_profiles
  WHERE id = v_post_author;

  IF v_role <> 'teacher' THEN
    RETURN NEW;
  END IF;

  -- Do not award shield for own comment on own post
  IF NEW.author_id = v_post_author THEN
    RETURN NEW;
  END IF;

  UPDATE social_profiles
  SET
    shield_count = shield_count + 1,
    shield_rank = CASE
      WHEN shield_count + 1 >= 1000 THEN 'elite'
      WHEN shield_count + 1 >= 400  THEN 'gold'
      WHEN shield_count + 1 >= 150  THEN 'silver'
      WHEN shield_count + 1 >= 50   THEN 'bronze'
      ELSE 'beginner'
    END
  WHERE id = v_post_author;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shield_on_comment ON social_comments;
CREATE TRIGGER trg_shield_on_comment
  AFTER INSERT ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION award_shield_on_comment();
