-- Migration: 069_fix_participants_insert_rls.sql
-- Fix BUG-039: participants_insert RLS fails for new group conversations.
--
-- Root cause — circular dependency:
--   participants_insert checks: conversation_id IN (
--     SELECT id FROM social_conversations WHERE created_by = my_profile_id
--   )
--   But that SELECT on social_conversations is gated by conversations_select,
--   which calls get_my_conversation_ids(), which reads social_conversation_participants
--   to find conversations the user is already a participant of.
--   The creator has no row in participants yet → get_my_conversation_ids() returns empty
--   → conversations_select hides the new conversation → participants_insert fails.
--
-- Fix: SECURITY DEFINER function that checks conversation ownership
-- bypassing RLS on social_conversations entirely.

CREATE OR REPLACE FUNCTION is_my_conversation(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM social_conversations sc
    JOIN social_profiles sp ON sp.id = sc.created_by
    WHERE sc.id = conv_id
      AND sp.user_id = auth.uid()
  );
$$;

-- Drop the broken policy and replace it
DROP POLICY IF EXISTS participants_insert ON social_conversation_participants;

CREATE POLICY "participants_insert"
  ON social_conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (is_my_conversation(conversation_id));
