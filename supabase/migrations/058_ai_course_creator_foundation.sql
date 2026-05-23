-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 058: AI Course Creator Studio foundation
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add course_creator role support.
ALTER TABLE nursed_profiles
  DROP CONSTRAINT IF EXISTS nursed_profiles_role_check;

ALTER TABLE nursed_profiles
  ADD CONSTRAINT nursed_profiles_role_check
  CHECK (role IN ('learner', 'teacher', 'hospital_admin', 'super_admin', 'course_creator'));

-- 2. Add creator ownership/review fields to generated courses.
ALTER TABLE nursed_courses
  ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_draft_id uuid,
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'admin_created'
    CHECK (review_status IN ('admin_created', 'draft', 'submitted', 'approved', 'rejected', 'published')),
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_nursed_courses_creator
  ON nursed_courses(creator_id);

CREATE INDEX IF NOT EXISTS idx_nursed_courses_category
  ON nursed_courses(category_id);

CREATE INDEX IF NOT EXISTS idx_nursed_courses_review_status
  ON nursed_courses(review_status);

-- 3. Creator access applications.
CREATE TABLE IF NOT EXISTS creator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  profession text NOT NULL CHECK (char_length(profession) BETWEEN 2 AND 120),
  organisation text,
  organisation_type text CHECK (organisation_type IS NULL OR organisation_type IN ('hospital', 'university', 'company', 'independent', 'other')),
  topic_area text NOT NULL CHECK (char_length(topic_area) BETWEEN 2 AND 160),
  why_create text NOT NULL CHECK (char_length(why_create) BETWEEN 10 AND 1200),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_applications_user
  ON creator_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_creator_applications_status
  ON creator_applications(status, created_at DESC);

