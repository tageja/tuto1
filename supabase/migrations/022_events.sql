-- ============================================================================
-- Migration 022: Events Feature
-- Description: Create school_events and event_registrations tables with RLS
-- ============================================================================

-- ============================================================================
-- TABLE: school_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'school' 
    CHECK (category IN ('school','class','competition','workshop','outing','practice','celebration')),
  class_id UUID REFERENCES public.school_classes(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft','published','completed','cancelled')),
  capacity INTEGER,
  parent_note TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for school_events
CREATE INDEX IF NOT EXISTS idx_events_school_start ON public.school_events(school_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_school_category_start ON public.school_events(school_id, category, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_class ON public.school_events(class_id) WHERE class_id IS NOT NULL;

-- ============================================================================
-- TABLE: event_registrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.school_events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'registered' 
    CHECK (status IN ('registered','cancelled','waitlisted')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for event_registrations
CREATE INDEX IF NOT EXISTS idx_regs_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_regs_student ON public.event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_regs_parent ON public.event_registrations(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_regs_school ON public.event_registrations(school_id);

-- Unique constraint: one active registration per student per event
CREATE UNIQUE INDEX IF NOT EXISTS uq_reg_unique 
  ON public.event_registrations(event_id, student_id) 
  WHERE (status = 'registered');

-- ============================================================================
-- TABLE: school_notifications (Create if not exists, update type check)
-- ============================================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('announcement','event')),
  ref_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  audience_scope TEXT NOT NULL DEFAULT 'School' CHECK (audience_scope IN ('School','Classes')),
  class_ids UUID[] DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update type check if table exists (drop and recreate constraint)
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'school_notifications_type_check'
  ) THEN
    ALTER TABLE public.school_notifications 
      DROP CONSTRAINT school_notifications_type_check;
  END IF;
  
  -- Add new constraint with 'event' included
  ALTER TABLE public.school_notifications 
    ADD CONSTRAINT school_notifications_type_check 
    CHECK (type IN ('announcement','event'));
END $$;

-- Add message column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'school_notifications' 
    AND column_name = 'message'
  ) THEN
    ALTER TABLE public.school_notifications 
      ADD COLUMN message TEXT;
  END IF;
END $$;

-- Indexes for school_notifications
CREATE INDEX IF NOT EXISTS idx_snotif_school ON public.school_notifications (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snotif_type_ref ON public.school_notifications (type, ref_id);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for school_events
DROP TRIGGER IF EXISTS update_school_events_updated_at ON public.school_events;
CREATE TRIGGER update_school_events_updated_at 
  BEFORE UPDATE ON public.school_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS
-- ============================================================================

ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: school_events
-- ============================================================================

-- Admin: Full CRUD within their schools
CREATE POLICY events_admin_all ON public.school_events
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Read published events in their school
-- If class_id is set, parent must have child in that class
CREATE POLICY events_parent_select ON public.school_events
  FOR SELECT
  USING (
    status = 'published' 
    AND school_id = ANY(get_user_school_ids())
    AND (
      class_id IS NULL 
      OR class_id IN (
        SELECT DISTINCT class_id 
        FROM public.school_students 
        WHERE id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: event_registrations
-- ============================================================================

-- Admin: Full access within their schools
CREATE POLICY regs_admin_all ON public.event_registrations
  FOR ALL
  USING (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  )
  WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- Parent: Insert registrations for their own children
CREATE POLICY regs_parent_insert ON public.event_registrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = parent_user_id
        AND u.auth_user_id = auth.uid()
    )
    AND student_id = ANY(COALESCE(get_user_child_student_ids(), ARRAY[]::uuid[]))
    AND EXISTS (
      SELECT 1 FROM public.school_events e
      WHERE e.id = event_id
        AND e.status = 'published'
        AND e.school_id = school_id
    )
  );

-- Parent: Update their own registrations
CREATE POLICY regs_parent_update ON public.event_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = parent_user_id
        AND u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = parent_user_id
        AND u.auth_user_id = auth.uid()
    )
  );

-- Parent: Select their own registrations
CREATE POLICY regs_parent_select ON public.event_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = parent_user_id
        AND u.auth_user_id = auth.uid()
    )
    OR school_id = ANY(get_user_school_ids())
  );

-- ============================================================================
-- RLS POLICIES: school_notifications (if not already exists)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS notif_select ON public.school_notifications;
DROP POLICY IF EXISTS notif_insert_admin ON public.school_notifications;

-- Users can select notifications in their schools
CREATE POLICY notif_select ON public.school_notifications
  FOR SELECT USING (
    school_id = ANY(get_user_school_ids())
  );

-- Only admins can create notifications
CREATE POLICY notif_insert_admin ON public.school_notifications
  FOR INSERT WITH CHECK (
    school_id = ANY(get_user_school_ids()) AND is_admin()
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.school_events IS 'School events with categories, capacity, and parent notes';
COMMENT ON TABLE public.event_registrations IS 'Student registrations for events with capacity and waitlist support';
COMMENT ON TABLE public.school_notifications IS 'Notification feed for announcements and events';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

