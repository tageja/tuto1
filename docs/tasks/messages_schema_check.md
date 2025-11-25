# Messaging Schema Check – November 17, 2025

Summary of Supabase MCP introspection results prior to implementing the messaging feature.

## Tables & Columns
- `public.message_threads`: **missing** (no table found).
- `public.message_participants`: **missing**.
- `public.messages`: **exists** with legacy columns (`sender_id`, `receiver_id`, `content`, `is_read`, `created_at`, `updated_at`). Does **not** match required thread-based schema.
- `public.message_reads`: **missing**.
- `public.school_notifications`: **exists** but lacks `thread_id`, enum-style constraints for `type`/`audience_scope`, and messaging-specific indexes. RLS status unspecified (will reapply).

## Storage Buckets
- `message-attachments`: **missing** (no entry in `storage.buckets`).

## Required Follow-up
1. Add/align tables via `supabase/migrations/009_messages.sql`.
2. Create message notification trigger + summary RPC.
3. Enable/define RLS on all messaging tables.
4. Create `message-attachments` storage bucket (public for MVP).





