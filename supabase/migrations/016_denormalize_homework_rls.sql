-- Migration 016: Denormalize Homework RLS
-- Adds school_id to targets and submissions to definitively break infinite recursion loops
-- and improve RLS performance by avoiding joins

-- =============================================================================
-- 1. Update Targets Table
-- =============================================================================

-- Add school_id column (nullable first for backfill)
ALTER TABLE public.school_homework_targets 
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

-- Backfill school_id from assignments
UPDATE public.school_homework_targets t
SET school_id = a.school_id
FROM public.school_homework_assignments a
WHERE t.assignment_id = a.id
AND t.school_id IS NULL;

-- Make school_id NOT NULL after backfill
ALTER TABLE public.school_homework_targets 
ALTER COLUMN school_id SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_hw_targets_school 
ON public.school_homework_targets (school_id);

-- =============================================================================
-- 2. Update Submissions Table
-- =============================================================================

-- Add school_id column
ALTER TABLE public.school_homework_submissions
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

-- Backfill school_id
UPDATE public.school_homework_submissions s
SET school_id = a.school_id
FROM public.school_homework_assignments a
WHERE s.assignment_id = a.id
AND s.school_id IS NULL;

-- Make school_id NOT NULL
ALTER TABLE public.school_homework_submissions
ALTER COLUMN school_id SET NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_hw_sub_school 
ON public.school_homework_submissions (school_id);

-- =============================================================================
-- 3. Update RLS Policies (Admin) to use school_id directly
-- =============================================================================

-- Targets: Admin full access via school_id (No join needed!)
DROP POLICY IF EXISTS hw_admin_targets_all ON public.school_homework_targets;

CREATE POLICY hw_admin_targets_all ON public.school_homework_targets
  FOR ALL 
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Submissions: Admin full access via school_id (No join needed!)
DROP POLICY IF EXISTS hw_admin_sub_all ON public.school_homework_submissions;

CREATE POLICY hw_admin_sub_all ON public.school_homework_submissions
  FOR ALL 
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- =============================================================================
-- 4. Parent Policies (Keep existing safe logic, but can leverage school_id if needed)
-- =============================================================================

-- hw_parent_targets_select (Already safe, checks students table) - No change needed
-- hw_parent_sub_select (Already safe, checks user id) - No change needed
-- hw_parent_assign_select (Checks targets) - No change needed, but now the targets check is fast and non-recursive for admins too.




