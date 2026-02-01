-- ============================================================================
-- Migration 036: Allow Auth user deletion from Supabase dashboard
-- ============================================================================
-- When you delete a user from Authentication > Users, Supabase deletes from
-- auth.users, which CASCADEs to public.users. Tables that reference public.users(id)
-- with ON DELETE RESTRICT block that delete. This migration changes those
-- references to ON DELETE SET NULL so user deletion succeeds; audit columns
-- (created_by, parent_user_id) become NULL when the user is removed.
--
-- If you still see "can not delete user": check Storage — users who own
-- Storage objects must have those objects deleted or ownership transferred first.
-- See: https://supabase.com/docs/guides/auth/managing-user-data
-- ============================================================================

-- message_threads.created_by
ALTER TABLE public.message_threads ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.message_threads DROP CONSTRAINT IF EXISTS message_threads_created_by_fkey;
ALTER TABLE public.message_threads
  ADD CONSTRAINT message_threads_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- school_events.created_by
ALTER TABLE public.school_events ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.school_events DROP CONSTRAINT IF EXISTS school_events_created_by_fkey;
ALTER TABLE public.school_events
  ADD CONSTRAINT school_events_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- event_registrations.parent_user_id
ALTER TABLE public.event_registrations ALTER COLUMN parent_user_id DROP NOT NULL;
ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_parent_user_id_fkey;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_parent_user_id_fkey
  FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- payment_items.created_by
ALTER TABLE public.payment_items ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.payment_items DROP CONSTRAINT IF EXISTS payment_items_created_by_fkey;
ALTER TABLE public.payment_items
  ADD CONSTRAINT payment_items_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- payment_batches.created_by
ALTER TABLE public.payment_batches ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.payment_batches DROP CONSTRAINT IF EXISTS payment_batches_created_by_fkey;
ALTER TABLE public.payment_batches
  ADD CONSTRAINT payment_batches_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- payment_intents.created_by
ALTER TABLE public.payment_intents ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.payment_intents DROP CONSTRAINT IF EXISTS payment_intents_created_by_fkey;
ALTER TABLE public.payment_intents
  ADD CONSTRAINT payment_intents_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- school_albums.created_by
ALTER TABLE public.school_albums ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.school_albums DROP CONSTRAINT IF EXISTS school_albums_created_by_fkey;
ALTER TABLE public.school_albums
  ADD CONSTRAINT school_albums_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
