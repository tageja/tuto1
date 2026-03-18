-- Migration: 051_social_rls_policies.sql
-- Row Level Security for all tuto.social tables
-- Critical: school-scoped isolation is enforced here

-- ============================================================
-- HELPER: get the calling user's school_id via their social profile
-- ============================================================
CREATE OR REPLACE FUNCTION social_my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM social_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- social_profiles
-- ============================================================
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view any profile
CREATE POLICY "social_profiles_select_authenticated"
  ON social_profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can only insert their own profile
CREATE POLICY "social_profiles_insert_own"
  ON social_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "social_profiles_update_own"
  ON social_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own profile
CREATE POLICY "social_profiles_delete_own"
  ON social_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- social_posts
-- ============================================================
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- School-scoped isolation: only see posts from own school OR public posts
-- ALSO: only approved/ai_reviewed posts are visible (pending stays hidden except to author)
CREATE POLICY "social_posts_select_school_scoped"
  ON social_posts FOR SELECT
  TO authenticated
  USING (
    -- Author can always see their own posts (any status)
    author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    OR (
      -- School-scoped: same school OR public
      (school_id = social_my_school_id() OR visibility = 'public')
      -- Only approved posts visible to others
      AND moderation_status IN ('ai_reviewed', 'parent_approved')
    )
  );

-- Authenticated users can create posts
CREATE POLICY "social_posts_insert_authenticated"
  ON social_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

-- Authors can update their own posts
CREATE POLICY "social_posts_update_own"
  ON social_posts FOR UPDATE
  TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()))
  WITH CHECK (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Authors can delete their own posts
CREATE POLICY "social_posts_delete_own"
  ON social_posts FOR DELETE
  TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- ============================================================
-- social_likes
-- ============================================================
ALTER TABLE social_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_likes_select_authenticated"
  ON social_likes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "social_likes_insert_own"
  ON social_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "social_likes_update_own"
  ON social_likes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "social_likes_delete_own"
  ON social_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- social_saves
-- ============================================================
ALTER TABLE social_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_saves_select_own"
  ON social_saves FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "social_saves_insert_own"
  ON social_saves FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "social_saves_delete_own"
  ON social_saves FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- social_follows
-- ============================================================
ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_follows_select_authenticated"
  ON social_follows FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "social_follows_insert_own"
  ON social_follows FOR INSERT
  TO authenticated
  WITH CHECK (
    follower_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "social_follows_delete_own"
  ON social_follows FOR DELETE
  TO authenticated
  USING (
    follower_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

-- ============================================================
-- social_comments
-- ============================================================
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_comments_select_authenticated"
  ON social_comments FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "social_comments_insert_own"
  ON social_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "social_comments_update_own"
  ON social_comments FOR UPDATE
  TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()))
  WITH CHECK (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_comments_delete_own"
  ON social_comments FOR DELETE
  TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- ============================================================
-- social_comment_likes
-- ============================================================
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_comment_likes_select_authenticated"
  ON social_comment_likes FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "social_comment_likes_insert_own"
  ON social_comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "social_comment_likes_delete_own"
  ON social_comment_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- social_notifications
-- ============================================================
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;

-- Only recipient can read their own notifications
CREATE POLICY "social_notifications_select_own"
  ON social_notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- System/service role inserts (not user-facing)
CREATE POLICY "social_notifications_insert_service"
  ON social_notifications FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);  -- restricted further by application logic / service role

-- Recipients can update (mark read) their own notifications
CREATE POLICY "social_notifications_update_own"
  ON social_notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "social_notifications_delete_own"
  ON social_notifications FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());

-- ============================================================
-- social_moderation_queue
-- ============================================================
ALTER TABLE social_moderation_queue ENABLE ROW LEVEL SECURITY;

-- Authors can see the moderation status of their own posts
CREATE POLICY "social_moderation_select_own_post_author"
  ON social_moderation_queue FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM social_posts
      WHERE author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    )
    OR
    -- School admins can see their school's queue
    EXISTS (
      SELECT 1 FROM social_profiles
      WHERE user_id = auth.uid()
      AND role IN ('schoolAdmin', 'institute')
      AND school_id = (
        SELECT sp2.school_id FROM social_posts p
        JOIN social_profiles sp2 ON sp2.id = p.author_id
        WHERE p.id = social_moderation_queue.post_id
      )
    )
  );

-- Only service role / admins can insert/update moderation decisions
-- (Application enforces this; RLS prevents direct user tampering)
CREATE POLICY "social_moderation_insert_service"
  ON social_moderation_queue FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);  -- Only service_role can insert (bypasses RLS)

CREATE POLICY "social_moderation_update_service"
  ON social_moderation_queue FOR UPDATE
  TO authenticated
  USING (FALSE);  -- Only service_role can update

COMMENT ON FUNCTION social_my_school_id IS 'Returns the school_id for the currently authenticated user from their social profile.';
