-- Migration: Admin Invitation Codes Support
-- Description: Extend school_invitations table to support admin onboarding codes
-- Date: 2026-01-06

-- Add invitation_type to distinguish between different invitation types
ALTER TABLE school_invitations 
  ADD COLUMN IF NOT EXISTS invitation_type text 
  CHECK (invitation_type IN ('teacher', 'parent', 'admin_onboarding'))
  DEFAULT 'teacher';

-- Add is_single_use flag for executive admin codes
ALTER TABLE school_invitations 
  ADD COLUMN IF NOT EXISTS is_single_use boolean DEFAULT false;

-- Add comment to explain the columns
COMMENT ON COLUMN school_invitations.invitation_type IS 'Type of invitation: teacher (regular school staff), parent (student parent), admin_onboarding (executive code for school admins)';
COMMENT ON COLUMN school_invitations.is_single_use IS 'Whether this invitation code can only be used once (typically true for admin_onboarding codes)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_school_invitations_token_type 
  ON school_invitations(token, invitation_type) 
  WHERE status = 'pending';

-- Update existing records to have the default type
UPDATE school_invitations 
SET invitation_type = 'teacher' 
WHERE invitation_type IS NULL;

-- Create RPC function to get user school associations
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
    
    -- Check if user is a parent
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
    
    ORDER BY school_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_school_associations IS 'Returns all schools a user has access to based on their email address, with their role (admin for teachers, parent for parents)';


