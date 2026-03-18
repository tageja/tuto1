-- Add contact fields to kiddihub_schools
ALTER TABLE kiddihub_schools
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS email        TEXT,
  ADD COLUMN IF NOT EXISTS website      TEXT,
  ADD COLUMN IF NOT EXISTS claimed      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_at   TIMESTAMPTZ;

-- Index for claim lookups
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_claimed ON kiddihub_schools(claimed);

-- Table for school claim requests (pending review)
CREATE TABLE IF NOT EXISTS school_claim_requests (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id       UUID REFERENCES kiddihub_schools(id) ON DELETE CASCADE,
  school_name     TEXT NOT NULL,
  school_slug     TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  contact_role    TEXT,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  school_phone    TEXT,
  school_email    TEXT,
  school_website  TEXT,
  message         TEXT,
  status          TEXT DEFAULT 'pending',  -- pending | approved | rejected
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE school_claim_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a claim
CREATE POLICY "Anyone can submit claim"
  ON school_claim_requests FOR INSERT
  WITH CHECK (true);

-- Only service role can read/update claims
CREATE POLICY "Service role manages claims"
  ON school_claim_requests FOR ALL
  USING (auth.role() = 'service_role');
