-- ============================================================
-- NurseEd: HCMUTE Survey Responses (Agent BB / Orchestrator)
-- Migration 056
-- ============================================================

CREATE TABLE IF NOT EXISTS nursed_survey_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   text NOT NULL DEFAULT 'hcmute_2026',
  name        text NOT NULL,
  email       text NOT NULL,
  age         integer,
  gender      text,
  phone       text,
  answers     jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id
  ON nursed_survey_responses (survey_id);

CREATE INDEX IF NOT EXISTS idx_survey_responses_email
  ON nursed_survey_responses (email);

CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at
  ON nursed_survey_responses (created_at DESC);

-- Anyone can submit a survey (anonymous, no login required)
ALTER TABLE nursed_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_public_insert"
  ON nursed_survey_responses
  FOR INSERT
  WITH CHECK (true);

-- Direct SELECT blocked — reads go through service-role API route only
CREATE POLICY "survey_no_public_select"
  ON nursed_survey_responses
  FOR SELECT
  USING (false);
