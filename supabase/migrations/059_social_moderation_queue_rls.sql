-- Migration: 059_social_moderation_queue_rls.sql
-- Fix: social_moderation_queue INSERT policy had WITH CHECK (false),
-- blocking every insert. The auto-enqueue trigger on social_posts calls
-- social_moderation_auto_enqueue() which inserts into this table on behalf
-- of the authenticated user — so RLS applies and the bad policy caused a
-- "new row violates row-level security policy" error on every post creation.

-- Drop the broken policy that blocks all inserts
DROP POLICY IF EXISTS "social_moderation_insert_service" ON social_moderation_queue;

-- Create a correct policy: allow authenticated users to insert.
-- Rows are created automatically by the DB trigger when posts are created,
-- so the trigger's security context (authenticated user) must be allowed.
CREATE POLICY "auth_users_insert_moderation_queue"
  ON social_moderation_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
