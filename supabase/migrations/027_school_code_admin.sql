-- Migration: Add School Code Support for Admins
-- Description: Adds school_code to schools table, creates school_admins table, and adds validation RPC

-- 1. Add school_code to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_code TEXT;

-- Create unique index on school_code where it is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_school_code ON public.schools(school_code) WHERE school_code IS NOT NULL;

-- 2. Create school_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

-- Enable RLS
ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_school_admins_updated_at ON public.school_admins;
CREATE TRIGGER update_school_admins_updated_at BEFORE UPDATE ON public.school_admins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for school_admins

-- Admins can view their own entries
CREATE POLICY "Admins can view own school admin entries"
    ON public.school_admins FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Global admins can view all
CREATE POLICY "Global admins can view all school admin entries"
    ON public.school_admins FOR ALL
    USING (public.is_admin());

-- 3. Create RPC for validating school code and linking admin
CREATE OR REPLACE FUNCTION public.validate_school_code(code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to update roles/insert admins
AS $$
DECLARE
    target_school_id UUID;
    target_school_name TEXT;
    current_user_id UUID;
    current_role TEXT;
    result JSONB;
BEGIN
    -- Input validation
    IF code IS NULL OR length(trim(code)) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'School code is required'
        );
    END IF;

    -- Get current user (internal ID)
    SELECT id, role INTO current_user_id, current_role
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;

    -- Find school by code (case-insensitive)
    SELECT id, name INTO target_school_id, target_school_name
    FROM public.schools
    WHERE lower(school_code) = lower(trim(code))
    LIMIT 1;

    IF target_school_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid school code'
        );
    END IF;

    -- Link user to school as admin
    INSERT INTO public.school_admins (school_id, user_id)
    VALUES (target_school_id, current_user_id)
    ON CONFLICT (school_id, user_id) DO NOTHING;

    -- Update user role to 'school_admin' if they are currently 'parent' or 'student'
    -- If they are already 'admin' (global) or 'teacher', we preserve that primary role 
    -- but they still get the school link.
    -- Assuming we want to switch them to 'school_admin' if they are upgrading from a basic user.
    IF current_role IN ('parent', 'student', 'teacher', 'admin', 'school_admin') THEN
         -- For this feature request: "The user is allowed to become an Admin for that school"
         -- We update role to school_admin if not already global admin
         IF current_role NOT IN ('admin', 'school_admin') THEN
             UPDATE public.users
             SET role = 'school_admin'
             WHERE id = current_user_id;
         END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'school_id', target_school_id,
        'school_name', target_school_name,
        'role', 'school_admin'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$;

