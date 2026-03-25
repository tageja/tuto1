-- Migration: 074_social_notification_triggers.sql
-- Part 7: Create notifications on like, comment, follow, reel_like
--
-- Push delivery: Run `SELECT * FROM pg_extension WHERE extname = 'pg_net';` before using pg_net.
-- If pg_net not enabled, use Supabase Dashboard → Database → Webhooks to configure
-- INSERT on social_notifications → POST to Edge Function URL (social-notify).

-- ============================================================================
-- Helper: Insert notification (SECURITY DEFINER for trigger context)
-- ============================================================================
CREATE OR REPLACE FUNCTION social_notify_insert(
  p_recipient_user_id UUID,
  p_actor_user_id     UUID,
  p_type              TEXT,
  p_post_id           UUID DEFAULT NULL,
  p_comment_id        UUID DEFAULT NULL,
  p_reel_id           UUID DEFAULT NULL,
  p_data              JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip self-notifications
  IF p_recipient_user_id = p_actor_user_id THEN
    RETURN;
  END IF;

  INSERT INTO social_notifications (
    recipient_id, actor_id, type, post_id, comment_id, reel_id, data
  ) VALUES (
    p_recipient_user_id, p_actor_user_id, p_type, p_post_id, p_comment_id, p_reel_id, p_data
  );
END;
$$;

-- ============================================================================
-- social_likes: Notify post author when someone likes/applauds/curious
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_notify_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_user_id UUID;
BEGIN
  SELECT sp.user_id INTO v_author_user_id
    FROM social_posts p
    JOIN social_profiles sp ON sp.id = p.author_id
   WHERE p.id = NEW.post_id;

  IF v_author_user_id IS NOT NULL THEN
    PERFORM social_notify_insert(
      v_author_user_id,
      NEW.user_id,
      NEW.reaction_type,
      p_post_id => NEW.post_id,
      p_data => jsonb_build_object('reactionType', NEW.reaction_type)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_likes_notify ON social_likes;
CREATE TRIGGER trg_social_likes_notify
  AFTER INSERT ON social_likes
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_like();

-- ============================================================================
-- social_comments: Notify post author when someone comments
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_user_id UUID;
  v_commenter_user_id UUID;
BEGIN
  SELECT sp.user_id INTO v_author_user_id
    FROM social_posts p
    JOIN social_profiles sp ON sp.id = p.author_id
   WHERE p.id = NEW.post_id;

  SELECT user_id INTO v_commenter_user_id FROM social_profiles WHERE id = NEW.author_id;

  IF v_author_user_id IS NOT NULL AND v_commenter_user_id IS NOT NULL THEN
    PERFORM social_notify_insert(
      v_author_user_id,
      v_commenter_user_id,
      'comment',
      p_post_id => NEW.post_id,
      p_comment_id => NEW.id,
      p_data => jsonb_build_object('contentPreview', LEFT(NEW.content, 50))
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_comments_notify ON social_comments;
CREATE TRIGGER trg_social_comments_notify
  AFTER INSERT ON social_comments
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_comment();

-- ============================================================================
-- social_follows: Notify user when someone follows them
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_following_user_id UUID;
  v_follower_user_id  UUID;
BEGIN
  SELECT user_id INTO v_following_user_id FROM social_profiles WHERE id = NEW.following_id;
  SELECT user_id INTO v_follower_user_id  FROM social_profiles WHERE id = NEW.follower_id;

  IF v_following_user_id IS NOT NULL AND v_follower_user_id IS NOT NULL THEN
    PERFORM social_notify_insert(
      v_following_user_id,
      v_follower_user_id,
      'follow',
      p_data => '{}'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_follows_notify ON social_follows;
CREATE TRIGGER trg_social_follows_notify
  AFTER INSERT ON social_follows
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_follow();

-- ============================================================================
-- social_reel_likes: Notify reel author when someone likes their reel
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_notify_on_reel_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_user_id UUID;
  v_liker_user_id  UUID;
BEGIN
  SELECT sp.user_id INTO v_author_user_id
    FROM social_reels r
    JOIN social_profiles sp ON sp.id = r.author_id
   WHERE r.id = NEW.reel_id;

  SELECT user_id INTO v_liker_user_id FROM social_profiles WHERE id = NEW.profile_id;

  IF v_author_user_id IS NOT NULL AND v_liker_user_id IS NOT NULL THEN
    PERFORM social_notify_insert(
      v_author_user_id,
      v_liker_user_id,
      'reel_like',
      p_reel_id => NEW.reel_id,
      p_data => jsonb_build_object('reelId', NEW.reel_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_reel_likes_notify ON social_reel_likes;
CREATE TRIGGER trg_social_reel_likes_notify
  AFTER INSERT ON social_reel_likes
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_reel_like();
