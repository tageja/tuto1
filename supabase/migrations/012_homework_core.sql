-- Migration 012: Homework Core Schema
-- Creates assignments, targets, and submissions tables with RLS policies

-- =============================================================================
-- TABLES
-- =============================================================================

-- Homework Assignments (main assignments table)
CREATE TABLE IF NOT EXISTS public.school_homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NULL,  -- Default target class (nullable if targeting specific students only)
  subject text NOT NULL,
  title text NOT NULL,
  description text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES public.school_classes(id) ON DELETE SET NULL
);

-- Homework Targets (which classes/students are assigned)
CREATE TABLE IF NOT EXISTS public.school_homework_targets (
  assignment_id uuid NOT NULL,
  class_id uuid NULL,
  student_id uuid NULL,
  FOREIGN KEY (assignment_id) REFERENCES public.school_homework_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES public.school_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES public.school_students(id) ON DELETE CASCADE
);

-- Add composite unique constraint after table creation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'school_homework_targets_pkey'
  ) THEN
    ALTER TABLE public.school_homework_targets 
    ADD CONSTRAINT school_homework_targets_unique 
    UNIQUE (assignment_id, class_id, student_id);
  END IF;
END $$;

-- Homework Submissions (student submission tracking)
CREATE TABLE IF NOT EXISTS public.school_homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submitted_at timestamptz NULL,
  status text NOT NULL CHECK (status IN ('pending','submitted','graded','late')),
  score numeric NULL CHECK (score >= 0 AND score <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (assignment_id) REFERENCES public.school_homework_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES public.school_students(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, student_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_hw_assign_school_due 
  ON public.school_homework_assignments (school_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_hw_assign_class 
  ON public.school_homework_assignments (class_id);

CREATE INDEX IF NOT EXISTS idx_hw_assign_active
  ON public.school_homework_assignments (school_id, is_active);

CREATE INDEX IF NOT EXISTS idx_hw_targets_student 
  ON public.school_homework_targets (student_id);

CREATE INDEX IF NOT EXISTS idx_hw_targets_class 
  ON public.school_homework_targets (class_id);

CREATE INDEX IF NOT EXISTS idx_hw_sub_student_assignment 
  ON public.school_homework_submissions (student_id, assignment_id);

CREATE INDEX IF NOT EXISTS idx_hw_sub_status 
  ON public.school_homework_submissions (status);

CREATE INDEX IF NOT EXISTS idx_hw_sub_assignment
  ON public.school_homework_submissions (assignment_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Reuse touch_updated_at function (already exists from attendance migration)
DROP TRIGGER IF EXISTS trg_hw_assign_touch ON public.school_homework_assignments;
CREATE TRIGGER trg_hw_assign_touch 
  BEFORE UPDATE ON public.school_homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_hw_sub_touch ON public.school_homework_submissions;
CREATE TRIGGER trg_hw_sub_touch 
  BEFORE UPDATE ON public.school_homework_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE public.school_homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_homework_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_homework_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ASSIGNMENTS: Admin full CRUD, Parent read-only for their child's assignments
-- ============================================================

-- Admin: Full access to assignments within their schools
CREATE POLICY hw_admin_assign_all ON public.school_homework_assignments
  FOR ALL 
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read assignments targeted to their child's class or directly to their child
CREATE POLICY hw_parent_assign_select ON public.school_homework_assignments
  FOR SELECT 
  USING (
    school_id = ANY(get_user_school_ids()) 
    AND EXISTS (
      SELECT 1
      FROM public.school_homework_targets t
      WHERE t.assignment_id = school_homework_assignments.id
        AND (
          -- Targeted to child's class
          t.class_id IN (
            SELECT s.class_id
            FROM public.school_students s
            WHERE s.id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
          )
          -- OR targeted directly to child
          OR t.student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
        )
    )
  );

-- ============================================================
-- TARGETS: Admin full CRUD, Parent read-only for their child's targets
-- ============================================================

-- Admin: Full access to targets for assignments in their schools
CREATE POLICY hw_admin_targets_all ON public.school_homework_targets
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.school_homework_assignments a
      WHERE a.id = school_homework_targets.assignment_id
        AND a.school_id = ANY(get_user_school_ids()) 
        AND is_admin()
    )
  )
  WITH CHECK (true);

-- Parent: Read targets related to their child
CREATE POLICY hw_parent_targets_select ON public.school_homework_targets
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1
      FROM public.school_homework_assignments a
      WHERE a.id = school_homework_targets.assignment_id
        AND a.school_id = ANY(get_user_school_ids())
    )
    AND (
      student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
      OR class_id IN (
        SELECT s.class_id
        FROM public.school_students s
        WHERE s.id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
      )
    )
  );

-- ============================================================
-- SUBMISSIONS: Admin full CRUD, Parent read-only for their child's submissions
-- ============================================================

-- Admin: Full access to submissions for assignments in their schools
CREATE POLICY hw_admin_sub_all ON public.school_homework_submissions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.school_homework_assignments a
      WHERE a.id = school_homework_submissions.assignment_id
        AND a.school_id = ANY(get_user_school_ids()) 
        AND is_admin()
    )
  )
  WITH CHECK (true);

-- Parent: Read submissions for their children only
CREATE POLICY hw_parent_sub_select ON public.school_homework_submissions
  FOR SELECT 
  USING (
    student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
  );

