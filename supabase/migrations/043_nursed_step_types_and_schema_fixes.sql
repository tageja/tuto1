-- ============================================================
-- NurseEd: Step Types Expansion + Schema Fixes
-- Migration 043
-- ============================================================
-- Fixes:
--   1. Expand CHECK constraint on nursed_lesson_steps.type to include
--      all step types added in nursemed1.3 branch
--      (scenario_intro, self_reflection, conversation_animation,
--       matching, drag_order, flash_card)
--   2. Add title_vi column to nursed_lesson_steps
--   3. Add stage and objective columns to nursed_lessons
--   4. Create nursed_profiles table (auth user metadata store)
-- ============================================================

-- ─── 1. Fix nursed_lesson_steps ──────────────────────────────

-- Drop old type CHECK constraint (auto-named by Postgres)
ALTER TABLE nursed_lesson_steps
  DROP CONSTRAINT IF EXISTS nursed_lesson_steps_type_check;

-- Add updated CHECK with all step types (original + nursemed1.3 additions)
ALTER TABLE nursed_lesson_steps
  ADD CONSTRAINT nursed_lesson_steps_type_check CHECK (type IN (
    'video',
    'audio_shadow',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'quiz',
    'mission',
    'scenario_intro',
    'self_reflection',
    'conversation_animation',
    'matching',
    'drag_order',
    'flash_card'
  ));

-- Add title_vi column (bilingual title support)
ALTER TABLE nursed_lesson_steps
  ADD COLUMN IF NOT EXISTS title_vi text;

-- ─── 2. Fix nursed_lessons ───────────────────────────────────

-- Add lesson stage (used by the 4-stage lesson framework)
ALTER TABLE nursed_lessons
  ADD COLUMN IF NOT EXISTS stage text
    CHECK (stage IN ('heads_up', 'heads_down', 'heads_together', 'assessment'));

-- Add lesson objective (plain-text learning objective shown in admin)
ALTER TABLE nursed_lessons
  ADD COLUMN IF NOT EXISTS objective text;

-- ─── 3. Create nursed_profiles ───────────────────────────────
-- Stores user metadata (full_name, role, hospital) synced from auth.users
-- Created on first login via /auth/callback (upsert)

CREATE TABLE IF NOT EXISTS nursed_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text,
  hospital_id  uuid REFERENCES nursed_hospitals(id) ON DELETE SET NULL,
  role         text NOT NULL DEFAULT 'learner'
                 CHECK (role IN ('learner', 'teacher', 'hospital_admin', 'super_admin')),
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nursed_profiles_hospital
  ON nursed_profiles(hospital_id);

ALTER TABLE nursed_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "nursed_profiles_self_read"
  ON nursed_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "nursed_profiles_self_update"
  ON nursed_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role / callback can upsert any profile
CREATE POLICY "nursed_profiles_service_all"
  ON nursed_profiles FOR ALL
  USING (true);
