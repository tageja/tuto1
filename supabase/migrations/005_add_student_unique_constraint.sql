-- Migration 005: Add unique constraint on (school_id, student_number)
-- Ensures student numbers are unique within each school

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_students_schoolid_studentnumber_unique
  ON public.school_students (school_id, student_number);

-- Add comment for documentation
COMMENT ON INDEX idx_school_students_schoolid_studentnumber_unique IS 
  'Ensures student_number is unique within each school';



