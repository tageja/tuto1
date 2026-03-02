-- Migration 039: Teacher dashboard – attendance track_status and class schedules
-- 1. Add track_status to school_attendance (on_track / off_track)
-- 2. Create school_class_schedules for weekly timetable
-- 3. Helper for teacher's class IDs (for RLS)
-- 4. RPC link_teacher_to_school for first-time teacher login

-- ============================================================================
-- 1. Attendance: add track_status
-- ============================================================================
ALTER TABLE public.school_attendance
  ADD COLUMN IF NOT EXISTS track_status TEXT;

ALTER TABLE public.school_attendance
  DROP CONSTRAINT IF EXISTS school_attendance_track_status_check;

ALTER TABLE public.school_attendance
  ADD CONSTRAINT school_attendance_track_status_check
  CHECK (track_status IS NULL OR lower(track_status) IN ('on_track', 'off_track'));

COMMENT ON COLUMN public.school_attendance.track_status IS 'Teacher assessment: on_track or off_track for the day.';

-- ============================================================================
-- 2. Class schedules (recurring weekly timetable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.school_class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_or_slot_name TEXT,
  room_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_class_schedules_class_day_start
  ON public.school_class_schedules (class_id, day_of_week, start_time);

CREATE INDEX IF NOT EXISTS idx_school_class_schedules_school ON public.school_class_schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_school_class_schedules_class ON public.school_class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_school_class_schedules_class_day ON public.school_class_schedules(class_id, day_of_week);

ALTER TABLE public.school_class_schedules ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_school_class_schedules_updated ON public.school_class_schedules;
CREATE TRIGGER trg_school_class_schedules_updated
  BEFORE UPDATE ON public.school_class_schedules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS: Admin full access for their school
CREATE POLICY school_class_schedules_admin_all ON public.school_class_schedules
  FOR ALL
  USING (
    school_id = ANY(public.get_user_school_ids())
    AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'school_admin'))
  )
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids())
    AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'school_admin'))
  );

-- RLS: Teacher read (and optionally write) for their assigned classes only
CREATE POLICY school_class_schedules_teacher_select ON public.school_class_schedules
  FOR SELECT
  USING (
    class_id IN (
      SELECT c.id FROM public.school_classes c
      INNER JOIN public.school_teachers st ON st.id = c.teacher_id AND st.school_id = c.school_id
      INNER JOIN public.users u ON u.id = st.user_id AND u.auth_user_id = auth.uid()
    )
  );

-- RLS: Parent read for their child's class only
CREATE POLICY school_class_schedules_parent_select ON public.school_class_schedules
  FOR SELECT
  USING (
    class_id IN (
      SELECT DISTINCT ss.class_id FROM public.school_students ss
      WHERE ss.class_id IS NOT NULL
      AND (
        ss.parent_email IN (SELECT email FROM public.users WHERE auth_user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.school_parent_students sps
          WHERE sps.student_id = ss.id AND sps.parent_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      )
    )
  );

-- ============================================================================
-- 3. RPC: link_teacher_to_school – first-time teacher enters school code
-- ============================================================================
CREATE OR REPLACE FUNCTION public.link_teacher_to_school(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_school_id UUID;
  v_school_name TEXT;
  v_teacher_id UUID;
  v_user_id UUID;
  v_email TEXT;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'School code is required');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT id, name INTO v_school_id, v_school_name
  FROM public.schools
  WHERE lower(trim(school_code)) = lower(trim(p_code))
  LIMIT 1;

  IF v_school_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid school code');
  END IF;

  SELECT id INTO v_teacher_id
  FROM public.school_teachers
  WHERE school_id = v_school_id AND lower(trim(email)) = lower(trim(v_email))
  LIMIT 1;

  IF v_teacher_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Your email is not assigned to this school. Contact the admin.');
  END IF;

  INSERT INTO public.users (auth_user_id, email, name, role, updated_at)
  VALUES (
    auth.uid(),
    v_email,
    COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()), split_part(v_email, '@', 1)),
    'teacher',
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_user_id = auth.uid(),
    role = 'teacher',
    updated_at = NOW()
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.users WHERE email = v_email LIMIT 1;
  END IF;

  UPDATE public.school_teachers
  SET user_id = v_user_id, updated_at = NOW()
  WHERE id = v_teacher_id;

  RETURN jsonb_build_object(
    'success', true,
    'school_id', v_school_id,
    'school_name', v_school_name
  );
END;
$$;

COMMENT ON FUNCTION public.link_teacher_to_school(TEXT) IS 'Links current auth user to school_teachers by school code + email. Used on first-time teacher login.';
