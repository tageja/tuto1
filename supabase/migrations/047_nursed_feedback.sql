-- NurseEd: General-purpose learner feedback system
-- Migration 047

CREATE TABLE IF NOT EXISTS nursed_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        text NOT NULL CHECK (category IN ('bug', 'suggestion', 'content', 'other')),
  message         text NOT NULL,
  page_context    text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'fixed', 'rejected')),
  admin_response  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_nursed_feedback_user   ON nursed_feedback(user_id);
CREATE INDEX idx_nursed_feedback_status ON nursed_feedback(status);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION _nursed_feedback_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nursed_feedback_updated_at
  BEFORE UPDATE ON nursed_feedback
  FOR EACH ROW
  EXECUTE FUNCTION _nursed_feedback_set_updated_at();

-- RLS
ALTER TABLE nursed_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_self_insert" ON nursed_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_self_select" ON nursed_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feedback_service_all" ON nursed_feedback
  FOR ALL USING (true);
