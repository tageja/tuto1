-- Include PIN-linked parents in get_user_school_ids so RLS allows reading school row after PIN
-- Fixes 406 on schools and school dashboard for parents who joined via PIN only (no school_students row yet)
CREATE OR REPLACE FUNCTION public.get_user_school_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        -- School admin/teachers: get their specific schools
        SELECT DISTINCT school_id
        FROM public.school_teachers
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        
        UNION
        
        -- Parents: get schools of their children (school_students.parent_email)
        SELECT DISTINCT school_id
        FROM public.school_students
        WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        
        UNION
        
        -- Parents: get schools linked via PIN (school_parents)
        SELECT DISTINCT school_id
        FROM public.school_parents
        WHERE parent_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        
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

COMMENT ON FUNCTION public.get_user_school_ids() IS 'Returns array of school IDs accessible to current user (teachers, parents via children or PIN, global admins).';
