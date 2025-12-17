-- ============================================================================
-- Migration 031: Medicine Schema Updates
-- Description: Add missing fields to medicine_reminders and create 
--              medicine_administration_logs table
-- ============================================================================

-- ============================================================================
-- UPDATE: medicine_reminders table
-- ============================================================================

-- Add time_of_day column (array of time strings)
ALTER TABLE public.medicine_reminders
  ADD COLUMN IF NOT EXISTS time_of_day TEXT[];

-- Add created_by column
ALTER TABLE public.medicine_reminders
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE: medicine_administration_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.medicine_administration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.school_students(id) ON DELETE CASCADE,
    reminder_id UUID REFERENCES public.medicine_reminders(id) ON DELETE SET NULL,
    administered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    administered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'skipped')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_medicine_administration_logs_school_id 
  ON public.medicine_administration_logs(school_id);

CREATE INDEX IF NOT EXISTS idx_medicine_administration_logs_student_id 
  ON public.medicine_administration_logs(student_id);

CREATE INDEX IF NOT EXISTS idx_medicine_administration_logs_reminder_id 
  ON public.medicine_administration_logs(reminder_id);

CREATE INDEX IF NOT EXISTS idx_medicine_administration_logs_administered_at 
  ON public.medicine_administration_logs(administered_at DESC);

CREATE INDEX IF NOT EXISTS idx_medicine_administration_logs_status 
  ON public.medicine_administration_logs(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.medicine_administration_logs ENABLE ROW LEVEL SECURITY;

-- Parents and school staff can read medicine administration logs
CREATE POLICY "Parents and school staff can read medicine logs"
    ON public.medicine_administration_logs FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.school_students 
            WHERE parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can insert medicine administration logs
CREATE POLICY "School staff can insert medicine logs"
    ON public.medicine_administration_logs FOR INSERT
    WITH CHECK (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can update medicine administration logs
CREATE POLICY "School staff can update medicine logs"
    ON public.medicine_administration_logs FOR UPDATE
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can delete medicine administration logs
CREATE POLICY "School staff can delete medicine logs"
    ON public.medicine_administration_logs FOR DELETE
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on medicine_administration_logs
CREATE TRIGGER update_medicine_administration_logs_updated_at 
    BEFORE UPDATE ON public.medicine_administration_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UPDATE: medicine_reminders RLS policies (if needed)
-- ============================================================================

-- School staff can insert medicine reminders
CREATE POLICY IF NOT EXISTS "School staff can insert medicine reminders"
    ON public.medicine_reminders FOR INSERT
    WITH CHECK (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can update medicine reminders
CREATE POLICY IF NOT EXISTS "School staff can update medicine reminders"
    ON public.medicine_reminders FOR UPDATE
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );

-- School staff can delete medicine reminders
CREATE POLICY IF NOT EXISTS "School staff can delete medicine reminders"
    ON public.medicine_reminders FOR DELETE
    USING (
        school_id = ANY(public.get_user_school_ids())
        OR public.is_admin()
    );


