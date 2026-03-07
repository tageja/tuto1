-- ============================================================
-- NurseEd: Nurse English Upskilling Platform
-- Migration 041
-- ============================================================

-- ─── Hospitals ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_hospitals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  name_vi     text,
  city        text,
  contact_email text,
  plan        text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Courses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  title_vi        text,
  description     text,
  description_vi  text,
  level           text NOT NULL DEFAULT 'A1' CHECK (level IN ('A1','A2','B1','B2')),
  cover_image_url text,
  published       boolean NOT NULL DEFAULT false,
  hospital_id     uuid REFERENCES nursed_hospitals(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Modules ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_modules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       uuid NOT NULL REFERENCES nursed_courses(id) ON DELETE CASCADE,
  title           text NOT NULL,
  title_vi        text,
  description     text,
  description_vi  text,
  order_index     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Lessons ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_lessons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   uuid NOT NULL REFERENCES nursed_modules(id) ON DELETE CASCADE,
  title       text NOT NULL,
  title_vi    text,
  description text,
  est_minutes integer NOT NULL DEFAULT 15,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Lesson Steps (Engine) ────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_lesson_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN (
    'video','audio_shadow','script_read','cloze','no_script',
    'recording_submit','quiz','mission'
  )),
  title       text,
  order_index integer NOT NULL DEFAULT 0,
  config      jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Content Assets ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_content_assets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        uuid REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  step_id          uuid REFERENCES nursed_lesson_steps(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('audio','video','image','pdf')),
  storage_path     text NOT NULL,
  public_url       text,
  filename         text NOT NULL,
  duration_seconds integer,
  transcript_en    text,
  transcript_vi    text,
  speed_tag        text CHECK (speed_tag IN ('slow','normal','fast')),
  accent_tag       text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── Scripts (Dialogues) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_scripts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  step_id     uuid REFERENCES nursed_lesson_steps(id) ON DELETE SET NULL,
  role        text NOT NULL DEFAULT 'nurse' CHECK (role IN ('nurse','patient','narrator')),
  text_full   text NOT NULL,
  text_cloze  jsonb NOT NULL DEFAULT '[]',
  hints       jsonb NOT NULL DEFAULT '[]',
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Quiz Questions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_quiz_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  step_id         uuid REFERENCES nursed_lesson_steps(id) ON DELETE SET NULL,
  type            text NOT NULL CHECK (type IN ('mcq','match','fill_blank','listening_mcq','order')),
  prompt_en       text NOT NULL,
  prompt_vi       text,
  options         jsonb NOT NULL DEFAULT '[]',
  answer          jsonb NOT NULL DEFAULT '[]',
  audio_asset_id  uuid REFERENCES nursed_content_assets(id) ON DELETE SET NULL,
  explanation_en  text,
  explanation_vi  text,
  order_index     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Enrollments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    uuid NOT NULL REFERENCES nursed_courses(id) ON DELETE CASCADE,
  hospital_id  uuid REFERENCES nursed_hospitals(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  enrolled_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- ─── Progress ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id           uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  current_step_index  integer NOT NULL DEFAULT 0,
  completion_pct      numeric(5,2) NOT NULL DEFAULT 0,
  completed           boolean NOT NULL DEFAULT false,
  streak_days         integer NOT NULL DEFAULT 0,
  last_active         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ─── Submissions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id        uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  step_id          uuid NOT NULL REFERENCES nursed_lesson_steps(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('recording','quiz','mission')),
  storage_path     text,
  transcript       text,
  keyword_score    numeric(5,2),
  quiz_score       numeric(5,2),
  rubric           jsonb,
  pair_session_id  uuid,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── Pair Groups ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_pair_groups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  uuid REFERENCES nursed_hospitals(id) ON DELETE SET NULL,
  join_code    text NOT NULL UNIQUE,
  name         text,
  max_size     integer NOT NULL DEFAULT 3,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── Pair Group Members ───────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_pair_members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_group_id  uuid NOT NULL REFERENCES nursed_pair_groups(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pair_group_id, user_id)
);

