-- Migration 032: Add total_tasks field to homework assignments
-- Enables tracking progress (e.g., "6/7 tasks completed")

ALTER TABLE public.school_homework_assignments
ADD COLUMN IF NOT EXISTS total_tasks INTEGER NOT NULL DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN public.school_homework_assignments.total_tasks IS 'Total number of tasks in this assignment for progress tracking';



