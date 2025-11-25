-- ============================================================================
-- Supabase Migration 008: School Announcements System
-- Description: Complete announcements feature with read receipts, notifications, 
--              class targeting, and RLS policies
-- ============================================================================

-- MCP Introspection Results (2024-11-17):
-- ✓ Existing 'announcements' table found (keeping untouched for backward compatibility)
-- ✓ Helper functions exist: get_user_role(), get_user_school_ids(), is_admin()
-- ✗ New tables needed: school_announcements, announcement_reads, school_notifications
-- ✗ New helper function needed: get_user_child_class_ids()

-- ============================================================================
-- HELPER FUNCTION: Get Class IDs for User's Children
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_child_class_ids()
RETURNS UUID[] AS $$
BEGIN
    -- For parents: get class IDs of their children
    -- For admins/teachers: return empty array (they see all via other policies)
    RETURN ARRAY(
        SELECT DISTINCT class_id
        FROM public.school_students
        WHERE parent_email IN (
            SELECT email FROM public.users WHERE auth_user_id = auth.uid()
        )
        AND class_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABLE: school_announcements (New table, keep old 'announcements' intact)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,                                                -- e.g., School Event, Academic, Cafeteria
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low','Normal','High','Urgent')),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published','Archived')),
  target_scope TEXT NOT NULL DEFAULT 'School' CHECK (target_scope IN ('School','Classes')),
  class_ids UUID[] DEFAULT NULL,                                -- when target_scope='Classes'
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sann_school_status ON public.school_announcements (school_id, status);
CREATE INDEX IF NOT EXISTS idx_sann_school_priority ON public.school_announcements (school_id, priority);
CREATE INDEX IF NOT EXISTS idx_sann_school_expires ON public.school_announcements (school_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_sann_school_published ON public.school_announcements (school_id, published_at);
CREATE INDEX IF NOT EXISTS idx_sann_class_ids ON public.school_announcements USING gin (class_ids);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.touch_updated_at() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
END 
$$;

DROP TRIGGER IF EXISTS trg_sann_touch ON public.school_announcements;
CREATE TRIGGER trg_sann_touch 
    BEFORE UPDATE ON public.school_announcements
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- TABLE: announcement_reads (Track read receipts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  announcement_id UUID NOT NULL REFERENCES public.school_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_areads_announcement ON public.announcement_reads (announcement_id);
CREATE INDEX IF NOT EXISTS idx_areads_user ON public.announcement_reads (user_id);

-- ============================================================================
-- TABLE: school_notifications (Optional notification feed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('announcement')),
  ref_id UUID NOT NULL,                                         -- -> school_announcements.id
  title TEXT NOT NULL,
  audience_scope TEXT NOT NULL DEFAULT 'School' CHECK (audience_scope IN ('School','Classes')),
  class_ids UUID[] DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snotif_school ON public.school_notifications (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snotif_type_ref ON public.school_notifications (type, ref_id);

-- ============================================================================
-- ROW LEVEL SECURITY: Enable on all tables
-- ============================================================================

ALTER TABLE public.school_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: school_announcements
-- ============================================================================

-- Parents can select published, non-expired announcements in their schools
-- with class targeting filter
CREATE POLICY sann_select_parent ON public.school_announcements
FOR SELECT USING (
  school_id = ANY(get_user_school_ids())
  AND status = 'Published'
  AND (expires_at IS NULL OR expires_at > NOW())
  AND (
    target_scope = 'School'
    OR (target_scope = 'Classes' AND class_ids && COALESCE(get_user_child_class_ids(), ARRAY[]::UUID[]))
  )
);

-- Admins can select all announcements in their schools
CREATE POLICY sann_select_admin ON public.school_announcements
FOR SELECT USING (
  school_id = ANY(get_user_school_ids()) AND is_admin()
);

-- Admins can insert/update/delete announcements in their schools
CREATE POLICY sann_write_admin ON public.school_announcements
FOR ALL USING (
  school_id = ANY(get_user_school_ids()) AND is_admin()
) WITH CHECK (
  school_id = ANY(get_user_school_ids()) AND is_admin()
);

-- ============================================================================
-- RLS POLICIES: announcement_reads
-- ============================================================================

-- Users can select their own read receipts for announcements in their schools
CREATE POLICY areads_select ON public.announcement_reads
FOR SELECT USING (
  user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
  OR EXISTS (
    SELECT 1 FROM public.school_announcements a
    WHERE a.id = announcement_id 
      AND a.school_id = ANY(get_user_school_ids())
      AND is_admin()
  )
);

-- Users can insert their own read receipts for accessible announcements
CREATE POLICY areads_insert ON public.announcement_reads
FOR INSERT WITH CHECK (
  user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
  AND EXISTS (
    SELECT 1 FROM public.school_announcements a
    WHERE a.id = announcement_id 
      AND a.school_id = ANY(get_user_school_ids())
  )
);

-- ============================================================================
-- RLS POLICIES: school_notifications
-- ============================================================================

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

COMMENT ON TABLE public.school_announcements IS 'School announcements with class targeting and status workflow (Draft/Published/Archived)';
COMMENT ON TABLE public.announcement_reads IS 'Read receipts tracking which users have read which announcements';
COMMENT ON TABLE public.school_notifications IS 'Notification feed for push notifications and activity streams';
COMMENT ON FUNCTION public.get_user_child_class_ids() IS 'Returns array of class IDs for current user''s children (used in announcement class targeting)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Schema changes:
--   ✓ Created school_announcements table with 14 fields, 5 indexes, 1 trigger
--   ✓ Created announcement_reads table with composite PK, 2 indexes
--   ✓ Created school_notifications table with 2 indexes
--   ✓ Created get_user_child_class_ids() helper function
--   ✓ Enabled RLS on all 3 tables
--   ✓ Created 7 RLS policies (select, insert, write controls)
--   ✓ Added documentation comments
--
-- Next steps:
--   1. Apply migration via Supabase MCP
--   2. Implement API routes in apps/dashboard/app/api/school/announcements/
--   3. Build UI components and pages
-- ============================================================================





