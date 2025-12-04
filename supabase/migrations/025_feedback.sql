-- ============================================================================
-- Migration 025: Feedback Feature
-- Description: Create feedbacks and feedback_messages tables with RLS,
-- code generation function, and trigger for overdue status
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Generate feedback code
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_feedback_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 8) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.feedbacks
  WHERE code LIKE 'FB-' || year_part || '-%';
  
  -- Format: FB-YYYY-NNNN (e.g., FB-2025-0001)
  new_code := 'FB-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN new_code;
END;
$$;

-- ============================================================================
-- TABLE: feedbacks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('request', 'complaint', 'information')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'overdue', 'closed')) DEFAULT 'open',
  deadline_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: feedback_messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'admin')),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_feedbacks_school_status_created 
  ON public.feedbacks(school_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_parent 
  ON public.feedbacks(parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_student 
  ON public.feedbacks(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feedbacks_code 
  ON public.feedbacks(code);
CREATE INDEX IF NOT EXISTS idx_feedbacks_deadline 
  ON public.feedbacks(deadline_at) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_feedback_messages_feedback_created 
  ON public.feedback_messages(feedback_id, created_at ASC);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

CREATE TRIGGER update_feedbacks_updated_at 
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TRIGGER: Auto-update status to 'overdue' when deadline passes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_feedback_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If deadline has passed and status is still 'open', set to 'overdue'
  IF NEW.deadline_at < NOW() AND NEW.status = 'open' THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_feedbacks_check_overdue
  BEFORE INSERT OR UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.check_feedback_overdue();

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS
-- ============================================================================

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: feedbacks
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS feedbacks_parent_all ON public.feedbacks;
DROP POLICY IF EXISTS feedbacks_admin_all ON public.feedbacks;

-- Parent: SELECT/INSERT/UPDATE their own feedback
CREATE POLICY feedbacks_parent_all ON public.feedbacks
  FOR ALL
  USING (
    parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    AND school_id = ANY(public.get_user_school_ids())
  )
  WITH CHECK (
    parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    AND school_id = ANY(public.get_user_school_ids())
  );

-- Admin: SELECT/INSERT/UPDATE feedback for their school
CREATE POLICY feedbacks_admin_all ON public.feedbacks
  FOR ALL
  USING (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  )
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  );

-- ============================================================================
-- RLS POLICIES: feedback_messages
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS feedback_messages_parent_select ON public.feedback_messages;
DROP POLICY IF EXISTS feedback_messages_parent_insert ON public.feedback_messages;
DROP POLICY IF EXISTS feedback_messages_admin_all ON public.feedback_messages;

-- Parent: SELECT messages for their feedback, INSERT messages for their feedback
CREATE POLICY feedback_messages_parent_select ON public.feedback_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_messages.feedback_id
        AND f.parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        AND f.school_id = ANY(public.get_user_school_ids())
    )
  );

CREATE POLICY feedback_messages_parent_insert ON public.feedback_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_messages.feedback_id
        AND f.parent_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        AND f.school_id = ANY(public.get_user_school_ids())
    )
    AND sender_role = 'parent'
    AND sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Admin: SELECT/INSERT messages for their school's feedback
CREATE POLICY feedback_messages_admin_all ON public.feedback_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_messages.feedback_id
        AND f.school_id = ANY(public.get_user_school_ids())
        AND public.is_admin()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_messages.feedback_id
        AND f.school_id = ANY(public.get_user_school_ids())
        AND public.is_admin()
    )
    AND sender_role = 'admin'
    AND sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.feedbacks IS 'Parent feedback submissions (requests, complaints, information)';
COMMENT ON TABLE public.feedback_messages IS 'Threaded conversation messages for feedback';
COMMENT ON FUNCTION public.get_feedback_code() IS 'Generates sequential feedback codes in format FB-YYYY-NNNN';

