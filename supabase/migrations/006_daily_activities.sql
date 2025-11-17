-- ============================================================================
-- Supabase Migration 006: Daily Activities
-- Description: Create school_daily_activities table, indexes, view, bucket, and RLS policies
-- ============================================================================

-- ============================================================================
-- CREATE TABLE: school_daily_activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Meal', 'Learning', 'Play', 'Rest')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
  teacher_id UUID REFERENCES public.school_teachers(id) ON DELETE SET NULL,
  menu_details TEXT,
  outdoor_detail TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- [{name,url,size}]
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_activities_school_date ON public.school_daily_activities (school_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_school_class ON public.school_daily_activities (school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_activities_school_type ON public.school_daily_activities (school_id, type);
CREATE INDEX IF NOT EXISTS idx_activities_school_status ON public.school_daily_activities (school_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_school_date_time ON public.school_daily_activities (school_id, date, time);

-- ============================================================================
-- CREATE VIEW: v_daily_activity_counts (for KPIs)
-- ============================================================================

CREATE OR REPLACE VIEW public.v_daily_activity_counts AS
SELECT
  school_id,
  date,
  COUNT(*)::INT AS total,
  COUNT(*) FILTER (WHERE status = 'Completed')::INT AS completed,
  COUNT(*) FILTER (WHERE status = 'In Progress')::INT AS in_progress,
  COUNT(*) FILTER (WHERE status = 'Pending')::INT AS pending
FROM public.school_daily_activities
GROUP BY school_id, date;

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
SELECT 'activity-attachments', 'activity-attachments', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'activity-attachments');

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.school_daily_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Admin can do everything for their school
CREATE POLICY "Admin can view activities for their school"
  ON public.school_daily_activities
  FOR SELECT
  USING (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );

CREATE POLICY "Admin can insert activities for their school"
  ON public.school_daily_activities
  FOR INSERT
  WITH CHECK (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );

CREATE POLICY "Admin can update activities for their school"
  ON public.school_daily_activities
  FOR UPDATE
  USING (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );

CREATE POLICY "Admin can delete activities for their school"
  ON public.school_daily_activities
  FOR DELETE
  USING (
    school_id IN (SELECT UNNEST(get_user_school_ids()))
    AND (is_admin() OR get_user_role() = 'school_admin')
  );

-- Parents can view activities for their children's classes
CREATE POLICY "Parents can view activities for their children's school"
  ON public.school_daily_activities
  FOR SELECT
  USING (
    school_id IN (
      SELECT DISTINCT ss.school_id
      FROM public.school_students ss
      WHERE ss.parent_email IN (
        SELECT email FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
    AND get_user_role() = 'parent'
  );

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_school_daily_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_school_daily_activities_updated_at
  BEFORE UPDATE ON public.school_daily_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_school_daily_activities_updated_at();


