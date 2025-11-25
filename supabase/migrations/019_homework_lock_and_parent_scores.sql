-- Migration 019: Homework locking + parent score visibility

-- 1) Add is_locked column so finalized submissions can't be edited
ALTER TABLE public.school_homework_submissions
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;

-- 2) Extend hw_list to expose child_status / child_score when p_student provided
DROP FUNCTION IF EXISTS public.hw_list(
  uuid, date, date, uuid, text, uuid, text
);

CREATE OR REPLACE FUNCTION public.hw_list(
  p_school uuid,
  p_from date,
  p_to date,
  p_class uuid DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL,
  p_status text DEFAULT 'all'
) RETURNS TABLE(
  assignment_id uuid,
  subject text,
  title text,
  class_name text,
  due_date date,
  status text,
  submitted int,
  total int,
  progress_percent numeric,
  child_status text,
  child_score numeric
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT a.id, a.subject, a.title, a.due_date, COALESCE(c.name, 'All Classes') AS class_name
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
  ),
  child AS (
    SELECT
      s.assignment_id,
      s.status,
      s.score
    FROM public.school_homework_submissions s
    WHERE p_student IS NOT NULL AND s.student_id = p_student
  )
  SELECT
    a.id,
    a.subject,
    a.title,
    a.class_name,
    a.due_date,
    CASE
      WHEN p_status = 'completed' THEN 'completed'
      WHEN p_status = 'pending' THEN 'pending'
      ELSE CASE WHEN p.submitted = p.total AND p.total > 0 THEN 'completed' ELSE 'pending' END
    END,
    p.submitted,
    p.total,
    CASE WHEN p.total = 0 THEN 0 ELSE ROUND(100.0 * p.submitted::numeric / p.total, 0) END,
    child.status,
    child.score
  FROM base a
  JOIN progress p ON p.id = a.id
  LEFT JOIN child ON child.assignment_id = a.id
  WHERE (p_status = 'all')
     OR (p_status = 'pending' AND p.submitted < p.total)
     OR (p_status = 'completed' AND p.submitted = p.total AND p.total > 0)
  ORDER BY a.due_date ASC, a.title ASC;
$$;

