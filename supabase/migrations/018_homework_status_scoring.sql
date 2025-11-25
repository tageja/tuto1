-- Migration 018: Homework status + scoring updates
-- Adds 'incomplete' status option and ensures KPIs count late submissions as completed.

-- Update status constraint to allow 'incomplete'
ALTER TABLE public.school_homework_submissions
DROP CONSTRAINT IF EXISTS school_homework_submissions_status_check;

ALTER TABLE public.school_homework_submissions
ADD CONSTRAINT school_homework_submissions_status_check
CHECK (lower(status) IN ('pending','submitted','graded','late','incomplete'));

-- Recreate hw_kpis with updated status handling
CREATE OR REPLACE FUNCTION public.hw_kpis(
  p_school uuid,
  p_from date,
  p_to date,
  p_class uuid DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL,
  p_status text DEFAULT 'all'
) RETURNS TABLE(total int, pending int, completed int, completion_rate numeric)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT a.id, a.subject, a.due_date
    FROM public.school_homework_assignments a
    WHERE a.school_id = p_school
      AND a.due_date BETWEEN p_from AND p_to
      AND a.is_active = true
      AND (p_class IS NULL OR a.class_id = p_class)
      AND (p_subject IS NULL OR a.subject ILIKE '%' || p_subject || '%')
  ),
  targeted AS (
    SELECT DISTINCT b.id AS assignment_id
    FROM base b
    LEFT JOIN public.school_homework_targets t ON t.assignment_id = b.id
    WHERE (p_student IS NULL) OR
          (t.student_id = p_student OR
           t.class_id IN (
             SELECT class_id
             FROM public.school_students
             WHERE id = p_student
           ))
  ),
  progress AS (
    SELECT
      a.id AS assignment_id,
      SUM((s.status IN ('submitted','graded','late'))::int)::int AS submitted,
      COUNT(s.*)::int AS total
    FROM base a
    JOIN targeted tg ON tg.assignment_id = a.id
    LEFT JOIN public.school_homework_submissions s ON s.assignment_id = a.id
      AND (p_student IS NULL OR s.student_id = p_student)
    GROUP BY a.id
  )
  SELECT
    COUNT(*)::int,
    SUM(CASE WHEN submitted < total THEN 1 ELSE 0 END)::int,
    SUM(CASE WHEN submitted = total AND total > 0 THEN 1 ELSE 0 END)::int,
    CASE WHEN SUM(total) = 0 THEN 0
         ELSE ROUND(100.0 * SUM(submitted)::numeric / NULLIF(SUM(total), 0), 1) END
  FROM progress
  WHERE (p_status = 'all')
     OR (p_status = 'pending' AND submitted < total)
     OR (p_status = 'completed' AND submitted = total AND total > 0);
$$;

-- Recreate hw_list with same status logic
CREATE OR REPLACE FUNCTION public.hw_list(
  p_school uuid,
  p_from date,
  p_to date,
  p_class uuid DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL,
  p_status text DEFAULT 'all'
) RETURNS TABLE(
  assignment_id uuid, subject text, title text, class_name text,
  due_date date, status text, submitted int, total int, progress_percent numeric
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT a.id, a.subject, a.title, a.due_date, c.name AS class_name
    FROM public.school_homework_assignments a
    LEFT JOIN public.school_classes c ON c.id = a.class_id
    WHERE a.school_id = p_school
      AND a.due_date BETWEEN p_from AND p_to
      AND a.is_active = true
      AND (p_class IS NULL OR a.class_id = p_class)
      AND (p_subject IS NULL OR a.subject ILIKE '%' || p_subject || '%')
  ),
  progress AS (
    SELECT
      a.id,
      SUM((s.status IN ('submitted','graded','late'))::int)::int AS submitted,
      COUNT(s.*)::int AS total
    FROM base a
    LEFT JOIN public.school_homework_submissions s ON s.assignment_id = a.id
      AND (p_student IS NULL OR s.student_id = p_student)
    GROUP BY a.id
  )
  SELECT
    a.id, a.subject, a.title, a.class_name, a.due_date,
    CASE
      WHEN p_status = 'completed' THEN 'completed'
      WHEN p_status = 'pending' THEN 'pending'
      ELSE CASE WHEN p.submitted = p.total AND p.total > 0 THEN 'completed' ELSE 'pending' END
    END,
    p.submitted, p.total,
    CASE WHEN p.total = 0 THEN 0 ELSE ROUND(100.0 * p.submitted::numeric / p.total, 0) END
  FROM base a
  JOIN progress p ON p.id = a.id
  WHERE (p_status = 'all')
     OR (p_status = 'pending' AND p.submitted < p.total)
     OR (p_status = 'completed' AND p.submitted = p.total AND p.total > 0)
  ORDER BY a.due_date ASC, a.title ASC;
$$;



