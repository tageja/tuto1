-- Migration 010: Attendance Core Schema Updates
-- Add missing columns, fix constraints, create parent-students mapping

-- Add late_minutes column
ALTER TABLE public.school_attendance
  ADD COLUMN IF NOT EXISTS late_minutes int NOT NULL DEFAULT 0;

-- Update status constraint to be case-insensitive
ALTER TABLE public.school_attendance
  DROP CONSTRAINT IF EXISTS school_attendance_status_check;

ALTER TABLE public.school_attendance
  ADD CONSTRAINT school_attendance_status_check
  CHECK (lower(status) IN ('present','absent','late','excused'));

-- Add composite indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_att_school_date 
  ON public.school_attendance (school_id, date);

CREATE INDEX IF NOT EXISTS idx_att_class_date 
  ON public.school_attendance (class_id, date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at() 
RETURNS trigger LANGUAGE plpgsql AS $$ 
BEGIN 
  new.updated_at = now(); 
  RETURN new; 
END $$;

DROP TRIGGER IF EXISTS trg_att_touch ON public.school_attendance;
CREATE TRIGGER trg_att_touch 
  BEFORE UPDATE ON public.school_attendance
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create parent-students mapping table for RLS
CREATE TABLE IF NOT EXISTS public.school_parent_students (
  school_id uuid NOT NULL,
  parent_user_id uuid NOT NULL,
  student_id uuid NOT NULL,
  PRIMARY KEY (school_id, parent_user_id, student_id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (parent_user_id) REFERENCES public.users(id),
  FOREIGN KEY (student_id) REFERENCES public.school_students(id)
);

CREATE INDEX IF NOT EXISTS idx_sps_parent 
  ON public.school_parent_students (parent_user_id);

-- Enable RLS on the new table
ALTER TABLE public.school_parent_students ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for parents using new mapping table
DROP POLICY IF EXISTS att_parent_select_via_mapping ON public.school_attendance;
CREATE POLICY att_parent_select_via_mapping ON public.school_attendance
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.school_parent_students sps
      WHERE sps.student_id = school_attendance.student_id
        AND sps.parent_user_id = auth.uid()
        AND sps.school_id = school_attendance.school_id
    ) OR is_admin()
  );

-- Add RLS policy for parent-students table (parents can read their own mappings)
CREATE POLICY parent_students_select ON public.school_parent_students
  FOR SELECT USING (parent_user_id = auth.uid() OR is_admin());

-- Add RLS policy for admins to manage parent-students mappings
CREATE POLICY parent_students_admin_all ON public.school_parent_students
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());



