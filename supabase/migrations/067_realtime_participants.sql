-- Migration: 067_realtime_participants.sql
-- Enable Realtime for social_conversation_participants so that
-- read receipt updates (last_read_at) are streamed to ChatScreen in real time.
-- Migration 061 added social_messages but missed this table.

ALTER PUBLICATION supabase_realtime ADD TABLE social_conversation_participants;
