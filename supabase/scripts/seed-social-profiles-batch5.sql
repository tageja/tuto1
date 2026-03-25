-- Seed social_profiles for Batch 5 testing
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- Ensures tarun_apollo, tarun_tuto, test_8z6r exist with correct roles and post counts

-- 1. Insert/upsert the 3 required profiles
-- Uses author_ids from social_posts so posts stay linked; links to auth.users by email
INSERT INTO social_profiles (id, user_id, username, display_name, bio, role, is_verified, follower_count, following_count, post_count, shield_count, settings)
SELECT
  'fe256d14-a39e-4416-996a-26637904bfba',
  (SELECT id FROM auth.users WHERE email = 'tarun.tageja@apollo.edu.vn' LIMIT 1),
  'tarun_apollo',
  'Tarun (Apollo)',
  'English teacher at Apollo Centre. Making learning fun.',
  'teacher',
  true,
  0, 0, 1, 0,
  '{}'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'tarun.tageja@apollo.edu.vn')
ON CONFLICT (username) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role, is_verified = EXCLUDED.is_verified, post_count = 1, updated_at = NOW();

INSERT INTO social_profiles (id, user_id, username, display_name, bio, role, is_verified, follower_count, following_count, post_count, shield_count, settings)
SELECT
  '38641c46-e315-4bb9-a184-2f1a767e123e',
  (SELECT id FROM auth.users WHERE email = 'tarun.tageja@outlook.com' LIMIT 1),
  'tarun_tuto',
  'Tarun Tageja',
  NULL,
  'schoolAdmin',
  false,
  0, 0, 5, 0,
  '{}'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'tarun.tageja@outlook.com')
ON CONFLICT (username) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role, post_count = 5, updated_at = NOW();

INSERT INTO social_profiles (id, user_id, username, display_name, bio, role, is_verified, follower_count, following_count, post_count, shield_count, settings)
SELECT
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'marketing@tutoglobal.com' LIMIT 1),
  'test_8z6r',
  'Test User',
  NULL,
  'parent',
  false,
  0, 0, 0, 0,
  '{}'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'marketing@tutoglobal.com')
ON CONFLICT (username) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role, updated_at = NOW();

-- 2. Sync post_count from social_posts
UPDATE social_profiles
SET post_count = (SELECT COUNT(*) FROM social_posts WHERE author_id = social_profiles.id)
WHERE username IN ('tarun_apollo', 'tarun_tuto', 'test_8z6r');

-- 3. Verify: must return exactly 3 rows
SELECT username, role, post_count FROM social_profiles
WHERE username IN ('tarun_apollo', 'tarun_tuto', 'test_8z6r');