-- 4. Hybrid taxonomy: curated top-level categories, flexible children.
CREATE TABLE IF NOT EXISTS course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES course_categories(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  name_vi text,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_categories_parent
  ON course_categories(parent_id, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_course_categories_status
  ON course_categories(status);

ALTER TABLE nursed_courses
  ADD CONSTRAINT nursed_courses_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL
  NOT VALID;

-- 5. Creator-suggested taxonomy nodes.
CREATE TABLE IF NOT EXISTS course_category_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  suggested_path text NOT NULL CHECK (char_length(suggested_path) BETWEEN 2 AND 240),
  suggested_name text NOT NULL CHECK (char_length(suggested_name) BETWEEN 2 AND 120),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_category_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_creator
  ON course_category_suggestions(creator_id);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_status
  ON course_category_suggestions(status, created_at DESC);

-- 6. Drafts created before AI generation.
CREATE TABLE IF NOT EXISTS course_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_size text NOT NULL DEFAULT 'starter' CHECK (course_size IN ('starter', 'standard', 'full')),
  category_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  category_suggestion_id uuid REFERENCES course_category_suggestions(id) ON DELETE SET NULL,
  template_id text NOT NULL DEFAULT 'professional_communication'
    CHECK (template_id IN ('professional_communication', 'safety_procedures', 'technical_skills', 'customer_service')),
  template_version integer NOT NULL DEFAULT 1,
  intake_form jsonb NOT NULL,
  synopsis jsonb,
  chat_history jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'intake'
    CHECK (status IN ('intake', 'brainstorming', 'refining', 'approved', 'generating', 'complete', 'failed', 'submitted', 'rejected')),
  course_id uuid REFERENCES nursed_courses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_drafts_creator
  ON course_drafts(creator_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_drafts_status
  ON course_drafts(status);

-- Now that course_drafts exists, validate the soft reference from courses when possible.
ALTER TABLE nursed_courses
  ADD CONSTRAINT nursed_courses_source_draft_id_fkey
  FOREIGN KEY (source_draft_id) REFERENCES course_drafts(id) ON DELETE SET NULL
  NOT VALID;

-- 7. Media queue. Creators can generate audio; videos are request-only for super admins.
CREATE TABLE IF NOT EXISTS media_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id uuid REFERENCES nursed_courses(id) ON DELETE CASCADE,
  step_id uuid REFERENCES nursed_lesson_steps(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('video_request', 'audio_generation')),
  script text NOT NULL CHECK (char_length(script) BETWEEN 1 AND 5000),
  provider text NOT NULL DEFAULT 'manual' CHECK (provider IN ('manual', 'fish_audio', 'heygen')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed', 'cancelled')),
  provider_job_id text,
  output_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_queue_creator
  ON media_queue(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_queue_status
  ON media_queue(status, media_type);

CREATE INDEX IF NOT EXISTS idx_media_queue_step
  ON media_queue(step_id);

-- 8. Updated-at triggers.
CREATE TRIGGER creator_applications_updated_at
  BEFORE UPDATE ON creator_applications
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

CREATE TRIGGER course_categories_updated_at
  BEFORE UPDATE ON course_categories
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

CREATE TRIGGER category_suggestions_updated_at
  BEFORE UPDATE ON course_category_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

CREATE TRIGGER course_drafts_updated_at
  BEFORE UPDATE ON course_drafts
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

CREATE TRIGGER media_queue_updated_at
  BEFORE UPDATE ON media_queue
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

-- 9. RLS.
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_category_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator applications own read"
  ON creator_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "creator applications own insert"
  ON creator_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "creator applications admin all"
  ON creator_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "course categories approved read"
  ON course_categories FOR SELECT
  USING (status = 'approved');

CREATE POLICY "course categories super admin all"
  ON course_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "category suggestions creator read"
  ON course_category_suggestions FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "category suggestions creator insert"
  ON course_category_suggestions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "category suggestions admin all"
  ON course_category_suggestions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "course drafts creator all"
  ON course_drafts FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "course drafts admin all"
  ON course_drafts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "media queue creator read"
  ON media_queue FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "media queue creator audio insert"
  ON media_queue FOR INSERT
  WITH CHECK (auth.uid() = creator_id AND media_type = 'audio_generation');

CREATE POLICY "media queue admin all"
  ON media_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nursed_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 10. Seed top-level taxonomy and common child nodes.
INSERT INTO course_categories (name, name_vi, slug, sort_order) VALUES
  ('Healthcare', 'Y tế', 'healthcare', 10),
  ('University', 'Đại học', 'university', 20),
  ('IT', 'Công nghệ thông tin', 'it', 30),
  ('Manufacturing', 'Sản xuất', 'manufacturing', 40),
  ('Finance', 'Tài chính', 'finance', 50),
  ('Real Estate', 'Bất động sản', 'real-estate', 60),
  ('Consulting', 'Tư vấn', 'consulting', 70),
  ('Hospitality', 'Dịch vụ khách sạn', 'hospitality', 80)
ON CONFLICT (slug) DO NOTHING;

WITH parents AS (
  SELECT id, slug FROM course_categories WHERE parent_id IS NULL
)
INSERT INTO course_categories (parent_id, name, name_vi, slug, sort_order)
SELECT parents.id, child.name, child.name_vi, child.slug, child.sort_order
FROM parents
JOIN (
  VALUES
    ('healthcare', 'Nurse', 'Điều dưỡng', 'healthcare-nurse', 10),
    ('healthcare', 'Doctor', 'Bác sĩ', 'healthcare-doctor', 20),
    ('healthcare', 'General Healthcare', 'Y tế tổng quát', 'healthcare-general', 30),
    ('university', 'Computers', 'Máy tính', 'university-computers', 10),
    ('university', 'Engineering', 'Kỹ thuật', 'university-engineering', 20),
    ('university', 'General', 'Tổng quát', 'university-general', 30),
    ('it', 'Software', 'Phần mềm', 'it-software', 10),
    ('it', 'Support', 'Hỗ trợ kỹ thuật', 'it-support', 20),
    ('manufacturing', 'Safety', 'An toàn', 'manufacturing-safety', 10),
    ('finance', 'Accounting', 'Kế toán', 'finance-accounting', 10),
    ('real-estate', 'Sales', 'Bán hàng', 'real-estate-sales', 10),
    ('hospitality', 'Front Desk', 'Lễ tân', 'hospitality-front-desk', 10)
) AS child(parent_slug, name, name_vi, slug, sort_order)
  ON parents.slug = child.parent_slug
ON CONFLICT (slug) DO NOTHING;
