# Dev Agent 3 — Parts 5 & 6 Task Brief

**PM:** Product Manager Agent  
**Date:** 2026-03-19  
**Branch:** `tutoSocial1`  
**Assigned to:** Dev Agent 3 (new agent)  
**Supabase MCP server:** `user-supabase-tuto`  
**Test account:** `marketing@tutoglobal.com` / `password`

---

## Context — What Is Already Built

Read the progress tracker before anything else. Here is the summary:

| Part | Feature Area | Status |
|------|-------------|--------|
| 1 | Database & Auth Foundation | ✅ Complete |
| 2 | Core Feed & Posts | ✅ Complete |
| 3 | Profiles & Social Graph | ✅ Complete |
| 4 | Stories | ✅ Complete (mobile + web + edge functions + DB) |
| **5** | **Reels / Shorts** | **❌ Not Started — your job** |
| **6** | **Messaging (DMs)** | **❌ Not Started — your job** |

Do NOT touch Parts 1–4. Do NOT rebuild anything already in the codebase.

---

## Mandatory Reading Before You Write a Single Line

Read these in full — no exceptions:

1. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture, auth, RLS rules
2. `.cursor/rules/rules.tuto-social.mdc` — design system, moderation, privacy rules
3. `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` — confirm Part 4 is Complete before starting
4. `docs/prd-specs/TUTO_SOCIAL_PRD.md` — sections on Reels and Messaging only

---

## Platform Structure Reminder

| Platform | Path | Tech | Port |
|----------|------|------|------|
| Mobile App | `src/` | React Native / Expo / NativeWind | Expo |
| Social Web App | `apps/social/` | Next.js | :3001 |
| Dashboard | `apps/dashboard/` | Next.js | :3000 |

Social data: **Supabase only.** No Firebase. No Airtable for social features.

Existing Supabase client helpers:
- Server (SSR + RLS-safe): `createSupabaseServerClient()` from `apps/social/lib/supabase-server.ts`
- Browser (client components): `getSupabaseBrowserClient()` from `apps/social/lib/supabase.ts`
- Mobile: existing Supabase client in `src/services/supabase.ts` or equivalent — check before importing

---

## PART 5 — Reels / Shorts

### Session Scope (What to Build Now)

Part 5 is a large feature. This session is scoped to **Phase 1: DB + mobile viewer**. Do not attempt Phase 2 (creation flow) in the same session — it will exceed the context window.

| Phase | Scope | This Session? |
|-------|-------|---------------|
| Phase 1 | DB migration, mobile reel feed viewer, interactions, navigation | ✅ YES |
| Phase 2 | Reel creation/upload, trim/editor, sounds/music, web components | ❌ Next agent |

### Step 1 — Database Migration

Create `supabase/migrations/060_social_reels.sql` and apply it via Supabase MCP `apply_migration`.

The migration must create:

```sql
-- Reels table
CREATE TABLE IF NOT EXISTS social_reels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id         UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  school_id         UUID REFERENCES social_profiles(id),
  title             TEXT,
  description       TEXT,
  video_url         TEXT NOT NULL,
  thumbnail_url     TEXT,
  duration_seconds  INTEGER NOT NULL DEFAULT 0,
  width             INTEGER DEFAULT 1080,
  height            INTEGER DEFAULT 1920,
  subjects          TEXT[] DEFAULT '{}',
  audience          TEXT NOT NULL DEFAULT 'public'
                      CHECK (audience IN ('public','school','followers','private')),
  view_count        INTEGER NOT NULL DEFAULT 0,
  like_count        INTEGER NOT NULL DEFAULT 0,
  comment_count     INTEGER NOT NULL DEFAULT 0,
  share_count       INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
                      CHECK (moderation_status IN ('pending','ai_reviewed','parent_approved','rejected')),
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE social_reels ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved public reels
CREATE POLICY "reels_select_public" ON social_reels FOR SELECT
  USING (audience = 'public' AND moderation_status IN ('ai_reviewed','parent_approved'));

-- Authors can read their own reels regardless of status
CREATE POLICY "reels_select_own" ON social_reels FOR SELECT TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Authenticated users can insert (own profile only)
CREATE POLICY "reels_insert" ON social_reels FOR INSERT TO authenticated
  WITH CHECK (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Authors can delete their own
CREATE POLICY "reels_delete_own" ON social_reels FOR DELETE TO authenticated
  USING (author_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_social_reels_author ON social_reels(author_id);
CREATE INDEX IF NOT EXISTS idx_social_reels_school ON social_reels(school_id);
CREATE INDEX IF NOT EXISTS idx_social_reels_created ON social_reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_reels_moderation ON social_reels(moderation_status);

-- Reel likes table
CREATE TABLE IF NOT EXISTS social_reel_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id    UUID NOT NULL REFERENCES social_reels(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reel_id, profile_id)
);

ALTER TABLE social_reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reel_likes_select" ON social_reel_likes FOR SELECT USING (true);
CREATE POLICY "reel_likes_insert" ON social_reel_likes FOR INSERT TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));
CREATE POLICY "reel_likes_delete" ON social_reel_likes FOR DELETE TO authenticated
  USING (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- Auto-update like_count via trigger
CREATE OR REPLACE FUNCTION update_reel_like_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_reels SET like_count = like_count + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_reels SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reel_like_count_trigger
  AFTER INSERT OR DELETE ON social_reel_likes
  FOR EACH ROW EXECUTE FUNCTION update_reel_like_count();
```

