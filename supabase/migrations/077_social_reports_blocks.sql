-- Migration: 077_social_reports_blocks.sql
-- Part 9: Reports, blocks, mutes for moderation & safety

-- ============================================================================
-- social_reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  target_type  VARCHAR(20) NOT NULL
               CHECK (target_type IN ('user', 'post', 'comment', 'reel')),
  target_id    UUID NOT NULL,
  reason       VARCHAR(50) NOT NULL,
  description  TEXT,
  evidence     JSONB DEFAULT '{}',
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  admin_notes  TEXT,
  resolved_by  UUID REFERENCES social_profiles(id) ON DELETE SET NULL,
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_reports_reporter
  ON social_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_target
  ON social_reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_status
  ON social_reports (status, created_at DESC);

ALTER TABLE social_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can insert their own reports
CREATE POLICY "social_reports_insert_own"
  ON social_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Reporters can view their own reports
CREATE POLICY "social_reports_select_own"
  ON social_reports FOR SELECT TO authenticated
  USING (reporter_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- School admins and Tuto HQ can view/update reports (via service role in Edge Function)
-- No direct RLS for admins; Edge Function uses service role
CREATE POLICY "social_reports_select_admin"
  ON social_reports FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_profiles
      WHERE user_id = auth.uid()
      AND role IN ('schoolAdmin', 'institute')
    )
  );

CREATE POLICY "social_reports_update_admin"
  ON social_reports FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_profiles
      WHERE user_id = auth.uid()
      AND role IN ('schoolAdmin', 'institute')
    )
  );

-- ============================================================================
-- social_blocks
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_social_blocks_blocker
  ON social_blocks (blocker_id);

ALTER TABLE social_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_blocks_select_own"
  ON social_blocks FOR SELECT TO authenticated
  USING (blocker_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_blocks_insert_own"
  ON social_blocks FOR INSERT TO authenticated
  WITH CHECK (blocker_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_blocks_delete_own"
  ON social_blocks FOR DELETE TO authenticated
  USING (blocker_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- social_mutes
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_mutes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id   UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  muted_id   UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (muter_id, muted_id),
  CHECK (muter_id != muted_id)
);

CREATE INDEX IF NOT EXISTS idx_social_mutes_muter
  ON social_mutes (muter_id);

ALTER TABLE social_mutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_mutes_select_own"
  ON social_mutes FOR SELECT TO authenticated
  USING (muter_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_mutes_insert_own"
  ON social_mutes FOR INSERT TO authenticated
  WITH CHECK (muter_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "social_mutes_delete_own"
  ON social_mutes FOR DELETE TO authenticated
  USING (muter_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

COMMENT ON TABLE social_reports IS 'tuto.social — User-submitted reports for content/users.';
COMMENT ON TABLE social_blocks IS 'tuto.social — Blocked users. Blocked content hidden from blocker.';
COMMENT ON TABLE social_mutes IS 'tuto.social — Muted users. Muted content hidden from muter.';
