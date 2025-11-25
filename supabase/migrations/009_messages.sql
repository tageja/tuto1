-- ============================================================================
-- Supabase Migration 009: Messaging Threads, Messages & Notifications Refresh
-- Description: Introduces thread-based messaging schema, read receipts,
--              summary RPC, notification trigger, and storage bucket.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Rename legacy messages table (if schema mismatch) to preserve historical rows
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'messages'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'thread_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.messages RENAME TO legacy_messages_20251117';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Core messaging tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal','High','N/A')),
  class_id UUID NULL REFERENCES public.school_classes(id) ON DELETE SET NULL,
  grade TEXT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mt_school_updated ON public.message_threads (school_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.message_participants (
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin','Teacher','Parent')),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mp_user ON public.message_participants (user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::JSONB,
  client_message_id UUID NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_client_id ON public.messages (client_message_id) WHERE client_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_msg_thread_sent ON public.messages (thread_id, sent_at ASC);

CREATE TABLE IF NOT EXISTS public.message_reads (
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mreads_message ON public.message_reads (message_id);
CREATE INDEX IF NOT EXISTS idx_mreads_user ON public.message_reads (user_id);

-- ---------------------------------------------------------------------------
-- School notifications adjustments (reuse for messaging)
-- ---------------------------------------------------------------------------
ALTER TABLE public.school_notifications
  ADD COLUMN IF NOT EXISTS thread_id UUID;

ALTER TABLE public.school_notifications
  DROP CONSTRAINT IF EXISTS school_notifications_type_check;

ALTER TABLE public.school_notifications
  ADD CONSTRAINT school_notifications_type_check CHECK (type IN ('message','announcement'));

ALTER TABLE public.school_notifications
  DROP CONSTRAINT IF EXISTS school_notifications_audience_scope_check;

ALTER TABLE public.school_notifications
  ADD CONSTRAINT school_notifications_audience_scope_check CHECK (audience_scope IN ('School','Classes','Users'));

-- Maintain ordering/index for notifications
CREATE INDEX IF NOT EXISTS idx_snotif_school ON public.school_notifications (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snotif_type_ref ON public.school_notifications (type, ref_id);

-- ---------------------------------------------------------------------------
-- Updated-at trigger for threads (reuse global helper)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_mt_touch ON public.message_threads;
CREATE TRIGGER trg_mt_touch
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger to enqueue notifications for new messages
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enqueue_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_thread RECORD;
BEGIN
  SELECT id, school_id, subject INTO v_thread
  FROM public.message_threads
  WHERE id = NEW.thread_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.school_notifications (school_id, type, ref_id, thread_id, title, audience_scope, class_ids)
  SELECT
    v_thread.school_id,
    'message',
    NEW.id,
    NEW.thread_id,
    v_thread.subject,
    'Users',
    NULL
  FROM public.message_participants mp
  WHERE mp.thread_id = NEW.thread_id
    AND mp.user_id <> NEW.sender_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_notification ON public.messages;
CREATE TRIGGER trg_messages_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_message_notification();

-- ---------------------------------------------------------------------------
-- RPC: get_message_threads_summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_message_threads_summary(
  p_user_auth_id UUID DEFAULT NULL,
  p_school_id UUID DEFAULT NULL,
  p_class_id UUID DEFAULT NULL,
  p_grade TEXT DEFAULT NULL
)
RETURNS TABLE (
  thread JSONB,
  last_message JSONB,
  unread_count INTEGER,
  participant_role TEXT,
  is_archived BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_auth_id UUID;
  v_user_id UUID;
BEGIN
  v_auth_id := COALESCE(p_user_auth_id, auth.uid());

  IF v_auth_id IS NULL THEN
    RETURN;
  END IF;

  SELECT id INTO v_user_id
  FROM public.users
  WHERE auth_user_id = v_auth_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claim.sub', v_auth_id::text, true);

  RETURN QUERY
  WITH scoped_participants AS (
    SELECT
      mt.id,
      mt.school_id,
      mt.subject,
      mt.priority,
      mt.class_id,
      mt.grade,
      mt.created_by,
      mt.created_at,
      mt.updated_at,
      mp.role,
      mp.is_archived
    FROM public.message_threads mt
    JOIN public.message_participants mp
      ON mp.thread_id = mt.id AND mp.user_id = v_user_id
    WHERE mt.school_id = ANY(get_user_school_ids())
      AND (p_school_id IS NULL OR mt.school_id = p_school_id)
      AND (p_class_id IS NULL OR mt.class_id = p_class_id)
      AND (p_grade IS NULL OR mt.grade = p_grade)
  ),
  last_messages AS (
    SELECT DISTINCT ON (thread_id)
      thread_id,
      id,
      sender_id,
      body,
      attachments,
      sent_at
    FROM public.messages
    ORDER BY thread_id, sent_at DESC
  ),
  unread AS (
    SELECT
      m.thread_id,
      COUNT(*) FILTER (
        WHERE mr.user_id IS NULL
      ) AS unread_count
    FROM public.messages m
    JOIN scoped_participants sp ON sp.id = m.thread_id
    LEFT JOIN public.message_reads mr
      ON mr.message_id = m.id
      AND mr.user_id = v_user_id
    GROUP BY m.thread_id
  )
  SELECT
    jsonb_build_object(
      'id', sp.id,
      'school_id', sp.school_id,
      'subject', sp.subject,
      'priority', sp.priority,
      'class_id', sp.class_id,
      'grade', sp.grade,
      'created_by', sp.created_by,
      'created_at', sp.created_at,
      'updated_at', sp.updated_at
    ) AS thread,
    jsonb_build_object(
      'id', lm.id,
      'sender_id', lm.sender_id,
      'body', lm.body,
      'attachments', COALESCE(lm.attachments, '[]'::JSONB),
      'sent_at', lm.sent_at
    ) AS last_message,
    COALESCE(unread.unread_count, 0) AS unread_count,
    sp.role AS participant_role,
    sp.is_archived
  FROM scoped_participants sp
  LEFT JOIN last_messages lm ON lm.thread_id = sp.id
  LEFT JOIN unread ON unread.thread_id = sp.id
  ORDER BY sp.updated_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_message_threads_summary(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_message_threads_summary(UUID, UUID, UUID, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket for message attachments
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
SELECT 'message-attachments', 'message-attachments', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'message-attachments'
);

-- ---------------------------------------------------------------------------
-- Row Level Security & Policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_notifications ENABLE ROW LEVEL SECURITY;

-- Helper expression for current user's DB ID
CREATE OR REPLACE FUNCTION public.current_user_db_id()
RETURNS UUID
LANGUAGE sql
AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1
$$;

-- message_threads policies
DROP POLICY IF EXISTS mt_select ON public.message_threads;
CREATE POLICY mt_select ON public.message_threads
FOR SELECT
USING (
  school_id = ANY(get_user_school_ids())
  AND (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.message_participants p
      WHERE p.thread_id = message_threads.id
        AND p.user_id = public.current_user_db_id()
    )
  )
);

DROP POLICY IF EXISTS mt_write_admin ON public.message_threads;
CREATE POLICY mt_write_admin ON public.message_threads
FOR ALL
USING (
  school_id = ANY(get_user_school_ids()) AND is_admin()
) WITH CHECK (
  school_id = ANY(get_user_school_ids()) AND is_admin()
);

-- message_participants policies
DROP POLICY IF EXISTS mp_select ON public.message_participants;
CREATE POLICY mp_select ON public.message_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.message_threads t
    WHERE t.id = message_participants.thread_id
      AND t.school_id = ANY(get_user_school_ids())
  )
);

DROP POLICY IF EXISTS mp_upsert ON public.message_participants;
CREATE POLICY mp_upsert ON public.message_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.message_threads t
    WHERE t.id = message_participants.thread_id
      AND t.school_id = ANY(get_user_school_ids())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.message_threads t
    WHERE t.id = message_participants.thread_id
      AND t.school_id = ANY(get_user_school_ids())
  )
);

-- messages policies
DROP POLICY IF EXISTS m_select ON public.messages;
CREATE POLICY m_select ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.message_participants p
    JOIN public.message_threads t ON t.id = p.thread_id
    WHERE p.thread_id = public.messages.thread_id
      AND p.user_id = public.current_user_db_id()
      AND t.school_id = ANY(get_user_school_ids())
  )
);

