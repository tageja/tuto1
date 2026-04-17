-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 050: Nursed Learning Preferences & Schedule
-- Adds onboarding preference columns to nursed_profiles,
-- an admin summary view, and the RLS UPDATE policy.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add preference columns to nursed_profiles
ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS learning_intensity  text
    CHECK (learning_intensity IN ('mini', 'deep'))
    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_days      text
    CHECK (preferred_days IN ('everyday', 'weekdays', 'weekends'))
    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS schedule_set_at     timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_done     boolean NOT NULL DEFAULT false;

-- 2. Index for admin queries
--    hospital_admin can filter by learners who haven't completed onboarding
CREATE INDEX IF NOT EXISTS idx_nursed_profiles_onboarding
  ON nursed_profiles(hospital_id, onboarding_done);

-- 3. Admin activity summary view
--    Agent M: do NOT build admin UI — this is the hook for a future phase
CREATE OR REPLACE VIEW nursed_learner_activity_summary AS
SELECT
  np.id                                      AS user_id,
  np.full_name,
  np.hospital_id,
  np.onboarding_done,
  np.preferred_days,
  np.learning_intensity,
  COUNT(DISTINCT DATE(pr.last_active AT TIME ZONE 'Asia/Ho_Chi_Minh'))
    FILTER (WHERE pr.completed AND pr.last_active >= now() - interval '30 days')
                                             AS active_days_last_30,
  MAX(pr.last_active)                        AS last_seen_at
FROM nursed_profiles np
LEFT JOIN nursed_progress pr ON pr.user_id = np.id
GROUP BY np.id, np.full_name, np.hospital_id, np.onboarding_done,
         np.preferred_days, np.learning_intensity;

COMMENT ON VIEW nursed_learner_activity_summary IS
  'Admin hook: hospital_admin can query WHERE hospital_id = $1 to see learner regularity. UI not yet built — see handover M.';

-- 4. RLS UPDATE policy — learners can update their own preferences
--    (service role bypasses RLS so the API route works regardless)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_profiles'
      AND policyname = 'learner update own preferences'
  ) THEN
    CREATE POLICY "learner update own preferences" ON nursed_profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;
