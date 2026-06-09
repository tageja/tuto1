-- Migration: 055_social_profiles_subjects.sql
-- Add subjects array to social_profiles for profile display and search

ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS subjects TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN social_profiles.subjects IS 'Subject tags for teachers/students (e.g. Math, English, Physics)';
