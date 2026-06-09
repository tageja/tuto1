-- Migration: 061_social_messaging.sql
-- 1:1 Messaging with Supabase Realtime

-- ============================================================================
-- social_conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_conversations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type               TEXT NOT NULL DEFAULT '1:1' CHECK (type IN ('1:1', 'group')),
  title              TEXT,
  avatar_url         TEXT,
  school_id          UUID,
  created_by         UUID REFERENCES social_profiles(id) ON DELETE SET NULL,
  last_message_at    TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE social_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- social_conversation_participants (create before conversation policies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES social_conversations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at    TIMESTAMPTZ,
  is_muted        BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (conversation_id, profile_id)
);

ALTER TABLE social_conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select" ON social_conversation_participants FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    OR conversation_id IN (
      SELECT conversation_id FROM social_conversation_participants
      WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    ));

CREATE POLICY "participants_insert" ON social_conversation_participants FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM social_conversations
    WHERE created_by IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  ));

-- Conversations RLS (after participants table exists)
CREATE POLICY "conversations_select" ON social_conversations FOR SELECT TO authenticated
  USING (id IN (
    SELECT conversation_id FROM social_conversation_participants
    WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "conversations_insert" ON social_conversations FOR INSERT TO authenticated
  WITH CHECK (created_by IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- social_messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES social_conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  content         TEXT,
  message_type    TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','video','system')),
  media_url       TEXT,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  reply_to_id     UUID REFERENCES social_messages(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE social_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON social_messages FOR SELECT TO authenticated
  USING (conversation_id IN (
    SELECT conversation_id FROM social_conversation_participants
    WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "messages_insert" ON social_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    AND conversation_id IN (
      SELECT conversation_id FROM social_conversation_participants
      WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "messages_update_own" ON social_messages FOR UPDATE TO authenticated
  USING (sender_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON social_conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_participants_profile ON social_conversation_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON social_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON social_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON social_messages(sender_id);

-- Trigger: update last_message_at and preview on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE social_conversations
  SET
    last_message_at      = NEW.created_at,
    last_message_preview = LEFT(COALESCE(NEW.content, '[Media]'), 80)
  WHERE id = NEW.conversation_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER conversation_last_message_trigger
  AFTER INSERT ON social_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Enable Realtime for social_messages
ALTER PUBLICATION supabase_realtime ADD TABLE social_messages;

-- Seed: 1:1 conversation between first two profiles
DO $$
DECLARE
  conv_id UUID;
  p1_id UUID;
  p2_id UUID;
BEGIN
  SELECT id INTO p1_id FROM social_profiles ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO p2_id FROM social_profiles ORDER BY created_at ASC OFFSET 1 LIMIT 1;
  IF p1_id IS NOT NULL AND p2_id IS NOT NULL THEN
    INSERT INTO social_conversations (type, created_by) VALUES ('1:1', p1_id) RETURNING id INTO conv_id;
    INSERT INTO social_conversation_participants (conversation_id, profile_id) VALUES (conv_id, p1_id);
    INSERT INTO social_conversation_participants (conversation_id, profile_id) VALUES (conv_id, p2_id);
    INSERT INTO social_messages (conversation_id, sender_id, content) VALUES
      (conv_id, p1_id, 'Xin chào! 👋'),
      (conv_id, p1_id, 'Bạn có khỏe không?'),
      (conv_id, p1_id, 'Tôi vừa xem bài Reels của bạn — hay lắm!');
  END IF;
END;
$$;
