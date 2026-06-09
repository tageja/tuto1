-- 054_social_anon_read_policies.sql
-- Allow anonymous (unauthenticated) users to read:
--   1. social_posts with visibility='public' and moderation_status in ('ai_reviewed','parent_approved')
--   2. social_profiles for verified teachers (for TrendingEducators widget on dashboard)
-- These are needed for the dashboard FeedPreview and TrendingEducators widgets
-- which use the Supabase anon client (no auth cookie).

-- ============================================================
-- social_posts: public feed visible to anon visitors
-- ============================================================
CREATE POLICY "social_posts_select_public_anon"
  ON social_posts FOR SELECT
  TO anon
  USING (
    visibility = 'public'
    AND moderation_status IN ('ai_reviewed', 'parent_approved')
  );

-- ============================================================
-- social_profiles: verified teacher profiles visible to anon
-- (for TrendingEducators and public teacher profile pages)
-- ============================================================
CREATE POLICY "social_profiles_select_public_anon"
  ON social_profiles FOR SELECT
  TO anon
  USING (
    is_verified = TRUE
    AND role IN ('teacher', 'schoolAdmin', 'institute')
  );
