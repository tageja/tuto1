-- Migration 038: Parent–student auto-link and get_user_child_student_ids fallback
-- 1. get_user_child_student_ids: add parent_email fallback so parents see students linked only by email
-- 2. Trigger: when admin adds/updates a student with parent_email, auto-insert school_parent_students
--    for any parent user already linked to the school (school_parents), so "My children" list stays in sync

-- ============================================================================
-- 1. get_user_child_student_ids with parent_email fallback
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_child_student_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_student_ids uuid[];
BEGIN
    -- First: student IDs from school_parent_students (explicit link; parent_user_id = current user's public.users.id)
    SELECT ARRAY_AGG(DISTINCT sps.student_id)
    INTO v_student_ids
    FROM public.school_parent_students sps
    JOIN public.users u ON sps.parent_user_id = u.id
    WHERE u.auth_user_id = auth.uid();

    -- Fallback: students where parent_email matches current user's email (admin-enrolled link)
    IF v_student_ids IS NULL OR array_length(v_student_ids, 1) IS NULL THEN
        SELECT ARRAY_AGG(DISTINCT ss.id)
        INTO v_student_ids
        FROM public.school_students ss
        JOIN public.users u ON lower(ss.parent_email) = lower(u.email)
        WHERE u.auth_user_id = auth.uid()
          AND ss.status = 'active';
    END IF;

    RETURN COALESCE(v_student_ids, ARRAY[]::uuid[]);
END;
$$;

COMMENT ON FUNCTION public.get_user_child_student_ids() IS 'Returns student IDs for current parent: school_parent_students first, then fallback to school_students.parent_email.';

-- ============================================================================
-- 2. Auto-link parent when student is created/updated with parent_email
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_school_parent_students_on_student_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    parent_rec RECORD;
BEGIN
    -- Only act when parent_email is set (INSERT or UPDATE)
    IF NEW.parent_email IS NULL OR trim(NEW.parent_email) = '' THEN
        RETURN NEW;
    END IF;

    -- For each parent user with this email who is already linked to this school (school_parents), add school_parent_students
    FOR parent_rec IN
        SELECT u.id AS parent_user_id
        FROM public.users u
        INNER JOIN public.school_parents sp ON sp.parent_user_id = u.id AND sp.school_id = NEW.school_id
        WHERE lower(trim(u.email)) = lower(trim(NEW.parent_email))
    LOOP
        INSERT INTO public.school_parent_students (school_id, parent_user_id, student_id)
        VALUES (NEW.school_id, parent_rec.parent_user_id, NEW.id)
        ON CONFLICT (school_id, parent_user_id, student_id) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_parent_students_on_student_insert ON public.school_students;
CREATE TRIGGER trigger_sync_parent_students_on_student_insert
    AFTER INSERT ON public.school_students
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_school_parent_students_on_student_change();

DROP TRIGGER IF EXISTS trigger_sync_parent_students_on_student_update ON public.school_students;
CREATE TRIGGER trigger_sync_parent_students_on_student_update
    AFTER UPDATE OF parent_email, school_id ON public.school_students
    FOR EACH ROW
    WHEN (
        (OLD.parent_email IS DISTINCT FROM NEW.parent_email OR OLD.school_id IS DISTINCT FROM NEW.school_id)
        AND NEW.parent_email IS NOT NULL AND trim(NEW.parent_email) <> ''
    )
    EXECUTE FUNCTION public.sync_school_parent_students_on_student_change();

COMMENT ON FUNCTION public.sync_school_parent_students_on_student_change() IS 'When a student is created/updated with parent_email, links that student to any parent user (school_parents) with that email so they appear in My children.';