After applying, seed 3 test reels so the screen is not empty during development:

```sql
INSERT INTO social_reels (author_id, video_url, thumbnail_url, duration_seconds, description, moderation_status, audience)
SELECT
  id,
  'https://test-videos.co.uk/vids/bigbuck/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://picsum.photos/seed/' || gen_random_uuid() || '/1080/1920',
  10,
  'Test reel by ' || display_name,
  'ai_reviewed',
  'public'
FROM social_profiles LIMIT 3;
```

### Step 2 — Mobile Service Layer

Create `src/services/social/reels.service.ts`:

```typescript
import { supabase } from '../supabase'; // use the existing mobile Supabase client

export interface Reel {
  id: string;
  authorId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  durationSeconds: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
}

export async function getReelsFeed(limit = 20): Promise<Reel[]> {
  const { data, error } = await supabase
    .from('social_reels')
    .select(`
      id, author_id, video_url, thumbnail_url, description,
      duration_seconds, like_count, comment_count, share_count, view_count,
      author:social_profiles!social_reels_author_id_fkey(
        id, username, display_name, avatar_url, role
      )
    `)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .eq('audience', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapReel);
}

export async function toggleReelLike(reelId: string, profileId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    await supabase.from('social_reel_likes').delete()
      .eq('reel_id', reelId).eq('profile_id', profileId);
  } else {
    await supabase.from('social_reel_likes').insert({ reel_id: reelId, profile_id: profileId });
  }
}

function mapReel(row: Record<string, unknown>): Reel {
  const a = (row.author as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    videoUrl: row.video_url as string,
    thumbnailUrl: row.thumbnail_url as string | undefined,
    description: row.description as string | undefined,
    durationSeconds: (row.duration_seconds as number) ?? 0,
    likeCount: (row.like_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
    shareCount: (row.share_count as number) ?? 0,
    viewCount: (row.view_count as number) ?? 0,
    isLiked: false, // resolve per-user separately if needed
    author: {
      id: a.id as string,
      username: (a.username as string) ?? '',
      displayName: (a.display_name as string) ?? 'Unknown',
      avatarUrl: a.avatar_url as string | undefined,
      role: (a.role as string) ?? 'guest',
    },
  };
}
```

### Step 3 — Mobile Components

**`src/components/social/ReelActions.tsx`**  
Side action bar (right side of screen, TikTok-style):
- Like button (heart icon) with count — optimistic toggle via `toggleReelLike`
- Comment button with count — opens a bottom sheet or navigates to comments
- Share button (uses `Share` from `react-native`)
- Author avatar (circular, tappable → navigates to profile)
- All positioned using `position: absolute`, `right: 16`
- Use `MaterialIcons` only. Sizes: 28px

**`src/components/social/ReelCard.tsx`**  
Grid thumbnail (used in profile post grid, 1/3 width):
- Show `thumbnailUrl` image (or dark placeholder if none)
- Play icon overlay (centered)
- View count bottom-left in white text
- On press → navigate to `ReelDetailScreen` with `reelId`
- Keep under 80 lines

