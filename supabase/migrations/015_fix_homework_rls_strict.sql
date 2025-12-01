-- Migration 015: Strict RLS Separation
-- Adds is_admin() guards to prevent infinite recursion loops between assignments and targets

-- =============================================================================
-- ASSIGNMENTS
-- =============================================================================

DROP POLICY IF EXISTS hw_parent_assign_select ON public.school_homework_assignments;

-- Update: Add NOT is_admin() guard to prevent admins from evaluating this recursive path
CREATE POLICY hw_parent_assign_select ON public.school_homework_assignments
  FOR SELECT 
  USING (
    NOT is_admin() 
    AND school_id = ANY(get_user_school_ids()) 
    AND EXISTS (
      SELECT 1
      FROM public.school_homework_targets t
      WHERE t.assignment_id = school_homework_assignments.id
        AND (
          t.class_id IN (
            SELECT s.class_id
            FROM public.school_students s
            WHERE s.id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
          )
          OR t.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        )
    )
  );

-- =============================================================================
-- TARGETS
-- =============================================================================

DROP POLICY IF EXISTS hw_admin_targets_all ON public.school_homework_targets;

-- Update: Add is_admin() guard at TOP LEVEL to short-circuit for parents
CREATE POLICY hw_admin_targets_all ON public.school_homework_targets
  FOR ALL 
  USING (
    is_admin() 
    AND EXISTS (
      SELECT 1 
      FROM public.school_homework_assignments a
      WHERE a.id = school_homework_targets.assignment_id
        AND a.school_id = ANY(get_user_school_ids())
    )
  )
  WITH CHECK (true);

-- =============================================================================
-- SUBMISSIONS
-- =============================================================================

DROP POLICY IF EXISTS hw_admin_sub_all ON public.school_homework_submissions;

-- Update: Add is_admin() guard at TOP LEVEL
CREATE POLICY hw_admin_sub_all ON public.school_homework_submissions
  FOR ALL 
  USING (
    is_admin() 
    AND EXISTS (
      SELECT 1 
      FROM public.school_homework_assignments a
      WHERE a.id = school_homework_submissions.assignment_id
        AND a.school_id = ANY(get_user_school_ids())
    )
  )
  WITH CHECK (true);




