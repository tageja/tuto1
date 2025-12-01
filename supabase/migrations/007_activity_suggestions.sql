-- ============================================================================
-- Supabase Migration 007: Activity Suggestions
-- Description: Create school_activity_suggestions table for parent suggestions
-- ============================================================================

-- ============================================================================
-- CREATE TABLE: school_activity_suggestions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  class_id UUID NULL REFERENCES public.school_classes(id) ON DELETE SET NULL,
  date DATE NULL,
  title TEXT NOT NULL,
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Accepted', 'Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sug_school ON public.school_activity_suggestions (school_id, status);
CREATE INDEX IF NOT EXISTS idx_sug_parent ON public.school_activity_suggestions (parent_id);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.school_activity_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Parents can insert suggestions for their schools
CREATE POLICY "Parents can insert activity suggestions"
  ON public.school_activity_suggestions
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT DISTINCT ss.school_id
      FROM public.school_students ss
      WHERE ss.parent_email IN (
        SELECT email FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Parents can view their own suggestions
CREATE POLICY "Parents can view own suggestions"
  ON public.school_activity_suggestions
  FOR SELECT
  USING (
    parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR school_id IN (
      SELECT DISTINCT ss.school_id
      FROM public.school_students ss
      WHERE ss.parent_email IN (
        SELECT email FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Admins can view all suggestions for their schools
CREATE POLICY "Admins can view school suggestions"
  ON public.school_activity_suggestions
  FOR SELECT
  USING (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );

-- Admins can update suggestion status
CREATE POLICY "Admins can update suggestions"
  ON public.school_activity_suggestions
  FOR UPDATE
  USING (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );







