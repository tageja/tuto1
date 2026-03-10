-- ============================================================
-- NurseEd: Hospital Admin Role & Invite Codes
-- Migration 042 — already applied to production Supabase
-- ============================================================

-- ─── Hospital Admins (links auth.users to hospitals) ────────
CREATE TABLE IF NOT EXISTS nursed_hospital_admins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES nursed_hospitals(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_nursed_hospital_admins_user ON nursed_hospital_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_nursed_hospital_admins_hospital ON nursed_hospital_admins(hospital_id);

-- ─── Invite code for hospital enrollment ───────────────────
ALTER TABLE nursed_hospitals ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- ─── RLS ───────────────────────────────────────────────────
ALTER TABLE nursed_hospital_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nursed_hospital_admins_service_all" ON nursed_hospital_admins FOR ALL USING (true);

-- ─── Function: Hospital nurse roster (joins auth.users for email) ─
CREATE OR REPLACE FUNCTION get_hospital_nurse_roster(p_hospital_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  course_id uuid,
  course_title text,
  status text,
  enrolled_at timestamptz,
  completed_lessons bigint,
  last_active timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.user_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name')::text AS display_name,
    e.course_id,
    c.title AS course_title,
    e.status,
    e.enrolled_at,
    (SELECT COUNT(*) FROM nursed_progress p WHERE p.user_id = e.user_id AND p.completed = true) AS completed_lessons,
    (SELECT MAX(p.last_active) FROM nursed_progress p WHERE p.user_id = e.user_id) AS last_active
  FROM nursed_enrollments e
  LEFT JOIN auth.users u ON u.id = e.user_id
  LEFT JOIN nursed_courses c ON c.id = e.course_id
  WHERE e.hospital_id = p_hospital_id
  ORDER BY e.enrolled_at DESC;
$$;