**`src/components/social/ReelInfo.tsx`**  
Author and caption overlay (bottom of full-screen reel):
- Display name + `@username`
- Description (max 2 lines, tap to expand)
- Subjects chips if present
- Positioned absolutely at bottom-left, above `ReelActions`

### Step 4 — Mobile Screens

**`src/screens/social/ReelsScreen.tsx`**  
Full-screen vertical snap-scroll reel feed:
- `FlatList` with `pagingEnabled={true}`, `showsVerticalScrollIndicator={false}`
- Each item: `height: Dimensions.get('window').height`, full-width
- Load reels from `getReelsFeed()` on mount
- Use `onViewableItemsChanged` + `viewabilityConfig` to track which reel is currently visible
- Pass `isActive` prop to each reel item — the active reel autoplays, others pause
- Video playback via `expo-av` `Video` component: `resizeMode="cover"`, `isLooping={true}`, `shouldPlay={isActive}`
- Show `ReelInfo` (bottom overlay) and `ReelActions` (right side) on each reel
- Loading skeleton: 3 grey animated placeholder cards
- Empty state: centered text "Chưa có Reels nào" with camera icon
- Pull-to-refresh

**`src/screens/social/ReelDetailScreen.tsx`**  
Single reel view (entered from profile grid or deep link):
- Route params: `{ reelId: string }`
- Fetch single reel from Supabase by id on mount
- Same layout as one item in `ReelsScreen` (full screen, `ReelActions`, `ReelInfo`)
- Show a back button top-left (navigation header or custom overlay)
- Loading state while fetching

### Step 5 — Navigation

Open `src/navigation/SocialStack.tsx`:

1. Register `ReelsScreen` and `ReelDetailScreen` in the stack navigator
2. Add a **Reels tab** to the social bottom tab bar — use `MaterialIcons` name `"videocam"` or `"play-circle"`, label "Reels"
3. Tab order: Feed → Reels → Search → Profile
4. `ReelDetailScreen` is pushed (not a tab) — params: `{ reelId: string }`

### Part 5 — Do NOT Build in This Session

- Reel creation / upload / recording flow
- Reel editor (trim, filters)
- Sounds / music system (`SoundInfo.tsx`, `sounds.service.ts`)
- `SoundReelsScreen.tsx`
- Web components (`apps/social/` or `apps/dashboard/`) for Reels
- Supabase Edge Function `social-reels` (direct DB query is fine for Phase 1)

### Part 5 Acceptance Criteria

- [ ] `social_reels` and `social_reel_likes` tables exist in Supabase
- [ ] Reels tab appears in the social tab bar (mobile)
- [ ] `ReelsScreen` loads and displays test reels in full-screen snap feed
- [ ] Video autoplays when reel is visible; pauses when scrolled away
- [ ] Like button toggles optimistically and persists to DB
- [ ] Author name / description overlay visible on each reel
- [ ] `ReelDetailScreen` loads a single reel by ID
- [ ] Progress tracker rows updated to `In Progress` (Phase 1 complete)

---

## PART 6 — Messaging (DMs)

### Session Scope (What to Build Now)

Part 6 is also large. This session covers **Phase 1: DB + 1:1 messaging + Supabase Realtime**. Group chats, media sharing, and web components are Phase 2.

| Phase | Scope | This Session? |
|-------|-------|---------------|
| Phase 1 | DB, conversation list, 1:1 chat, real-time delivery, read receipts | ✅ YES |
| Phase 2 | Group chats, media sharing, message requests, web components | ❌ Next agent |

### Step 1 — Database Migration

Create `supabase/migrations/061_social_messaging.sql` and apply via Supabase MCP:

