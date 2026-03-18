-- Migration 044: Schools/Kindergartens directory (scraped from kiddihub.com)
-- Stores kindergartens, language centers, schools across Vietnam

CREATE TABLE IF NOT EXISTS kiddihub_schools (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kiddihub_id           INTEGER UNIQUE NOT NULL,   -- kiddihub's own ID
  slug                  TEXT UNIQUE NOT NULL,
  kiddihub_url          TEXT,
  name                  TEXT NOT NULL,
  short_name            TEXT,

  -- Location
  address               TEXT,
  province              TEXT,
  province_slug         TEXT,

  -- School info
  school_type           INTEGER,                   -- 1=private, 3=bilingual, 4=international
  category              TEXT DEFAULT 'mam-non',
  age_from_months       INTEGER,
  age_to_months         INTEGER,
  age_range             TEXT,
  status                INTEGER DEFAULT 1,

  -- Tuition (VND)
  tuition_min           INTEGER,
  tuition_max           INTEGER,
  tuition_unit          TEXT DEFAULT 'tháng',

  -- Quality signals
  rating                NUMERIC(4,2),
  review_count          INTEGER DEFAULT 0,
  recommend_count       INTEGER DEFAULT 0,
  advice_request_count  INTEGER DEFAULT 0,
  verified              BOOLEAN DEFAULT false,
  member                BOOLEAN DEFAULT false,
  refund_commitment     BOOLEAN DEFAULT false,

  -- Images
  banner_lg             TEXT,
  banner_md             TEXT,
  banner_xs             TEXT,
  avatar_origin         TEXT,
  avatar_lg             TEXT,

  -- Features / programs
  criteria_ids          INTEGER[],
  has_promotions        BOOLEAN DEFAULT false,

  -- Publishing
  published             BOOLEAN DEFAULT false,
  featured              BOOLEAN DEFAULT false,

  -- Meta
  source                TEXT DEFAULT 'kiddihub',
  scraped_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_province    ON kiddihub_schools(province_slug);
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_category    ON kiddihub_schools(category);
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_published   ON kiddihub_schools(published);
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_rating      ON kiddihub_schools(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_featured    ON kiddihub_schools(featured);
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_tuition_min ON kiddihub_schools(tuition_min);

-- Full-text search on name + address
CREATE INDEX IF NOT EXISTS idx_kiddihub_schools_fts
  ON kiddihub_schools USING gin(
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(address,''))
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_kiddihub_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kiddihub_schools_updated_at
  BEFORE UPDATE ON kiddihub_schools
  FOR EACH ROW EXECUTE FUNCTION update_kiddihub_schools_updated_at();

-- RLS: public can read published; service role has full access
ALTER TABLE kiddihub_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published schools"
  ON kiddihub_schools FOR SELECT USING (published = true);

CREATE POLICY "Service role full access on schools"
  ON kiddihub_schools FOR ALL USING (auth.role() = 'service_role');
