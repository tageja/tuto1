-- Migration 014: Fix Homework RLS Recursion
-- Resolves infinite recursion between assignments and targets policies for parents

-- Drop existing recursive policy
DROP POLICY IF EXISTS hw_parent_targets_select ON public.school_homework_targets;

-- Re-create policy without joining back to assignments table
-- Parents can see targets if they relate to their children (direct or via class)
CREATE POLICY hw_parent_targets_select ON public.school_homework_targets
  FOR SELECT 
  USING (
    student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
    OR class_id IN (
      SELECT s.class_id
      FROM public.school_students s
      WHERE s.id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
    )
  );



