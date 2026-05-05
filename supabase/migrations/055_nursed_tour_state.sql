-- ============================================================
-- NurseEd: Onboarding Product Tour state (Agent AA)
-- Migration 055
-- ============================================================

ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS tour_skipped_at   timestamptz;

CREATE INDEX IF NOT EXISTS idx_nursed_profiles_tour_state
  ON nursed_profiles (tour_completed_at, tour_skipped_at)
  WHERE tour_completed_at IS NULL AND tour_skipped_at IS NULL;

-- Existing self-update RLS already covers UPDATEs to these columns via the user's own profile row.
-- No new policies needed.
