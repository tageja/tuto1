-- Migration 040: Teacher progress reports – dimensions (dropdowns) and entries
-- Tables: school_progress_dimensions, school_teacher_progress_reports, school_progress_report_entries
-- Teachers create reports with dropdown choices per dimension; consolidated into student profile over time.

-- ============================================================================
-- 1. Progress dimensions (per school: behaviour, math, english, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.school_progress_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, dimension_key)
);

CREATE INDEX IF NOT EXISTS idx_school_progress_dimensions_school ON public.school_progress_dimensions(school_id);

ALTER TABLE public.school_progress_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY school_progress_dimensions_admin_all ON public.school_progress_dimensions
  FOR ALL USING (school_id = ANY(public.get_user_school_ids()) AND public.is_admin())
  WITH CHECK (school_id = ANY(public.get_user_school_ids()) AND public.is_admin());

CREATE POLICY school_progress_dimensions_teacher_select ON public.school_progress_dimensions
  FOR SELECT USING (
    school_id = ANY(public.get_user_school_ids())
  );

-- ============================================================================
-- 2. Teacher progress report (one per student per report date)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.school_teacher_progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.school_teachers(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_teacher_progress_reports_student ON public.school_teacher_progress_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_school_teacher_progress_reports_class ON public.school_teacher_progress_reports(class_id);
CREATE INDEX IF NOT EXISTS idx_school_teacher_progress_reports_date ON public.school_teacher_progress_reports(report_date DESC);

ALTER TABLE public.school_teacher_progress_reports ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_school_teacher_progress_reports_updated ON public.school_teacher_progress_reports;
CREATE TRIGGER trg_school_teacher_progress_reports_updated
  BEFORE UPDATE ON public.school_teacher_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Admin: full access for their school
CREATE POLICY school_teacher_progress_reports_admin_all ON public.school_teacher_progress_reports
  FOR ALL USING (school_id = ANY(public.get_user_school_ids()) AND public.is_admin())
  WITH CHECK (school_id = ANY(public.get_user_school_ids()) AND public.is_admin());

-- Teacher: CRUD only for their assigned classes
CREATE POLICY school_teacher_progress_reports_teacher_all ON public.school_teacher_progress_reports
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public.school_teachers WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
    AND class_id IN (SELECT id FROM public.school_classes WHERE teacher_id IN (SELECT id FROM public.school_teachers WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())))
  )
  WITH CHECK (
    teacher_id IN (SELECT id FROM public.school_teachers WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

-- Parent: read only for their children
CREATE POLICY school_teacher_progress_reports_parent_select ON public.school_teacher_progress_reports
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.school_students
      WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.school_parent_students sps WHERE sps.student_id = school_teacher_progress_reports.student_id AND sps.parent_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
    )
  );

-- ============================================================================
-- 3. Report entries (one row per dimension per report – dropdown choice)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.school_progress_report_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.school_teacher_progress_reports(id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, dimension_key)
);

CREATE INDEX IF NOT EXISTS idx_school_progress_report_entries_report ON public.school_progress_report_entries(report_id);

ALTER TABLE public.school_progress_report_entries ENABLE ROW LEVEL SECURITY;

-- Admin/Teacher: full access when report is in their scope
CREATE POLICY school_progress_report_entries_admin_teacher ON public.school_progress_report_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.school_teacher_progress_reports r
      WHERE r.id = report_id
      AND (
        (r.school_id = ANY(public.get_user_school_ids()) AND public.is_admin())
        OR (r.teacher_id IN (SELECT id FROM public.school_teachers WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_teacher_progress_reports r
      WHERE r.id = report_id
      AND (
        (r.school_id = ANY(public.get_user_school_ids()) AND public.is_admin())
        OR (r.teacher_id IN (SELECT id FROM public.school_teachers WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())))
      )
    )
  );

-- Parent: read only for their children's reports
CREATE POLICY school_progress_report_entries_parent_select ON public.school_progress_report_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.school_teacher_progress_reports r
      JOIN public.school_students ss ON ss.id = r.student_id
      WHERE r.id = report_id
      AND (
        ss.parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.school_parent_students sps WHERE sps.student_id = r.student_id AND sps.parent_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
      )
    )
  );

-- ============================================================================
-- 4. Seed default dimensions for existing schools (optional)
-- ============================================================================
INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'behaviour', 'Behaviour', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 1 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;

INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'classroom_readiness', 'Classroom Readiness', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 2 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;

INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'math', 'Math', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 3 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;

INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'english', 'English', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 4 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;

INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'montessori', 'Montessori Class', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 5 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;

INSERT INTO public.school_progress_dimensions (school_id, dimension_key, display_name, options, sort_order)
SELECT id, 'participation', 'Participation in Classroom Activities', '["Needs improvement", "Developing", "Meeting", "Exceeding"]'::jsonb, 6 FROM public.schools
ON CONFLICT (school_id, dimension_key) DO NOTHING;
