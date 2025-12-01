-- ============================================================================
-- Supabase Migration 010: Messaging summary fixes
-- - Cast unread counts to integer to match function signature
-- ============================================================================

BEGIN;

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
      (COUNT(*) FILTER (
        WHERE mr.user_id IS NULL
      ))::INTEGER AS unread_count
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

COMMIT;






