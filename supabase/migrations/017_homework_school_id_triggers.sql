-- Migration 017: Homework school_id triggers
-- Ensures targets and submissions inherit school_id automatically

CREATE OR REPLACE FUNCTION public.set_hw_target_school_id()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_school_id uuid;
BEGIN
  IF NEW.school_id IS NULL THEN
    SELECT school_id INTO v_school_id
    FROM public.school_homework_assignments
    WHERE id = NEW.assignment_id;
    NEW.school_id := v_school_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hw_target_school_id ON public.school_homework_targets;
CREATE TRIGGER trg_hw_target_school_id
BEFORE INSERT ON public.school_homework_targets
FOR EACH ROW EXECUTE FUNCTION public.set_hw_target_school_id();

CREATE OR REPLACE FUNCTION public.set_hw_submission_school_id()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_school_id uuid;
BEGIN
  IF NEW.school_id IS NULL THEN
    SELECT school_id INTO v_school_id
    FROM public.school_homework_assignments
    WHERE id = NEW.assignment_id;
    NEW.school_id := v_school_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hw_submission_school_id ON public.school_homework_submissions;
CREATE TRIGGER trg_hw_submission_school_id
BEFORE INSERT ON public.school_homework_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_hw_submission_school_id();