-- ─── Pair Sessions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_pair_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_group_id    uuid NOT NULL REFERENCES nursed_pair_groups(id) ON DELETE CASCADE,
  lesson_id        uuid NOT NULL REFERENCES nursed_lessons(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  recording_path   text,
  notes            text,
  created_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── Rewards ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nursed_rewards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  name_vi      text,
  description  text,
  icon         text,
  points       integer NOT NULL DEFAULT 10,
  rule_type    text NOT NULL CHECK (rule_type IN ('lesson_complete','streak','recording','quiz_score','pair_session')),
  rule_config  jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nursed_user_rewards (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id  uuid NOT NULL REFERENCES nursed_rewards(id) ON DELETE CASCADE,
  points     integer NOT NULL DEFAULT 0,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_id)
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_nursed_modules_course ON nursed_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_nursed_lessons_module ON nursed_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_nursed_steps_lesson ON nursed_lesson_steps(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_nursed_assets_lesson ON nursed_content_assets(lesson_id);
CREATE INDEX IF NOT EXISTS idx_nursed_assets_step ON nursed_content_assets(step_id);
CREATE INDEX IF NOT EXISTS idx_nursed_scripts_lesson ON nursed_scripts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_nursed_quiz_lesson ON nursed_quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_nursed_progress_user ON nursed_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_nursed_progress_lesson ON nursed_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_nursed_submissions_user ON nursed_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_nursed_submissions_step ON nursed_submissions(step_id);
CREATE INDEX IF NOT EXISTS idx_nursed_pair_code ON nursed_pair_groups(join_code);

-- ─── Updated_at trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_nursed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nursed_courses_updated_at
  BEFORE UPDATE ON nursed_courses
  FOR EACH ROW EXECUTE FUNCTION update_nursed_updated_at();

-- ─── Storage Bucket ───────────────────────────────────────
-- Run this separately via Supabase dashboard or CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('nursed-assets', 'nursed-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- ─── RLS Policies ─────────────────────────────────────────
-- Enable RLS (using permissive policies for MVP — no auth requirement yet)

ALTER TABLE nursed_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_pair_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_pair_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_pair_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursed_user_rewards ENABLE ROW LEVEL SECURITY;

-- MVP: Allow all reads (content is public, auth added later)
CREATE POLICY "nursed_public_read_hospitals" ON nursed_hospitals FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_courses" ON nursed_courses FOR SELECT USING (published = true);
CREATE POLICY "nursed_public_read_modules" ON nursed_modules FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_lessons" ON nursed_lessons FOR SELECT USING (published = true);
CREATE POLICY "nursed_public_read_steps" ON nursed_lesson_steps FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_assets" ON nursed_content_assets FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_scripts" ON nursed_scripts FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_quiz" ON nursed_quiz_questions FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_rewards" ON nursed_rewards FOR SELECT USING (true);
CREATE POLICY "nursed_public_read_pair_groups" ON nursed_pair_groups FOR SELECT USING (active = true);

-- Service role can do everything (used by API routes)
CREATE POLICY "nursed_service_all_hospitals" ON nursed_hospitals FOR ALL USING (true);
CREATE POLICY "nursed_service_all_courses" ON nursed_courses FOR ALL USING (true);
CREATE POLICY "nursed_service_all_modules" ON nursed_modules FOR ALL USING (true);
CREATE POLICY "nursed_service_all_lessons" ON nursed_lessons FOR ALL USING (true);
CREATE POLICY "nursed_service_all_steps" ON nursed_lesson_steps FOR ALL USING (true);
CREATE POLICY "nursed_service_all_assets" ON nursed_content_assets FOR ALL USING (true);
CREATE POLICY "nursed_service_all_scripts" ON nursed_scripts FOR ALL USING (true);
CREATE POLICY "nursed_service_all_quiz" ON nursed_quiz_questions FOR ALL USING (true);
CREATE POLICY "nursed_service_all_enrollments" ON nursed_enrollments FOR ALL USING (true);
CREATE POLICY "nursed_service_all_progress" ON nursed_progress FOR ALL USING (true);
CREATE POLICY "nursed_service_all_submissions" ON nursed_submissions FOR ALL USING (true);
CREATE POLICY "nursed_service_all_pair_groups" ON nursed_pair_groups FOR ALL USING (true);
CREATE POLICY "nursed_service_all_pair_members" ON nursed_pair_members FOR ALL USING (true);
CREATE POLICY "nursed_service_all_pair_sessions" ON nursed_pair_sessions FOR ALL USING (true);
CREATE POLICY "nursed_service_all_rewards" ON nursed_rewards FOR ALL USING (true);
CREATE POLICY "nursed_service_all_user_rewards" ON nursed_user_rewards FOR ALL USING (true);

-- ─── Seed Data: Default Rewards ───────────────────────────
INSERT INTO nursed_rewards (name, name_vi, description, icon, points, rule_type, rule_config) VALUES
  ('Bài học đầu tiên', 'First Lesson', 'Complete your first lesson', '🎯', 10, 'lesson_complete', '{"count": 1}'),
  ('3 ngày liên tục', '3-Day Streak', 'Practice 3 days in a row', '🔥', 30, 'streak', '{"days": 3}'),
  ('7 ngày liên tục', '7-Day Streak', 'Practice 7 days in a row', '🔥', 70, 'streak', '{"days": 7}'),
  ('Ghi âm đầu tiên', 'First Recording', 'Submit your first voice recording', '🎤', 20, 'recording', '{"count": 1}'),
  ('Điểm cao', 'High Score', 'Score 90%+ on a quiz', '⭐', 25, 'quiz_score', '{"min_score": 90}'),
  ('Luyện tập nhóm', 'Pair Practice', 'Complete a pair practice session', '👥', 40, 'pair_session', '{"count": 1}')
ON CONFLICT DO NOTHING;
