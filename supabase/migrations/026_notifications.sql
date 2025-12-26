-- ============================================================================
-- Migration 026: Notifications
-- Description: Create notifications table to store parent/admin notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('parent','admin')),
  type TEXT NOT NULL CHECK (type IN (
    'daily_activity',
    'announcement',
    'message',
    'feedback',
    'attendance_marked',
    'attendance_monthly',
    'progress_report',
    'homework',
    'event',
    'photo_album',
    'medicine',
    'payment'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('urgent','normal')) DEFAULT 'normal',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN (
    'feedback',
    'attendance',
    'homework',
    'event',
    'student',
    'payment',
    'photo_album',
    'report',
    'other'
  )),
  target_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_user ON public.notifications (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_role ON public.notifications (recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications (priority);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications (recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_priority_read ON public.notifications (recipient_user_id, priority, is_read);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Only the intended recipient can read/update their notifications within their schools
CREATE POLICY notifications_recipient_select ON public.notifications
  FOR SELECT
  USING (
    recipient_user_id = (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
    AND school_id = ANY(public.get_user_school_ids())
  );

CREATE POLICY notifications_recipient_update ON public.notifications
  FOR UPDATE
  USING (
    recipient_user_id = (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
    AND school_id = ANY(public.get_user_school_ids())
  )
  WITH CHECK (
    recipient_user_id = (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
    AND school_id = ANY(public.get_user_school_ids())
  );

-- Service role inserts bypass RLS; optional admin insert policy for scoped schools
CREATE POLICY notifications_admin_insert ON public.notifications
  FOR INSERT
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids()) AND public.is_admin()
  );













