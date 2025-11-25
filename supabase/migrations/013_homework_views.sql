-- Migration 013: Homework Views and RPCs
-- KPIs, List, and Scores Series functions for homework feature

-- =============================================================================
-- RPC: hw_kpis - Calculate homework KPIs with filters
-- =============================================================================

CREATE OR REPLACE FUNCTION public.hw_kpis(
  p_school uuid, 
  p_from date, 
  p_to date,
  p_class uuid DEFAULT NULL, 
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL, 
  p_status text DEFAULT 'all'
) 
RETURNS TABLE(
  total int, 
  pending int, 
  completed int, 
  completion_rate numeric
)
LANGUAGE sql 
STABLE 
AS $$
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
      SUM(CASE WHEN s.status IN ('submitted','graded') THEN 1 ELSE 0 END)::int AS submitted,
      COUNT(s.*)::int AS total
    FROM base a
    JOIN targeted tg ON tg.assignment_id = a.id
    LEFT JOIN public.school_homework_submissions s ON s.assignment_id = a.id
      AND (p_student IS NULL OR s.student_id = p_student)
    GROUP BY a.id
  )
  SELECT
    COUNT(*)::int AS total,
    SUM(CASE WHEN submitted < total THEN 1 ELSE 0 END)::int AS pending,
    SUM(CASE WHEN submitted = total AND total > 0 THEN 1 ELSE 0 END)::int AS completed,
    CASE 
      WHEN SUM(total) = 0 THEN 0
      ELSE ROUND(100.0 * SUM(submitted)::numeric / NULLIF(SUM(total), 0), 1) 
    END AS completion_rate
  FROM progress
  WHERE (p_status = 'all')
     OR (p_status = 'pending' AND submitted < total)
     OR (p_status = 'completed' AND submitted = total AND total > 0);
$$;

-- =============================================================================
-- RPC: hw_list - Get homework list with progress
-- =============================================================================

CREATE OR REPLACE FUNCTION public.hw_list(
  p_school uuid, 
  p_from date, 
  p_to date,
  p_class uuid DEFAULT NULL, 
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL, 
  p_status text DEFAULT 'all'
) 
RETURNS TABLE(
  assignment_id uuid, 
  subject text, 
  title text, 
  class_name text,
  due_date date, 
  status text, 
  submitted int, 
  total int, 
  progress_percent numeric
)
LANGUAGE sql 
STABLE 
AS $$
  WITH base AS (
    SELECT 
      a.id, 
      a.subject, 
      a.title, 
      a.due_date, 
      c.name AS class_name
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
      SUM(CASE WHEN s.status IN ('submitted','graded') THEN 1 ELSE 0 END)::int AS submitted,
      COUNT(s.*)::int AS total
    FROM base a
    LEFT JOIN public.school_homework_submissions s ON s.assignment_id = a.id
      AND (p_student IS NULL OR s.student_id = p_student)
    GROUP BY a.id
  )
  SELECT
    a.id AS assignment_id, 
    a.subject, 
    a.title, 
    a.class_name, 
    a.due_date,
    CASE 
      WHEN p_status = 'completed' THEN 'completed'
      WHEN p_status = 'pending' THEN 'pending'
      ELSE CASE 
        WHEN p.submitted = p.total AND p.total > 0 THEN 'completed' 
        ELSE 'pending' 
      END 
    END AS status,
    p.submitted, 
    p.total,
    CASE 
      WHEN p.total = 0 THEN 0 
      ELSE ROUND(100.0 * p.submitted::numeric / p.total, 0) 
    END AS progress_percent
  FROM base a
  JOIN progress p ON p.id = a.id
  WHERE (p_status = 'all')
     OR (p_status = 'pending' AND p.submitted < p.total)
     OR (p_status = 'completed' AND p.submitted = p.total AND p.total > 0)
  ORDER BY a.due_date ASC, a.title ASC;
$$;

-- =============================================================================
-- RPC: hw_scores_series - Get score trends over time
-- =============================================================================

CREATE OR REPLACE FUNCTION public.hw_scores_series(
  p_school uuid, 
  p_from date, 
  p_to date,
  p_class uuid DEFAULT NULL, 
  p_subject text DEFAULT NULL,
  p_student uuid DEFAULT NULL
) 
RETURNS TABLE(
  d date, 
  avg_score numeric
)
LANGUAGE sql 
STABLE 
AS $$
  SELECT 
    s.submitted_at::date AS d, 
    ROUND(AVG(s.score), 1) AS avg_score
  FROM public.school_homework_submissions s
  JOIN public.school_homework_assignments a ON a.id = s.assignment_id 
    AND a.school_id = p_school
  WHERE s.submitted_at IS NOT NULL
    AND s.score IS NOT NULL
    AND s.submitted_at::date BETWEEN p_from AND p_to
    AND (p_class IS NULL OR a.class_id = p_class)
    AND (p_subject IS NULL OR a.subject ILIKE '%' || p_subject || '%')
    AND (p_student IS NULL OR s.student_id = p_student)
  GROUP BY s.submitted_at::date
  ORDER BY d ASC;
$$;



