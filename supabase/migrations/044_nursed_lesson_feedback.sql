-- ============================================================
-- NurseEd: End-of-lesson learner feedback (MVP survey)
-- Migration 044
-- ============================================================

CREATE TABLE IF NOT EXISTS nursed_lesson_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  q1_animation  int CHECK (q1_animation BETWEEN 1 AND 5),
  q2_variety    int CHECK (q2_variety BETWEEN 1 AND 5),
  q3_usefulness int CHECK (q3_usefulness BETWEEN 1 AND 5),
  q4_confidence int CHECK (q4_confidence BETWEEN 1 AND 5),
  q5_continue   int CHECK (q5_continue BETWEEN 1 AND 5),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_nursed_lesson_feedback_lesson
  ON nursed_lesson_feedback(lesson_id);

ALTER TABLE nursed_lesson_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nursed_feedback_self_insert"
  ON nursed_lesson_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nursed_feedback_self_select"
  ON nursed_lesson_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "nursed_feedback_service_all"
  ON nursed_lesson_feedback FOR ALL
  USING (true);