DROP POLICY IF EXISTS m_insert ON public.messages;
CREATE POLICY m_insert ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.message_participants p
    JOIN public.message_threads t ON t.id = p.thread_id
    WHERE p.thread_id = public.messages.thread_id
      AND p.user_id = public.current_user_db_id()
      AND t.school_id = ANY(get_user_school_ids())
  )
);

-- message_reads policies
DROP POLICY IF EXISTS mr_select ON public.message_reads;
CREATE POLICY mr_select ON public.message_reads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN public.message_threads t ON t.id = m.thread_id
    WHERE m.id = message_reads.message_id
      AND t.school_id = ANY(get_user_school_ids())
  )
);

DROP POLICY IF EXISTS mr_upsert ON public.message_reads;
CREATE POLICY mr_upsert ON public.message_reads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN public.message_threads t ON t.id = m.thread_id
    WHERE m.id = message_reads.message_id
      AND t.school_id = ANY(get_user_school_ids())
  )
);

-- school_notifications policies (reuse / ensure latest logic)
DROP POLICY IF EXISTS notif_select ON public.school_notifications;
CREATE POLICY notif_select ON public.school_notifications
FOR SELECT
USING (
  school_id = ANY(get_user_school_ids())
);

DROP POLICY IF EXISTS notif_insert_admin ON public.school_notifications;
CREATE POLICY notif_insert_admin ON public.school_notifications
FOR INSERT
WITH CHECK (
  school_id = ANY(get_user_school_ids()) AND is_admin()
);

COMMIT;

