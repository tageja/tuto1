-- Migration: 066_participants_update_last_read.sql
-- Allow users to update their own last_read_at for read receipts

CREATE POLICY "participants_update_own"
  ON social_conversation_participants FOR UPDATE TO authenticated
  USING (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));
