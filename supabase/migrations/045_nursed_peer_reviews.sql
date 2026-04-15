-- ============================================================
-- NurseEd: Peer Audio Review System
-- Migration 045 — nursed_peer_reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS nursed_peer_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES nursed_submissions(id) ON DELETE CASCADE,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, submission_id)
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_nursed_peer_reviews_reviewer ON nursed_peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_nursed_peer_reviews_submission ON nursed_peer_reviews(submission_id);

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE nursed_peer_reviews ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "nursed_service_all_peer_reviews" ON nursed_peer_reviews
  FOR ALL USING (true);

-- Learners can read peer reviews where the submission belongs to their group
CREATE POLICY "peer_reviews_group_read" ON nursed_peer_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nursed_submissions s
      JOIN nursed_pair_members pm1 ON pm1.user_id = s.user_id
      JOIN nursed_pair_members pm2 ON pm2.pair_group_id = pm1.pair_group_id
      WHERE s.id = nursed_peer_reviews.submission_id
        AND pm2.user_id = auth.uid()
    )
  );

-- Learners can insert reviews for group members' submissions (not their own)
CREATE POLICY "peer_reviews_group_insert" ON nursed_peer_reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM nursed_submissions s
      JOIN nursed_pair_members pm1 ON pm1.user_id = s.user_id
      JOIN nursed_pair_members pm2 ON pm2.pair_group_id = pm1.pair_group_id
      WHERE s.id = nursed_peer_reviews.submission_id
        AND pm2.user_id = auth.uid()
        AND s.user_id != auth.uid()
    )
  );
