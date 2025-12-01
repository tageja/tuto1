-- Migration 011: Attendance Helper Functions
-- Functions for KPIs, date ranges, and weekend detection

-- Get child student IDs for current parent user
CREATE OR REPLACE FUNCTION public.get_user_child_student_ids()
RETURNS uuid[] LANGUAGE sql STABLE AS $$
  SELECT ARRAY_AGG(DISTINCT sps.student_id)
  FROM public.school_parent_students sps
  WHERE sps.parent_user_id = auth.uid();
$$;

-- Week bounds (Monday start)
CREATE OR REPLACE FUNCTION public.week_bounds(p_date date)
RETURNS TABLE(week_start date, week_end date)
LANGUAGE sql IMMUTABLE AS $$
  SELECT 
    date_trunc('week', p_date)::date as week_start,
    (date_trunc('week', p_date) + interval '6 days')::date as week_end;
$$;

-- Check if school has weekend classes
CREATE OR REPLACE FUNCTION public.school_has_weekend_classes(p_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.school_attendance
    WHERE school_id = p_school_id
      AND EXTRACT(DOW FROM date) IN (0, 6)
    LIMIT 1
  );
$$;

-- KPIs for any date range with case-insensitive status
CREATE OR REPLACE FUNCTION public.att_kpis(
  p_school uuid, 
  p_from date, 
  p_to date,
  p_class uuid DEFAULT NULL, 
  p_student uuid DEFAULT NULL
) RETURNS TABLE(
  present bigint, 
  absent bigint, 
  late bigint, 
  excused bigint,
  total bigint,
  rate numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(SUM((lower(status)='present')::int), 0)::bigint,
    COALESCE(SUM((lower(status)='absent')::int), 0)::bigint,
    COALESCE(SUM((lower(status)='late')::int), 0)::bigint,
    COALESCE(SUM((lower(status)='excused')::int), 0)::bigint,
    COUNT(*)::bigint,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(100.0 * SUM((lower(status)='present')::int) / COUNT(*), 1)
    END
  FROM public.school_attendance
  WHERE school_id = p_school
    AND date BETWEEN p_from AND p_to
    AND (p_class IS NULL OR class_id = p_class)
    AND (p_student IS NULL OR student_id = p_student);
$$;

-- Range data fetch with ordering
CREATE OR REPLACE FUNCTION public.att_range(
  p_school uuid, 
  p_from date, 
  p_to date,
  p_class uuid DEFAULT NULL, 
  p_student uuid DEFAULT NULL
) RETURNS TABLE(
  id uuid,
  date date, 
  student_id uuid, 
  class_id uuid, 
  status text, 
  late_minutes int,
  notes text
) LANGUAGE sql STABLE AS $$
  SELECT 
    id, date, student_id, class_id, status, late_minutes, notes
  FROM public.school_attendance
  WHERE school_id = p_school
    AND date BETWEEN p_from AND p_to
    AND (p_class IS NULL OR class_id = p_class)
    AND (p_student IS NULL OR student_id = p_student)
  ORDER BY date ASC, student_id ASC;
$$;