```sql
-- Conversations (1:1 and group)
CREATE TABLE IF NOT EXISTS social_conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL DEFAULT '1:1' CHECK (type IN ('1:1', 'group')),
  title        TEXT,                    -- group chat name (null for 1:1)
  avatar_url   TEXT,                    -- group avatar (null for 1:1)
  school_id    UUID,                    -- optional school scope
  created_by   UUID REFERENCES social_profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE social_conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE IF NOT EXISTS social_conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES social_conversations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES social_profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at    TIMESTAMPTZ,           -- for unread count
  is_muted        BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (conversation_id, profile_id)
);

ALTER TABLE social_conversation_participants ENABLE ROW LEVEL SECURITY;

-- Messages
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

-- RLS: participants can read their own conversations
CREATE POLICY "conversations_select" ON social_conversations FOR SELECT TO authenticated
  USING (id IN (
    SELECT conversation_id FROM social_conversation_participants
    WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "conversations_insert" ON social_conversations FOR INSERT TO authenticated
  WITH CHECK (created_by IN (SELECT id FROM social_profiles WHERE user_id = auth.uid()));

-- RLS: participants can read/write their own participants rows
CREATE POLICY "participants_select" ON social_conversation_participants FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    OR conversation_id IN (
      SELECT conversation_id FROM social_conversation_participants
      WHERE profile_id IN (SELECT id FROM social_profiles WHERE user_id = auth.uid())
    ));

CREATE POLICY "participants_insert" ON social_conversation_participants FOR INSERT TO authenticated
  WITH CHECK (true); -- creator inserts all participants on conversation create

-- RLS: participants can read messages in their conversations
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

-- Function to update last_message_at and preview on new message
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
```

Seed one test conversation between two seeded profiles:
```sql
-- Create a 1:1 conversation between the first two profiles
WITH profiles AS (SELECT id FROM social_profiles LIMIT 2),
     conv AS (
       INSERT INTO social_conversations (type, created_by)
       SELECT '1:1', (SELECT id FROM profiles LIMIT 1)
       RETURNING id
     )
INSERT INTO social_conversation_participants (conversation_id, profile_id)
SELECT conv.id, profiles.id FROM conv, profiles;

-- Seed a few messages
INSERT INTO social_messages (conversation_id, sender_id, content)
SELECT
  (SELECT id FROM social_conversations LIMIT 1),
  (SELECT id FROM social_profiles LIMIT 1),
  msg
FROM unnest(ARRAY['Xin chào! 👋', 'Bạn có khỏe không?', 'Tôi vừa xem bài Reels của bạn — hay lắm!']) AS msg;
```

### Step 2 — Mobile Service Layer

Create `src/services/social/conversations.service.ts`:

