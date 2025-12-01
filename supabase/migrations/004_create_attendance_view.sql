-- Create attendance view mapping school_attendance to expected column names
-- This view provides a consistent interface for the application

CREATE OR REPLACE VIEW public.attendance AS
SELECT
  id,
  student_id AS studentid,
  class_id AS classid,
  date,
  CASE 
    WHEN status = 'present' THEN 'Present'
    WHEN status = 'absent' THEN 'Absent'
    WHEN status = 'late' THEN 'Late'
    WHEN status = 'excused' THEN 'Excused'
    ELSE status
  END AS status,
  school_id AS schoolid,
  notes,
  created_at,
  updated_at
FROM public.school_attendance;

-- Add comment
COMMENT ON VIEW public.attendance IS 'View mapping school_attendance to application-expected column names';

-- Enable RLS on the view (inherits from base table, but we can add view-specific policies if needed)
ALTER VIEW public.attendance SET (security_invoker = true);

-- Note: RLS policies on school_attendance will automatically apply to this view
-- since views inherit RLS from their base tables in PostgreSQL








