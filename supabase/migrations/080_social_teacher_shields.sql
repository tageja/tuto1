-- Migration: 080_social_teacher_shields.sql
-- Add shield_rank column and auto-update trigger for teachers

ALTER TABLE social_profiles
  ADD COLUMN IF NOT EXISTS shield_rank TEXT NOT NULL DEFAULT 'beginner'
  CHECK (shield_rank IN ('beginner','bronze','silver','gold','elite'));

-- Trigger function: award shields on educational posts by teachers
CREATE OR REPLACE FUNCTION award_teacher_shields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_shields INT;
  v_new_count INT;
BEGIN
  -- Only for teacher posts
  SELECT role INTO v_role FROM social_profiles WHERE id = NEW.author_id;
  IF v_role <> 'teacher' THEN
    RETURN NEW;
  END IF;

  -- +5 if educational (has subjects), +1 otherwise
  -- social_posts.subjects is TEXT[], use array_length not jsonb_array_length
  IF NEW.subjects IS NOT NULL AND COALESCE(array_length(NEW.subjects, 1), 0) > 0 THEN
    v_shields := 5;
  ELSE
    v_shields := 1;
  END IF;

  v_new_count := (SELECT shield_count FROM social_profiles WHERE id = NEW.author_id) + v_shields;

  UPDATE social_profiles
  SET
    shield_count = v_new_count,
    shield_rank = CASE
      WHEN v_new_count >= 1000 THEN 'elite'
      WHEN v_new_count >= 400  THEN 'gold'
      WHEN v_new_count >= 150  THEN 'silver'
      WHEN v_new_count >= 50   THEN 'bronze'
      ELSE 'beginner'
    END
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_teacher_shields ON social_posts;
CREATE TRIGGER trg_award_teacher_shields
  AFTER INSERT ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION award_teacher_shields();
