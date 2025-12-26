-- ============================================================================
-- Migration 023: Fix Admin School Access
-- Description: Update get_user_school_ids to give global admins access to all schools
-- Date: 2024-12-15
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_school_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        -- School admin/teachers: get their specific schools
        SELECT DISTINCT school_id
        FROM public.school_teachers
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        
        UNION
        
        -- Parents: get schools of their children
        SELECT DISTINCT school_id
        FROM public.school_students
        WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        
        UNION
        
        -- Global admins: access ALL schools
        SELECT id FROM public.schools 
        WHERE EXISTS(
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_school_ids() IS 'Returns array of school IDs accessible to current user. Global admins get all schools.';






