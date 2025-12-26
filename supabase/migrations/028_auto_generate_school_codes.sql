-- Migration: Auto-generate school codes and backfill
-- Description: Adds trigger to auto-generate school codes on insert, and backfills existing schools

-- 1. Create function to generate unique school code
CREATE OR REPLACE FUNCTION public.generate_school_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes I, O, 0, 1 for readability
    result TEXT := '';
    i INTEGER;
    done BOOLEAN := false;
    collision_check INTEGER;
BEGIN
    -- Loop until unique code found
    WHILE NOT done LOOP
        result := 'SCH-';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Check for collision
        SELECT count(*) INTO collision_check FROM public.schools WHERE school_code = result;
        
        IF collision_check = 0 THEN
            done := true;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;

-- 2. Create trigger function to set school_code on insert
CREATE OR REPLACE FUNCTION public.set_school_code_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.school_code IS NULL THEN
        NEW.school_code := public.generate_school_code();
    END IF;
    RETURN NEW;
END;
$$;

-- 3. Attach trigger to schools table
DROP TRIGGER IF EXISTS trigger_set_school_code ON public.schools;
CREATE TRIGGER trigger_set_school_code
    BEFORE INSERT ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.set_school_code_on_insert();

-- 4. Backfill existing schools that don't have a code
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.schools WHERE school_code IS NULL LOOP
        UPDATE public.schools
        SET school_code = public.generate_school_code()
        WHERE id = r.id;
    END LOOP;
END;
$$;










