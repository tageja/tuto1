-- Migration: 068_realtime_conversations.sql
-- Enable Realtime for social_conversations so that last_message_preview
-- and last_message_at updates (written by the conversation_last_message_trigger)
-- are streamed to ConversationsScreen subscribers in real time.

ALTER PUBLICATION supabase_realtime ADD TABLE social_conversations;