```typescript
import { supabase } from '../supabase';

export interface ConversationPreview {
  id: string;
  type: '1:1' | 'group';
  title?: string;
  avatarUrl?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  otherParticipant?: {  // for 1:1 only
    id: string;
    displayName: string;
    avatarUrl?: string;
    username: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  messageType: 'text' | 'image' | 'video' | 'system';
  mediaUrl?: string;
  isDeleted: boolean;
  replyToId?: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export async function getConversations(myProfileId: string): Promise<ConversationPreview[]> {
  const { data, error } = await supabase
    .from('social_conversation_participants')
    .select(`
      conversation:social_conversations(
        id, type, title, avatar_url, last_message_at, last_message_preview,
        participants:social_conversation_participants(
          profile_id, last_read_at,
          profile:social_profiles(id, display_name, avatar_url, username)
        )
      ),
      last_read_at
    `)
    .eq('profile_id', myProfileId)
    .order('conversation(last_message_at)', { ascending: false });

  if (error) throw error;
  // Map to ConversationPreview — resolve other participant for 1:1 chats
  return (data ?? []).map((row) => mapConversation(row, myProfileId));
}

export async function getMessages(conversationId: string, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('social_messages')
    .select(`
      id, conversation_id, sender_id, content, message_type, media_url,
      is_deleted, reply_to_id, created_at,
      sender:social_profiles!social_messages_sender_id_fkey(
        id, display_name, avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('social_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content, message_type: 'text' })
    .select(`
      id, conversation_id, sender_id, content, message_type, media_url,
      is_deleted, reply_to_id, created_at,
      sender:social_profiles!social_messages_sender_id_fkey(
        id, display_name, avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return mapMessage(data as Record<string, unknown>);
}

export async function markConversationRead(conversationId: string, profileId: string): Promise<void> {
  await supabase
    .from('social_conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', profileId);
}

export async function startConversation(myProfileId: string, otherProfileId: string): Promise<string> {
  // Check if 1:1 conversation already exists between these two profiles
  const { data: existing } = await supabase
    .from('social_conversation_participants')
    .select('conversation_id')
    .eq('profile_id', myProfileId);

  if (existing && existing.length > 0) {
    const myConvIds = existing.map((r: Record<string, unknown>) => r.conversation_id as string);
    const { data: shared } = await supabase
      .from('social_conversation_participants')
      .select('conversation_id')
      .eq('profile_id', otherProfileId)
      .in('conversation_id', myConvIds);

    if (shared && shared.length > 0) {
      return (shared[0] as Record<string, unknown>).conversation_id as string;
    }
  }

  // Create new conversation
  const { data: conv, error } = await supabase
    .from('social_conversations')
    .insert({ type: '1:1', created_by: myProfileId })
    .select('id')
    .single();

  if (error) throw error;
  const convId = (conv as Record<string, unknown>).id as string;

  await supabase.from('social_conversation_participants')
    .insert([
      { conversation_id: convId, profile_id: myProfileId },
      { conversation_id: convId, profile_id: otherProfileId },
    ]);

  return convId;
}

function mapConversation(row: Record<string, unknown>, myProfileId: string): ConversationPreview {
  const conv = (row.conversation as Record<string, unknown>) ?? {};
  const participants = (conv.participants as Record<string, unknown>[]) ?? [];
  const other = participants.find((p) => (p.profile_id as string) !== myProfileId);
  const otherProfile = other ? (other.profile as Record<string, unknown>) : undefined;
  const myParticipant = participants.find((p) => (p.profile_id as string) === myProfileId);
  const lastReadAt = (myParticipant?.last_read_at as string) ?? null;
  const lastMsgAt = conv.last_message_at as string | undefined;
  const unread = lastReadAt && lastMsgAt ? (new Date(lastMsgAt) > new Date(lastReadAt) ? 1 : 0) : 0;

  return {
    id: conv.id as string,
    type: (conv.type as '1:1' | 'group') ?? '1:1',
    title: conv.title as string | undefined,
    avatarUrl: conv.avatar_url as string | undefined,
    lastMessageAt: lastMsgAt,
    lastMessagePreview: conv.last_message_preview as string | undefined,
    unreadCount: unread,
    otherParticipant: otherProfile ? {
      id: otherProfile.id as string,
      displayName: (otherProfile.display_name as string) ?? 'Unknown',
      avatarUrl: otherProfile.avatar_url as string | undefined,
      username: (otherProfile.username as string) ?? '',
    } : undefined,
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  const s = (row.sender as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    content: row.content as string | undefined,
    messageType: (row.message_type as Message['messageType']) ?? 'text',
    mediaUrl: row.media_url as string | undefined,
    isDeleted: (row.is_deleted as boolean) ?? false,
    replyToId: row.reply_to_id as string | undefined,
    createdAt: row.created_at as string,
    sender: {
      id: s.id as string,
      displayName: (s.display_name as string) ?? 'Unknown',
      avatarUrl: s.avatar_url as string | undefined,
    },
  };
}
```

### Step 3 — Mobile Components

**`src/components/social/ConversationListItem.tsx`**  
Conversation row in the list:
- Other person's avatar (or group avatar)
- Their display name (bold)
- Last message preview (1 line, grey, truncated)
- Timestamp (relative: "2p", "3h", "Thứ 2") top-right
- Unread badge (blue dot) if `unreadCount > 0`
- On press → navigate to `ChatScreen` with `conversationId`

**`src/components/social/MessageBubble.tsx`**  
Individual chat message bubble:
- Own messages: right-aligned, `#0B5FFF` background, white text
- Others' messages: left-aligned, `#F0F0F0` background, dark text
- Show sender avatar + name above bubble for others' messages (only when sender changes)
- Timestamp below bubble in grey (`HH:mm`)
- Deleted messages: grey italic "Tin nhắn đã bị xóa"
- Keep under 100 lines

**`src/components/social/MessageInput.tsx`**  
Chat input bar:
- Text input (`multiline`, max 4 lines)
- Send button (enabled only when text is non-empty)
- On send: calls `sendMessage()`, clears input
- Placeholder: "Nhắn tin..."
- Stick to bottom of screen using `KeyboardAvoidingView`

### Step 4 — Mobile Screens

**`src/screens/social/ConversationsScreen.tsx`**  
DM inbox / conversation list:
- Fetch conversations via `getConversations(myProfileId)` on mount
- `FlatList` of `ConversationListItem`
- Header: "Tin nhắn" + new message button (pencil icon, top-right)
- Pencil icon → navigates to `NewMessageScreen`
- Empty state: "Chưa có tin nhắn nào. Bắt đầu trò chuyện!"
- Subscribe to Supabase Realtime on `social_conversations` filtered by participant — refresh list on `INSERT` or `UPDATE` to conversations the user is in

**`src/screens/social/ChatScreen.tsx`**  
1:1 chat view:
- Route params: `{ conversationId: string }`
- Fetch messages via `getMessages(conversationId)` on mount
- `FlatList` (inverted) of `MessageBubble` — newest at bottom
- `MessageInput` at bottom
- On mount: call `markConversationRead(conversationId, myProfileId)`
- **Supabase Realtime:** subscribe to `social_messages` where `conversation_id = conversationId` — on INSERT, append new message to the list (do NOT re-fetch all messages)
- Unsubscribe on unmount
- Header: other person's name + avatar (for 1:1) using `useNavigation().setOptions()`

**`src/screens/social/NewMessageScreen.tsx`**  
Start a new conversation:
- Search input to find users (call Supabase `social_profiles` with `.ilike('display_name', ...)`)
- Show search results as a simple list (avatar + display name + username)
- On select: call `startConversation(myProfileId, otherProfileId)` → navigate to `ChatScreen` with the returned `conversationId`

### Step 5 — Navigation

In `src/navigation/SocialStack.tsx`:

1. Add a **Messages tab** to the social bottom tab bar — `MaterialIcons` name `"chat-bubble-outline"`, label "Tin nhắn"
2. Tab order: Feed → Reels → Search → Messages → Profile
3. Register `ConversationsScreen` as the tab screen
4. Register `ChatScreen` and `NewMessageScreen` as stack screens (pushed, not tabs)
5. Show unread badge on the Messages tab icon if any conversation has `unreadCount > 0`

### Step 6 — Supabase Realtime Setup

In `ChatScreen.tsx`, set up the realtime subscription:
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'social_messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const newMsg = mapMessage(payload.new as Record<string, unknown>);
        setMessages((prev) => [...prev, newMsg]);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [conversationId]);
```

Note: the `mapMessage` function from `conversations.service.ts` won't have the nested `sender` object from realtime payloads. Handle this by fetching the sender separately or passing the current user's profile when the message is from `myProfileId`.

### Part 6 — Do NOT Build in This Session

- Group chat creation or management
- Media (image/video) in messages
- Message requests (`MessageRequestsScreen`, `MessageRequestBanner`)
- Typing indicators
- Web components (`apps/social/` or `apps/dashboard/`) for messaging
- Supabase Edge Functions for messaging (direct DB + Realtime is sufficient for Phase 1)

### Part 6 Acceptance Criteria

- [ ] `social_conversations`, `social_conversation_participants`, `social_messages` tables exist
- [ ] Messages tab appears in the social tab bar
- [ ] `ConversationsScreen` shows the seeded test conversation
- [ ] Tapping a conversation opens `ChatScreen` and shows messages
- [ ] Typing and sending a message works — message appears in the chat
- [ ] Sending from a second tab/device delivers the message in real-time (Supabase Realtime)
- [ ] `markConversationRead` is called on opening a chat (unread dot clears)
- [ ] `NewMessageScreen` lets you search and start a new 1:1 conversation
- [ ] Progress tracker rows updated to `In Progress` with Phase 1 note

---

## Mandatory Housekeeping

### After Part 5:
1. Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:
   - Reels rows → Status: `In Progress`, Notes: "Phase 1 complete — viewer + DB built; creation flow pending"
2. Fill in the Part 5 section of the Agent Report below

### After Part 6:
1. Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:
   - DM rows → Status: `In Progress`, Notes: "Phase 1 complete — 1:1 chat + realtime; group chats + media pending"
2. Fill in the Part 6 section of the Agent Report below

---

## Agent 3 Report *(fill in before closing your session)*

### Part 5 — Reels / Shorts (Phase 1)

**Date:** 2026-03-19  
**Agent Transcript ID:** *(fill from agent-transcripts folder)*  
**Status:** Complete

| Task | Result | Files Changed | Notes |
|------|--------|---------------|-------|
| Migration 060 applied | Done | supabase/migrations/060_social_reels.sql | Applied via Supabase MCP |
| Test reels seeded | Done | (in migration) | 3 reels from first 3 profiles |
| `reels.service.ts` built | Done | src/services/social/reels.service.ts | getReelsFeed, getReelById, getReelsByAuthorId, toggleReelLike |
| `ReelActions.tsx` built | Done | src/components/social/ReelActions.tsx | Like, Comment, Share, Author avatar |
| `ReelCard.tsx` built | Done | src/components/social/ReelCard.tsx | Grid thumbnail, play icon, view count |
| `ReelInfo.tsx` built | Done | src/components/social/ReelInfo.tsx | Author + description + subjects |
| `ReelsScreen.tsx` built | Done | src/screens/social/ReelsScreen.tsx | Full-screen snap feed, expo-av Video |
| `ReelDetailScreen.tsx` built | Done | src/screens/social/ReelDetailScreen.tsx | Single reel view, back button |
| Reels tab wired in navigation | Done | src/navigation/SocialTabs.tsx, SocialStack.tsx | SocialTabNavigator: Feed, Reels, Search, Messages, Profile |

**What's left for Phase 2 (creation flow):** Reel creation/upload, trim editor, sounds/music, web components

**Notes for PM:** Migration 060 applied to Supabase dev. Profile Reels tab added. ReelCard used in profile grid.

---

### Part 6 — Messaging / DMs (Phase 1)

**Date:** 2026-03-19  
**Agent Transcript ID:** *(fill from agent-transcripts folder)*  
**Status:** Complete

| Task | Result | Files Changed | Notes |
|------|--------|---------------|-------|
| Migration 061 applied | Done | supabase/migrations/061_social_messaging.sql | Applied via Supabase MCP; Realtime enabled |
| Test conversation + messages seeded | Done | (in migration) | 1:1 between first 2 profiles, 3 messages |
| `conversations.service.ts` built | Done | src/services/social/conversations.service.ts | getConversations, getMessages, sendMessage, startConversation, etc. |
| `ConversationListItem.tsx` built | Done | src/components/social/ConversationListItem.tsx | Avatar, name, preview, time, unread dot |
| `MessageBubble.tsx` built | Done | src/components/social/MessageBubble.tsx | Own/other styling, sender name, timestamp |
| `MessageInput.tsx` built | Done | src/components/social/MessageInput.tsx | Multiline input, Send button |
| `ConversationsScreen.tsx` built | Done | src/screens/social/ConversationsScreen.tsx | List, Realtime on social_conversations |
| `ChatScreen.tsx` built | Done | src/screens/social/ChatScreen.tsx | Inverted FlatList, Realtime on social_messages |
| `NewMessageScreen.tsx` built | Done | src/screens/social/NewMessageScreen.tsx | Search profiles, start 1:1 |
| Messages tab wired in navigation | Done | src/navigation/SocialTabs.tsx, SocialStack.tsx | Chat, NewMessage as stack screens |
| Supabase Realtime working in ChatScreen | Done | ChatScreen.tsx | postgres_changes on social_messages; fetchSenderProfile for payload |

**What's left for Phase 2 (group chats, media, web):** Group chat creation, media in messages, message requests, typing indicators, web components

**Notes for PM:** Migration 061 applied. social_messages added to supabase_realtime publication. participants_insert policy tightened (creator-only).

---

### PM Quick Fixes (pre-QA)

| Fix | File(s) | Change |
|-----|---------|--------|
| 1 | ReelActions.tsx | Replaced hardcoded `https://tuto.social` with `process.env.EXPO_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001'` |
| 2 | ReelsScreen.tsx | Removed unused `renderHeader` line |
| 3 | ReelsScreen.tsx | Added `// TODO Phase 2` comment on empty `onComment` handler |
| 4 | ConversationsScreen.tsx | Scoped Realtime subscription to user's own conversation IDs via `filter: id=eq.${conv.id}` per conversation |
| 5 | ChatScreen.tsx, translations | Replaced hardcoded `'Chưa có tin nhắn nào'` with `t('community.messages.empty_chat')`; added `empty_chat` key (EN + VI) |

---

## PM Decision Gate

Once both report sections are filled and the progress tracker is updated, PM will:

1. Dispatch QA agent to test the Reels tab and Messaging tab
2. If QA passes → dispatch Dev Agent 4 for Phase 2 of both Parts (creation flows, group chats, web)

---

*Document owner: PM Agent | Last updated: 2026-03-19*
