-- Migration: 075_social_xp_level_streak_triggers.sql
-- Part 7: XP + Level (1-5) triggers, create_level_up_post (ai_reviewed), update_streak (post/reel only)
-- Level thresholds: L1=0, L2=100, L3=300, L4=700, L5=1500

-- ============================================================================
-- create_level_up_post — Level-up achievement post with ai_reviewed (viral loop)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_level_up_post(
  p_user_id UUID,
  p_level   SMALLINT
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
  v_title      TEXT;
  v_desc       TEXT;
BEGIN
  SELECT id, school_id INTO v_profile_id, v_school_id
    FROM social_profiles WHERE user_id = p_user_id LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN NULL;
  END IF;

  v_title := 'Level ' || p_level || '!';
  v_desc  := 'Reached level ' || p_level || '!';

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
    v_desc,
    'schoolOnly',
    'ai_reviewed',
    ARRAY[]::TEXT[],
    jsonb_build_object(
      'type', 'level',
      'badge', 'level_up',
      'title', v_title,
      'description', v_desc,
      'level', p_level
    )
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_level_up_post(UUID, SMALLINT) TO authenticated, service_role;

-- ============================================================================
-- update_streak — Post/reel streak only (PM: no login streak). Call from triggers.
-- ============================================================================
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_count     INT;
BEGIN
  SELECT last_streak_date, streak_count INTO v_last_date, v_count
    FROM social_profiles WHERE user_id = p_user_id;

  IF v_last_date IS NULL THEN
    -- First activity
    UPDATE social_profiles SET streak_count = 1, last_streak_date = CURRENT_DATE
      WHERE user_id = p_user_id;
  ELSIF v_last_date = CURRENT_DATE THEN
    -- Already counted today, no change
    NULL;
  ELSIF v_last_date = CURRENT_DATE - 1 THEN
    -- Yesterday, increment
    UPDATE social_profiles SET streak_count = streak_count + 1, last_streak_date = CURRENT_DATE
      WHERE user_id = p_user_id;
  ELSE
    -- Missed day(s), reset
    UPDATE social_profiles SET streak_count = 1, last_streak_date = CURRENT_DATE
      WHERE user_id = p_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_streak(UUID) TO authenticated, service_role;

-- ============================================================================
-- add_xp_and_check_level — Add XP, compute level, create level-up post + notification
-- Level thresholds: L1=0, L2=100, L3=300, L4=700, L5=1500
-- ============================================================================
CREATE OR REPLACE FUNCTION add_xp_and_check_level(
  p_profile_id UUID,
  p_amount    INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_new_xp    INT;
  v_old_level SMALLINT;
  v_new_level SMALLINT;
  v_post_id   UUID;
  LEVEL_1 CONSTANT INT := 0;
  LEVEL_2 CONSTANT INT := 100;
  LEVEL_3 CONSTANT INT := 300;
  LEVEL_4 CONSTANT INT := 700;
  LEVEL_5 CONSTANT INT := 1500;
BEGIN
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE social_profiles
  SET xp = xp + p_amount
  WHERE id = p_profile_id
  RETURNING user_id, xp, level INTO v_user_id, v_new_xp, v_old_level;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Compute new level (1-5)
  v_new_level := 1;
  IF v_new_xp >= LEVEL_5 THEN v_new_level := 5;
  ELSIF v_new_xp >= LEVEL_4 THEN v_new_level := 4;
  ELSIF v_new_xp >= LEVEL_3 THEN v_new_level := 3;
  ELSIF v_new_xp >= LEVEL_2 THEN v_new_level := 2;
  END IF;

  IF v_new_level > v_old_level THEN
    UPDATE social_profiles SET level = v_new_level WHERE id = p_profile_id;

    v_post_id := create_level_up_post(v_user_id, v_new_level);

    INSERT INTO social_notifications (recipient_id, actor_id, type, post_id, data)
    VALUES (v_user_id, NULL, 'level_up', v_post_id, jsonb_build_object('level', v_new_level, 'postId', v_post_id));
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION add_xp_and_check_level(UUID, INT) TO authenticated, service_role;

-- ============================================================================
-- Triggers: XP + Streak
-- ============================================================================

-- social_posts INSERT: +10 XP (exclude achievement), update_streak
CREATE OR REPLACE FUNCTION trg_xp_streak_on_post_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.post_type != 'achievement' THEN
    PERFORM add_xp_and_check_level(NEW.author_id, 10);
  END IF;

  SELECT user_id INTO v_user_id FROM social_profiles WHERE id = NEW.author_id;
  IF v_user_id IS NOT NULL THEN
    PERFORM update_streak(v_user_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_posts_xp_streak ON social_posts;
CREATE TRIGGER trg_social_posts_xp_streak
  AFTER INSERT ON social_posts
  FOR EACH ROW EXECUTE FUNCTION trg_xp_streak_on_post_insert();

-- social_likes INSERT: +5 XP for post author
CREATE OR REPLACE FUNCTION trg_xp_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT author_id INTO v_author_id FROM social_posts WHERE id = NEW.post_id;
  IF v_author_id IS NOT NULL THEN
    PERFORM add_xp_and_check_level(v_author_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_likes_xp ON social_likes;
CREATE TRIGGER trg_social_likes_xp
  AFTER INSERT ON social_likes
  FOR EACH ROW EXECUTE FUNCTION trg_xp_on_like();

-- social_comments INSERT: +3 XP for post author
CREATE OR REPLACE FUNCTION trg_xp_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  SELECT author_id INTO v_author_id FROM social_posts WHERE id = NEW.post_id;
  IF v_author_id IS NOT NULL THEN
    PERFORM add_xp_and_check_level(v_author_id, 3);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_comments_xp ON social_comments;
CREATE TRIGGER trg_social_comments_xp
  AFTER INSERT ON social_comments
  FOR EACH ROW EXECUTE FUNCTION trg_xp_on_comment();

-- social_follows INSERT: +15 XP for user who got followed (following_id)
CREATE OR REPLACE FUNCTION trg_xp_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM add_xp_and_check_level(NEW.following_id, 15);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_follows_xp ON social_follows;
CREATE TRIGGER trg_social_follows_xp
  AFTER INSERT ON social_follows
  FOR EACH ROW EXECUTE FUNCTION trg_xp_on_follow();

-- social_reels INSERT: +20 XP, update_streak
CREATE OR REPLACE FUNCTION trg_xp_streak_on_reel_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  PERFORM add_xp_and_check_level(NEW.author_id, 20);

  SELECT user_id INTO v_user_id FROM social_profiles WHERE id = NEW.author_id;
  IF v_user_id IS NOT NULL THEN
    PERFORM update_streak(v_user_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_reels_xp_streak ON social_reels;
CREATE TRIGGER trg_social_reels_xp_streak
  AFTER INSERT ON social_reels
  FOR EACH ROW EXECUTE FUNCTION trg_xp_streak_on_reel_insert();
