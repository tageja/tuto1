-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 051: Extended profile fields + endorsements table
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend nursed_profiles with professional + personal fields
ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS position      text         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_of_birth date         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bio           text         DEFAULT NULL;

-- 2. Endorsements table (peer-to-peer, one per pair)
CREATE TABLE IF NOT EXISTS nursed_endorsements (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  uuid        NOT NULL REFERENCES nursed_profiles(id) ON DELETE CASCADE,
  to_user_id    uuid        NOT NULL REFERENCES nursed_profiles(id) ON DELETE CASCADE,
  message       text        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 300),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_endorsement_pair UNIQUE (from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_nursed_endorsements_to_user
  ON nursed_endorsements(to_user_id);

-- 3. RLS on endorsements
ALTER TABLE nursed_endorsements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_endorsements' AND policyname = 'learners can view their own endorsements'
  ) THEN
    CREATE POLICY "learners can view their own endorsements" ON nursed_endorsements
      FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_endorsements' AND policyname = 'learners can give endorsements'
  ) THEN
    CREATE POLICY "learners can give endorsements" ON nursed_endorsements
      FOR INSERT WITH CHECK (auth.uid() = from_user_id);
  END IF;
END$$;
