# Dev Agent 11 — Web Sprint 3: Messaging + Settings (Blocked/Muted)

**Prepared:** 2026-03-21  
**Agent role:** Next.js Engineer  
**Platform:** `apps/social/` (tuto.social web — Next.js App Router)  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)  
**Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules
3. `apps/social/app/(main)/notifications/page.tsx` + `NotificationsClient.tsx` — canonical server + client split pattern
4. `apps/social/components/layout/Header.tsx` — where to add nav/dropdown links
5. `src/services/social/conversations.service.ts` — mobile service to understand DB schema and query patterns (**do not import from here — reference only**)

---

## Codebase Orientation

**Server components:** `createSupabaseServerClient()` from `apps/social/lib/supabase-server.ts`  
**Client components:** `getSupabaseBrowserClient()` from `apps/social/lib/supabase.ts` + `useAuth()` from `@/contexts/AuthContext`  
**Design tokens:** `text-primary` (#0B5FFF), `bg-surface`, `rounded-card`, `text-text-primary`, `text-text-secondary`  
**UI components available:** `components/ui/Avatar.tsx`, `components/ui/Button.tsx`, `components/profile/FollowButton.tsx`  
**Do NOT touch:** `src/` (mobile) or `apps/dashboard/`

---

## DB Tables Reference (all verified live in Supabase)

```
social_conversations       — id, type ('1:1'|'group'), title, avatar_url, last_message_at, last_message_preview
social_conversation_participants — conversation_id, profile_id, last_read_at
social_messages            — id, conversation_id, sender_id, content, message_type, is_deleted, created_at
social_blocks              — id, blocker_id, blocked_id, created_at
social_mutes               — id, muter_id, muted_id, created_at
social_profiles            — id, user_id, username, display_name, avatar_url, role
```

**Important:** `social_conversation_participants.profile_id` is the `social_profiles.id` (NOT `auth.users.id`). Always resolve `auth.users.id → social_profiles.id` first.

---

## Task 1 — Settings Page (`/settings`)

This is the simpler task — build it first.

### Route structure
```
apps/social/app/(main)/settings/
├── page.tsx              ← server component: auth check + fetch blocked/muted lists
└── SettingsClient.tsx    ← client component: tabs + unblock/unmute actions
```

### Server component (`page.tsx`)

```typescript
export const metadata = { title: 'Cài đặt | tuto.social' };

// Auth check → redirect('/login') if no user
// Resolve: auth user.id → social_profiles.id (myProfileId)
// Fetch blocked users:
const { data: blockedRows } = await supabase
  .from('social_blocks')
  .select('blocked_id, blocked:social_profiles!social_blocks_blocked_id_fkey(id, username, display_name, avatar_url)')
  .eq('blocker_id', myProfileId);

// Fetch muted users:
const { data: mutedRows } = await supabase
  .from('social_mutes')
  .select('muted_id, muted:social_profiles!social_mutes_muted_id_fkey(id, username, display_name, avatar_url)')
  .eq('muter_id', myProfileId);
```

> **Note:** If the foreign key alias doesn't work, join manually with `.in('id', blockedIds)` on `social_profiles`.

Pass mapped arrays to `SettingsClient`.

### Client component (`SettingsClient.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│ Cài đặt                             │
├─ [Người dùng bị chặn] [Bị tắt tiếng] ─┤  ← tab bar
│                                     │
│  [Avatar] Display Name  @username   │
│                        [Bỏ chặn]   │  ← per row
│                                     │
│  Empty: "Bạn chưa chặn ai"         │
└─────────────────────────────────────┘
```

**Unblock action:**
```typescript
await supabase.from('social_blocks').delete()
  .eq('blocker_id', myProfileId).eq('blocked_id', userId);
// Optimistically remove from local state
```

**Unmute action:**
```typescript
await supabase.from('social_mutes').delete()
  .eq('muter_id', myProfileId).eq('muted_id', userId);
```

Both use `getSupabaseBrowserClient()`.

### Header wiring

**`apps/social/components/layout/Header.tsx`** — add to user dropdown (below "Tổng quan sáng tạo"):
```tsx
<Link href="/settings" ...>Cài đặt</Link>
```

---

## Task 2 — Messaging (`/messages`)

This is the main task. Use a **two-panel layout** (WhatsApp Web style): conversation list on left, chat on right.

### Route structure
```
apps/social/app/(main)/messages/
├── layout.tsx                        ← two-panel shell + ConversationList on left
├── page.tsx                          ← right panel empty state ("Chọn cuộc trò chuyện")
└── [conversationId]/
    └── page.tsx                      ← right panel: ChatView (auth check + initial messages SSR)
```

### 2a. Layout file (`layout.tsx`)

Server component. Auth check — redirect to `/login` if not authenticated. Resolves `myProfileId`.

```tsx
// layout.tsx
import ConversationList from './ConversationList';  // client component (see below)

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  // auth check
  // resolve myProfileId
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">  {/* 3.5rem = header height */}
      {/* Left panel — conversation list */}
      <aside className="w-80 border-r border-gray-100 flex-shrink-0 overflow-y-auto hidden md:flex flex-col">
        <ConversationList myProfileId={myProfileId} />
      </aside>
      {/* Right panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
```

On mobile (< md), show only `{children}` (the right panel). The conversation list becomes a separate page.

### 2b. `ConversationList` client component (`ConversationList.tsx`)

Fetches conversations on mount and subscribes to updates via Realtime.

**Query:**
```typescript
// Step 1: get conversation_ids for this user
const { data: participantRows } = await supabase
  .from('social_conversation_participants')
  .select('conversation_id, last_read_at, conversation:social_conversations(id, type, title, avatar_url, last_message_at, last_message_preview)')
  .eq('profile_id', myProfileId);

// Step 2: get other participants for name/avatar (1:1 conversations)
const convIds = participantRows.map(r => r.conversation_id);
const { data: otherParticipants } = await supabase
  .from('social_conversation_participants')
  .select('conversation_id, profile_id, profile:social_profiles(id, display_name, avatar_url, username)')
  .in('conversation_id', convIds)
  .neq('profile_id', myProfileId);
```

Map to conversation previews (title = other participant name for 1:1, or `conversation.title` for groups).

**Realtime subscription** — subscribe to `social_conversations` changes for the user's conversations so the preview updates when a new message arrives:
```typescript
supabase.channel('my-conversations')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'social_conversations',
    filter: `id=in.(${convIds.join(',')})`,  // or re-fetch on any change
  }, () => { refetchConversations(); })
  .subscribe();
```

**Conversation row layout:**
```
[Avatar 40×40]  Display Name / Group title    [timestamp]
                Last message preview…         [🔵 unread dot]
```

- Active conversation (matches URL `conversationId`) → `bg-blue-50`
- Unread → show blue dot, bold name
- Clicking a row → `router.push(`/messages/${conv.id}`)`

**Header above list:** "Tin nhắn" title + search input (filter conversations client-side by name).

**Empty state:** "Chưa có cuộc trò chuyện nào"

### 2c. Empty state page (`messages/page.tsx`)

Simple server component — no auth check needed (layout handles it):
```tsx
export default function MessagesIndexPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-text-secondary">
      <div className="text-center">
        <span className="text-5xl">💬</span>
        <p className="mt-4 font-medium">Chọn một cuộc trò chuyện</p>
        <p className="text-sm mt-1">hoặc bắt đầu trò chuyện mới từ trang hồ sơ</p>
      </div>
    </div>
  );
}
```

### 2d. Chat page (`messages/[conversationId]/page.tsx`)

Server component: fetch initial 50 messages SSR. Pass to `ChatView` client component.

```typescript
// Verify user is a participant (security check)
const { data: participation } = await supabase
  .from('social_conversation_participants')
  .select('profile_id')
  .eq('conversation_id', conversationId)
  .eq('profile_id', myProfileId)
  .maybeSingle();
if (!participation) redirect('/messages');

// Fetch messages
const { data: messageRows } = await supabase
  .from('social_messages')
  .select(`
    id, conversation_id, sender_id, content, message_type, is_deleted, created_at,
    sender:social_profiles!social_messages_sender_id_fkey(id, display_name, avatar_url, username)
  `)
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true })
  .limit(50);

// Fetch conversation info (title / other participant)
const { data: convRow } = await supabase
  .from('social_conversations')
  .select('id, type, title, avatar_url')
  .eq('id', conversationId)
  .single();
```

Mark as read immediately server-side:
```typescript
await supabase
  .from('social_conversation_participants')
  .update({ last_read_at: new Date().toISOString() })
  .eq('conversation_id', conversationId)
  .eq('profile_id', myProfileId);
```

### 2e. `ChatView` client component (`ChatView.tsx`)

**Props:** `initialMessages`, `conversationId`, `myProfileId`, `conversationTitle`, `conversationAvatarUrl`

**Layout:**
```
┌──────────────────────────────────┐
│ [← back]  [Avatar] Name          │  ← sticky header
├──────────────────────────────────┤
│                                  │
│  [message bubble]                │  ← scrollable message list
│            [own message bubble]  │
│                                  │
├──────────────────────────────────┤
│ [text input...        ] [Send →] │  ← sticky footer
└──────────────────────────────────┘
```

**Message bubbles:**
- Own messages: `bg-primary text-white` right-aligned
- Others: `bg-surface text-text-primary` left-aligned, show sender name above for groups
- Deleted messages: italic "Tin nhắn đã bị xóa"
- Timestamp: small text below each bubble, format `HH:mm`

**Realtime subscription:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'social_messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, async (payload) => {
      // Fetch sender profile for the new message
      const newMsg = payload.new as Record<string, unknown>;
      const { data: sender } = await supabase
        .from('social_profiles')
        .select('id, display_name, avatar_url, username')
        .eq('id', newMsg.sender_id as string)
        .single();
      // Append to messages state
      setMessages(prev => [...prev, mapMessageRow(newMsg, sender)]);
      // Scroll to bottom
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [conversationId]);
```

**Auto-scroll:** `useRef` on messages container, `scrollIntoView` on new message append.

**Send message:**
```typescript
async function sendMessage() {
  if (!input.trim()) return;
  await supabase.from('social_messages').insert({
    conversation_id: conversationId,
    sender_id: myProfileId,
    content: input.trim(),
    message_type: 'text',
  });
  setInput('');
  // Realtime will add to state automatically
}
```

Submit on `Enter` key (no Shift+Enter needed for MVP). Show send button disabled when input is empty.

**Deferred (do NOT implement):** Typing indicators, read receipts (✓/✓✓), message pagination, file/image sending, reply-to. These are tracked as open bugs on mobile and are not expected on web MVP.

### 2f. Start conversation from profile page

**`apps/social/components/profile/ProfileHeader.tsx`** — the "Nhắn tin" button (BUG-021 on web). Currently it either doesn't exist or is non-functional. Add/fix it:

```typescript
// Find or create 1:1 conversation
async function handleMessage() {
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('social_conversation_participants')
    .select('conversation_id')
    .eq('profile_id', myProfileId);  // my conversations

  // Intersect with the other user's conversations
  const myConvIds = existing?.map(r => r.conversation_id) ?? [];
  const { data: shared } = await supabase
    .from('social_conversation_participants')
    .select('conversation_id, conversation:social_conversations(type)')
    .eq('profile_id', profile.id)
    .in('conversation_id', myConvIds);

  const existing1on1 = shared?.find(r =>
    (r.conversation as { type: string } | null)?.type === '1:1'
  );

  if (existing1on1) {
    router.push(`/messages/${existing1on1.conversation_id}`);
    return;
  }

  // Create new 1:1 conversation
  const { data: newConv } = await supabase
    .from('social_conversations')
    .insert({ type: '1:1' })
    .select('id')
    .single();

  if (newConv) {
    await supabase.from('social_conversation_participants').insert([
      { conversation_id: newConv.id, profile_id: myProfileId },
      { conversation_id: newConv.id, profile_id: profile.id },
    ]);
    router.push(`/messages/${newConv.id}`);
  }
}
```

> **Note:** RLS may block direct inserts into `social_conversations`. If you get a 42501 error, check if there's an existing `find_or_create_1on1_conversation` RPC in the DB — if so, call `supabase.rpc('find_or_create_1on1_conversation', { other_profile_id: profile.id })`. If not, the direct insert approach above should work since you're an authenticated participant.

### 2g. Header wiring

**`apps/social/components/layout/Header.tsx`** — add "Tin nhắn" to the nav links with an unread dot:

```tsx
<Link href="/messages" className="relative hover:text-primary transition-colors">
  Tin nhắn
  {unreadMessageCount > 0 && (
    <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
  )}
</Link>
```

Fetch unread count (conversations where `last_message_at > last_read_at` for my participation):
```typescript
const { data: unreadConvs } = await supabase
  .from('social_conversation_participants')
  .select('conversation_id, last_read_at, conversation:social_conversations(last_message_at)')
  .eq('profile_id', myProfileId);

const unreadMessageCount = (unreadConvs ?? []).filter(r => {
  const conv = r.conversation as { last_message_at?: string } | null;
  if (!conv?.last_message_at || !r.last_read_at) return !!conv?.last_message_at;
  return new Date(conv.last_message_at) > new Date(r.last_read_at);
}).length;
```

---

## Task 3 — Progress Tracker + PM Handover

### `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`

Add after existing Web Platform rows:

```
Web Platform (tuto.social),Messaging on web,2,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/messages two-panel layout; /messages/[conversationId] chat with Realtime; start DM from profile; Header unread dot
Web Platform (tuto.social),Settings page (blocked/muted) on web,1,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/settings — blocked users tab + muted users tab; unblock/unmute actions; Header dropdown link
```

### `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md`

Append §7 entry "Dev Agent 11 — Web Sprint 3" covering:
- `/messages` two-panel layout + Realtime + send
- `/settings` blocked/muted tabs
- Profile page "Nhắn tin" button fixed (BUG-021 web)
- Header: "Tin nhắn" nav link + unread dot, "Cài đặt" dropdown link

Update §12 Web Sprint 3 status to Complete.

---

## Deferred (do NOT implement in this sprint)

| Feature | Reason |
|---------|--------|
| Typing indicators | BUG-017 — not even on mobile yet |
| Read receipt ticks (✓✓) | BUG-018 — deferred on mobile too |
| Chat message pagination (older messages on scroll) | BUG-019 — deferred |
| Image/video sending | Phase 2 |
| Group chat creation from web | Mobile-only for now |
| Parental Controls in settings | Blocked on parent-child linking |

---

## Key Facts

- **Two-panel layout** requires `h-[calc(100vh-3.5rem)]` — header is `h-14` = `3.5rem`
- **Realtime** requires the browser client — cannot use in server components
- **`profile_id`** in conversation tables = `social_profiles.id`, NOT `auth.users.id`
- **RLS** on `social_messages` INSERT: users can only insert into conversations they participate in
- **Metro cache trap note:** irrelevant for web — restart Next.js dev server with `npm run dev --workspace=apps/social` if needed
- **Do NOT create** documentation files unless asked
- **Do NOT touch** `src/` (mobile) or `apps/dashboard/`
- Build and verify with `npm run build --workspace=apps/social` before finishing
