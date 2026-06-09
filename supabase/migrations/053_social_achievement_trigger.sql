-- 053_social_achievement_trigger.sql
-- RPC scaffold: create an achievement post on behalf of a user.
-- Called from mobile/backend when a learning milestone is reached.
-- TODO: connect to milestone table when created (e.g. learning_milestones, badge_awards)

-- ============================================================
-- create_achievement_post
-- ============================================================
-- Parameters:
--   p_user_id    UUID  — auth.users.id of the learner
--   p_type       TEXT  — achievement type (academic | streak | score | first | certificate)
--   p_badge      TEXT  — badge identifier / icon key
--   p_title      TEXT  — short display title
--   p_description TEXT — longer description shown in the post body
-- Returns: UUID of the new social_posts row, or NULL if profile missing
-- ============================================================
CREATE OR REPLACE FUNCTION create_achievement_post(
  p_user_id     UUID,
  p_type        TEXT,
  p_badge       TEXT,
  p_title       TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_school_id  UUID;
  v_post_id    UUID;
BEGIN
  -- Look up the social profile for this user
  SELECT id, school_id
    INTO v_profile_id, v_school_id
    FROM social_profiles
   WHERE user_id = p_user_id
   LIMIT 1;

  -- If no social profile exists yet, return NULL (caller should ensure profile first)
  IF v_profile_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Insert achievement post (starts as pending for moderation)
  INSERT INTO social_posts (
    author_id,
    school_id,
    post_type,
    content,
    visibility,
    moderation_status,
    subjects,
    achievement
  ) VALUES (
    v_profile_id,
    v_school_id,
    'achievement',
    COALESCE(p_description, p_title),
    'school_only',            -- default: visible to school; caller may override via UPDATE
    'pending',
    ARRAY[]::TEXT[],
    jsonb_build_object(
      'type',        p_type,
      'badge',       p_badge,
      'title',       p_title,
      'description', COALESCE(p_description, p_title)
    )
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;

-- Grant execute to authenticated users and service_role
GRANT EXECUTE ON FUNCTION create_achievement_post(UUID, TEXT, TEXT, TEXT, TEXT)
  TO authenticated, service_role;

-- ============================================================
-- Trigger scaffold (placeholder — no milestone table yet)
-- ============================================================
-- TODO: When a `learning_milestones` or `badge_awards` table is created,
--       add a trigger like:
--
-- CREATE OR REPLACE FUNCTION trg_achievement_to_social_post()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   PERFORM create_achievement_post(
--     NEW.user_id,
--     NEW.achievement_type,
--     NEW.badge_key,
--     NEW.title,
--     NEW.description
--   );
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE TRIGGER after_milestone_insert
-- AFTER INSERT ON learning_milestones
-- FOR EACH ROW EXECUTE FUNCTION trg_achievement_to_social_post();
