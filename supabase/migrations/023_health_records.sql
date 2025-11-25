-- ============================================================================
-- Migration 023: Health Records Feature
-- Description: Update health_records table, create health_emergency_contacts 
-- and health_incident_reports tables, update school_notifications, add RLS
-- ============================================================================

-- ============================================================================
-- UPDATE: health_records table
-- ============================================================================

-- Drop existing constraints and columns that need to change
ALTER TABLE public.health_records 
  DROP CONSTRAINT IF EXISTS health_records_record_type_check;

-- Add new columns
ALTER TABLE public.health_records
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Migrate data: copy description to details if details is empty
UPDATE public.health_records
SET details = jsonb_build_object('description', description)
WHERE (details IS NULL OR details = '{}'::jsonb) AND description IS NOT NULL;

-- Migrate data: copy recorded_date to recorded_at if recorded_at is null
UPDATE public.health_records
SET recorded_at = recorded_date::timestamptz
WHERE recorded_at IS NULL AND recorded_date IS NOT NULL;

-- Drop old columns (after migration)
ALTER TABLE public.health_records
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS recorded_date;

-- Add check constraint for record_type
ALTER TABLE public.health_records
  ADD CONSTRAINT health_records_record_type_check 
  CHECK (record_type IN ('general','vaccination','vitals','note'));

-- Make required columns NOT NULL (after data migration)
ALTER TABLE public.health_records
  ALTER COLUMN details SET DEFAULT '{}',
  ALTER COLUMN recorded_at SET DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_health_records_student_type_recorded 
  ON public.health_records(student_id, record_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_school_recorded 
  ON public.health_records(school_id, recorded_at DESC);

-- ============================================================================
-- TABLE: health_emergency_contacts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.health_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.school_students(id) ON DELETE CASCADE,
  primary_name TEXT,
  primary_phone TEXT,
  alt_name TEXT,
  alt_phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_contacts_student 
  ON public.health_emergency_contacts(student_id);

-- Updated-at trigger
CREATE TRIGGER trg_health_contacts_updated_at
  BEFORE UPDATE ON public.health_emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- TABLE: health_incident_reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.health_incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('fever','cough','tired','injury')),
  meta JSONB NOT NULL DEFAULT '{}',
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_incidents_student_happened 
  ON public.health_incident_reports(student_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_incidents_school_happened 
  ON public.health_incident_reports(school_id, happened_at DESC);

-- ============================================================================
-- UPDATE: school_notifications table
-- ============================================================================

-- Add user_id and read_at columns if they don't exist
ALTER TABLE public.school_notifications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}';

-- Update type constraint to include 'health_incident'
ALTER TABLE public.school_notifications
  DROP CONSTRAINT IF EXISTS school_notifications_type_check;

ALTER TABLE public.school_notifications
  ADD CONSTRAINT school_notifications_type_check 
  CHECK (type IN ('message','announcement','event','health_incident'));

-- Add index for user-specific notifications
CREATE INDEX IF NOT EXISTS idx_snotif_user_created 
  ON public.school_notifications(user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS
-- ============================================================================

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_incident_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: health_records
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS health_records_admin_all ON public.health_records;
DROP POLICY IF EXISTS health_records_parent_select ON public.health_records;

-- Admin: Full CRUD within their schools
CREATE POLICY health_records_admin_all ON public.health_records
  FOR ALL
  USING (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  )
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  );

-- Parent: SELECT only for their children
-- Use school_parent_students directly since get_user_child_student_ids may use email matching
CREATE POLICY health_records_parent_select ON public.health_records
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id 
      FROM public.school_parent_students 
      WHERE parent_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES: health_emergency_contacts
-- ============================================================================

-- Admin: Full CRUD for students in their schools
CREATE POLICY health_contacts_admin_all ON public.health_emergency_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.school_students ss
      WHERE ss.id = health_emergency_contacts.student_id
        AND ss.school_id = ANY(public.get_user_school_ids())
        AND public.is_admin()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_students ss
      WHERE ss.id = health_emergency_contacts.student_id
        AND ss.school_id = ANY(public.get_user_school_ids())
        AND public.is_admin()
    )
  );

-- Parent: SELECT only for their children
CREATE POLICY health_contacts_parent_select ON public.health_emergency_contacts
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id 
      FROM public.school_parent_students 
      WHERE parent_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES: health_incident_reports
-- ============================================================================

-- Admin: Full CRUD within their schools
CREATE POLICY health_incidents_admin_all ON public.health_incident_reports
  FOR ALL
  USING (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  )
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  );

-- Parent: SELECT only for their children
CREATE POLICY health_incidents_parent_select ON public.health_incident_reports
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id 
      FROM public.school_parent_students 
      WHERE parent_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES: school_notifications (for health_incident type)
-- ============================================================================

-- User-specific notifications: Users can read their own notifications
CREATE POLICY snotif_user_select ON public.school_notifications
  FOR SELECT
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR (
      -- Also allow if user is admin and notification is for their school
      public.is_admin() 
      AND school_id = ANY(public.get_user_school_ids())
    )
  );

-- Users can update read_at for their own notifications
CREATE POLICY snotif_user_update_read ON public.school_notifications
  FOR UPDATE
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

