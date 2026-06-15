-- ============================================================================
-- Migration 054: Platform Feedback (School Admin → Tuto)
-- Distinct from migration 025 (Parent ↔ School feedback). Do not conflate.
-- ============================================================================

-- Helper: is the current auth.uid() a Tuto platform admin?
-- Tuto platform admin = public.users.role = 'admin'. School admin = 'school_admin'.
CREATE OR REPLACE FUNCTION public.is_tuto_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Table
CREATE TABLE IF NOT EXISTS public.platform_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  submitted_by_user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category              TEXT NOT NULL CHECK (category IN ('bug','feature','improvement','question','other')),
  body                  TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 5000),
  status                TEXT NOT NULL CHECK (status IN ('open','in_progress','closed','rejected')) DEFAULT 'open',
  admin_response        TEXT,
  responded_by_user_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responded_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_feedback_school_created
  ON public.platform_feedback(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status_created
  ON public.platform_feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_submitter
  ON public.platform_feedback(submitted_by_user_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_platform_feedback_updated_at ON public.platform_feedback;
CREATE TRIGGER trg_platform_feedback_updated_at
  BEFORE UPDATE ON public.platform_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_feedback_school_admin_select ON public.platform_feedback;
DROP POLICY IF EXISTS platform_feedback_school_admin_insert ON public.platform_feedback;
DROP POLICY IF EXISTS platform_feedback_tuto_admin_all     ON public.platform_feedback;

-- School admins: SELECT any feedback for any of their schools
CREATE POLICY platform_feedback_school_admin_select ON public.platform_feedback
  FOR SELECT
  USING ( school_id = ANY(public.get_user_school_ids()) );

-- School admins: INSERT for their school, must set submitted_by_user_id to themselves
CREATE POLICY platform_feedback_school_admin_insert ON public.platform_feedback
  FOR INSERT
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids())
    AND submitted_by_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Tuto admins: full access
CREATE POLICY platform_feedback_tuto_admin_all ON public.platform_feedback
  FOR ALL
  USING (public.is_tuto_admin())
  WITH CHECK (public.is_tuto_admin());

COMMENT ON TABLE public.platform_feedback IS
  'Feedback from school admins to the Tuto platform team (bugs, feature requests, etc.). Distinct from public.feedbacks which is parent↔school.';
COMMENT ON FUNCTION public.is_tuto_admin() IS
  'TRUE when current auth.uid() is a Tuto platform admin (public.users.role = admin).';
