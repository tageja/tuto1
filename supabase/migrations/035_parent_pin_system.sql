-- Migration: Parent PIN Code System
-- Description: Implement 6-digit PIN system for parents to join schools
-- Date: 2026-01-27

-- ============================================================================
-- 1. PIN Generation Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_parent_pin()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_pin VARCHAR(6);
    pin_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    LOOP
        -- Generate random 6-digit PIN (000000-999999)
        new_pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if PIN already exists
        SELECT EXISTS(
            SELECT 1 FROM public.schools 
            WHERE parent_pin = new_pin
        ) INTO pin_exists;
        
        -- If PIN doesn't exist, return it
        IF NOT pin_exists THEN
            RETURN new_pin;
        END IF;
        
        -- Increment attempts counter
        attempts := attempts + 1;
        
        -- Prevent infinite loop
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique PIN after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_parent_pin IS 'Generates a unique 6-digit numeric PIN for school parent access';

-- ============================================================================
-- 2. Auto-Generate PIN on School Creation (Trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_generate_school_pin()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate PIN if it's NULL
    IF NEW.parent_pin IS NULL THEN
        NEW.parent_pin := public.generate_parent_pin();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_school_pin ON public.schools;
CREATE TRIGGER trigger_generate_school_pin
    BEFORE INSERT ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_school_pin();

COMMENT ON TRIGGER trigger_generate_school_pin ON public.schools IS 'Automatically generates a unique parent PIN when a new school is created';

-- ============================================================================
-- 3. Backfill Existing Schools with PINs
-- ============================================================================

UPDATE public.schools
SET parent_pin = public.generate_parent_pin()
WHERE parent_pin IS NULL;

-- ============================================================================
-- 4. Add Unique Constraint on parent_pin
-- ============================================================================

-- First, ensure no duplicates exist (shouldn't happen, but safety check)
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT parent_pin, COUNT(*)
        FROM public.schools
        WHERE parent_pin IS NOT NULL
        GROUP BY parent_pin
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF dup_count > 0 THEN
        RAISE WARNING 'Found % duplicate PINs, regenerating...', dup_count;
        -- Regenerate PINs for duplicates
        UPDATE public.schools s1
        SET parent_pin = public.generate_parent_pin()
        WHERE EXISTS (
            SELECT 1 FROM public.schools s2
            WHERE s2.parent_pin = s1.parent_pin
            AND s2.id != s1.id
        );
    END IF;
END $$;

-- Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'schools_parent_pin_unique'
    ) THEN
        ALTER TABLE public.schools
        ADD CONSTRAINT schools_parent_pin_unique UNIQUE (parent_pin);
    END IF;
END $$;

-- Add index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_schools_parent_pin 
    ON public.schools(parent_pin) 
    WHERE parent_pin IS NOT NULL;

-- ============================================================================
-- 5. PIN Validation RPC Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_parent_pin(
    pin TEXT,
    user_email TEXT
)
RETURNS JSON AS $$
DECLARE
    school_record RECORD;
    parent_user RECORD;
    students_linked INTEGER := 0;
    student_record RECORD;
    result JSON;
BEGIN
    -- Validate PIN format (exactly 6 digits, numeric only)
    IF pin !~ '^[0-9]{6}$' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid PIN format. PIN must be exactly 6 digits.'
        );
    END IF;

    -- Find school with this PIN and check if it's active
    SELECT id, name, status INTO school_record
    FROM public.schools
    WHERE parent_pin = pin
    AND status = 'active'
    LIMIT 1;

    -- Check if PIN exists and school is active
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid PIN or school is not active.'
        );
    END IF;

    -- Get or create user record from email
    SELECT id INTO parent_user
    FROM public.users
    WHERE LOWER(email) = LOWER(user_email)
    LIMIT 1;

    -- If user doesn't exist, we can't proceed (user should be created during auth)
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User account not found. Please ensure you are logged in.'
        );
    END IF;

    -- Check if parent is already linked to this school
    IF EXISTS (
        SELECT 1 FROM public.school_parents
        WHERE school_id = school_record.id
        AND parent_user_id = parent_user.id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'You are already linked to this school.'
        );
    END IF;

    -- Create entry in school_parents table
    INSERT INTO public.school_parents (
        school_id,
        parent_user_id,
        joined_via_pin,
        joined_at
    ) VALUES (
        school_record.id,
        parent_user.id,
        true,
        NOW()
    )
    ON CONFLICT DO NOTHING;

    -- Automatically link existing students (where parent_email matches)
    FOR student_record IN
        SELECT id FROM public.school_students
        WHERE school_id = school_record.id
        AND LOWER(parent_email) = LOWER(user_email)
        AND status = 'active'
    LOOP
        -- Insert into school_parent_students if not exists
        INSERT INTO public.school_parent_students (
            school_id,
            parent_user_id,
            student_id
        ) VALUES (
            school_record.id,
            parent_user.id,
            student_record.id
        )
        ON CONFLICT (school_id, parent_user_id, student_id) DO NOTHING;
        
        students_linked := students_linked + 1;
    END LOOP;

    -- Return success with school info
    RETURN json_build_object(
        'success', true,
        'school_id', school_record.id,
        'school_name', school_record.name,
        'students_linked', students_linked
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validate_parent_pin IS 'Validates a parent PIN, links parent to school, and automatically links existing students';

-- ============================================================================
-- 6. Update get_user_school_associations to include school_parents
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_school_associations(user_email TEXT)
RETURNS TABLE (
    school_id UUID,
    school_name TEXT,
    school_logo_url TEXT,
    role TEXT,
    access_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check if user is a teacher/admin
    SELECT DISTINCT
        st.school_id,
        s.name as school_name,
        s.logo_url as school_logo_url,
        'admin'::TEXT as role,
        'teacher'::TEXT as access_type
    FROM school_teachers st
    INNER JOIN schools s ON st.school_id = s.id
    WHERE LOWER(st.email) = LOWER(user_email)
      AND s.status = 'active'
      AND st.status = 'active'
    
    UNION
    
    -- Check if user is a parent via school_students (existing students)
    SELECT DISTINCT
        ss.school_id,
        s.name as school_name,
        s.logo_url as school_logo_url,
        'parent'::TEXT as role,
        'parent'::TEXT as access_type
    FROM school_students ss
    INNER JOIN schools s ON ss.school_id = s.id
    WHERE LOWER(ss.parent_email) = LOWER(user_email)
      AND s.status = 'active'
      AND ss.status = 'active'
    
    UNION
    
    -- Check if user is a parent via school_parents (PIN-linked parents)
    SELECT DISTINCT
        sp.school_id,
        s.name as school_name,
        s.logo_url as school_logo_url,
        'parent'::TEXT as role,
        'parent'::TEXT as access_type
    FROM school_parents sp
    INNER JOIN schools s ON sp.school_id = s.id
    INNER JOIN users u ON sp.parent_user_id = u.id
    WHERE LOWER(u.email) = LOWER(user_email)
      AND s.status = 'active'
    
    ORDER BY school_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_school_associations IS 'Returns all schools a user has access to based on their email address, including PIN-linked parents';
