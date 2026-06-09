# Dev Agent 4 — Phase 2: Parts 5 & 6

**PM:** Product Manager Agent  
**Date:** 2026-03-20  
**Branch:** `tutoSocial1`  
**Assigned to:** Dev Agent 4 (new agent — has NOT worked on this codebase before)  
**Supabase MCP server:** `user-supabase-tuto`  
**Test account:** `marketing@tutoglobal.com` / `password`  
**Second test account:** `tarun.tageja@apollo.edu.vn` / (ask user for password)

---

## Mandatory Reading Before Writing Any Code

Read these in full. No skipping.

1. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules (auth, data, RLS, migrations)
2. `.cursor/rules/rules.tuto-social.mdc` — design system, moderation, privacy, component rules
3. `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` — current status of all features
4. `docs/qa/bug-register.csv` — open bugs, especially BUG-019 through BUG-022

---

## What Phase 1 Built — Read These Files Before Touching Them

Dev Agent 3 built Phase 1 of Parts 5 and 6. Read each file before extending it.

### Part 5 — Reels (Phase 1 — already built)

| File | What it does |
|------|-------------|
| `src/services/social/reels.service.ts` | `getReelsFeed`, `getReelById`, `getReelsByAuthorId`, `toggleReelLike` |
| `src/components/social/ReelItem.tsx` | Full-screen reel view — `Video` ref + imperative `playAsync/pauseAsync`, owns `isMuted` state |
| `src/components/social/ReelActions.tsx` | Right-side action bar — like, comment, share, mute, author avatar |
| `src/components/social/ReelInfo.tsx` | Bottom overlay — author name, description, subjects |
| `src/components/social/ReelCard.tsx` | Grid thumbnail for profile page |
| `src/screens/social/ReelsScreen.tsx` | Full-screen vertical FlatList, viewability-driven autoplay |
| `src/screens/social/ReelDetailScreen.tsx` | Single reel view by ID |

### Part 6 — Messaging (Phase 1 — already built)

| File | What it does |
|------|-------------|
| `src/services/social/conversations.service.ts` | `getConversations`, `getMessages`, `sendMessage`, `markConversationRead`, `startConversation`, `mapMessage`, `fetchSenderProfile`, `getConversationOtherParticipant` |
| `src/components/social/ConversationListItem.tsx` | Conversation row — avatar, name, preview, unread dot |
| `src/components/social/MessageBubble.tsx` | Chat bubble — own (blue right) vs other (grey left), sender name, timestamp |
| `src/components/social/MessageInput.tsx` | Text input + Send button |
| `src/screens/social/ConversationsScreen.tsx` | Conversation list with Realtime subscription |
| `src/screens/social/ChatScreen.tsx` | 1:1 chat — inverted FlatList, Realtime, markConversationRead on mount |
| `src/screens/social/NewMessageScreen.tsx` | Search users → start 1:1 conversation |

### Navigation (already registered in Phase 1)

`src/navigation/SocialStack.tsx` — `SocialStackParamList` already has: `ReelDetail`, `Chat`, `NewMessage`. You will need to **add** `CreateReel`, `NewGroup`, `GroupChatInfo`.

`src/navigation/SocialTabs.tsx` — tabs: Feed, Reels, Search, Messages, Profile.

---

## PART 5 PHASE 2 — Reel Creation

### What to Build

| Deliverable | Description |
|-------------|-------------|
| Supabase Storage bucket | `social-reels` — for uploaded video files |
| `createReel()` in service | Upload video → get URL → insert to `social_reels` |
| `CreateReelScreen.tsx` | Pick video → preview → add description/subjects → submit |
| Navigation | "+" button on Reels tab → `CreateReelScreen` (modal presentation) |

### Step 1 — Storage Bucket

Check if the `social-reels` bucket exists:

```sql
SELECT name, public FROM storage.buckets WHERE name = 'social-reels';
```

If it does not exist, create it via Supabase MCP `apply_migration`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-reels',
  'social-reels',
  true,
  104857600,  -- 100MB max
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']
);

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "reels_storage_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social-reels' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read
CREATE POLICY "reels_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-reels');

-- Authors can delete their own files
CREATE POLICY "reels_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'social-reels' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 2 — Extend `reels.service.ts`

Add `createReel()` to the existing service file. Do NOT rewrite the existing functions.

```typescript
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer'; // npm install base64-arraybuffer if not installed

export interface CreateReelInput {
  videoUri: string;        // local file URI from expo-image-picker
  description?: string;
  subjects?: string[];
  audience?: 'public' | 'school' | 'followers' | 'private';
  durationSeconds?: number;
}

export async function createReel(
  profileId: string,
  schoolId: string | null,
  input: CreateReelInput,
): Promise<string> {  // returns new reel ID
  const { videoUri, description, subjects = [], audience = 'public', durationSeconds = 0 } = input;

  // 1. Read file as base64
  const base64 = await FileSystem.readAsStringAsync(videoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);

  // 2. Upload to Supabase Storage
  const ext = videoUri.split('.').pop() ?? 'mp4';
  const fileName = `${profileId}/${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await socialSupabase.storage
    .from('social-reels')
    .upload(fileName, arrayBuffer, {
      contentType: `video/${ext === 'mov' ? 'quicktime' : ext}`,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = socialSupabase.storage
    .from('social-reels')
    .getPublicUrl(fileName);

  // 3. Insert reel record
  const expiresAt = new Date();
  const { data: reel, error: insertError } = await socialSupabase
    .from('social_reels')
    .insert({
      author_id: profileId,
      school_id: schoolId,
      video_url: urlData.publicUrl,
      duration_seconds: durationSeconds,
      description: description ?? null,
      subjects,
      audience,
      moderation_status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return (reel as { id: string }).id;
}
```

### Step 3 — `CreateReelScreen.tsx`

`src/screens/social/CreateReelScreen.tsx`:

- **Step 1 view — Pick video:**
  - Large "Choose Video" button using `expo-image-picker` `launchImageLibraryAsync` with `mediaTypes: 'videos'`
  - Show selected video preview using `expo-av` `Video` component (muted, paused)
  - Show video duration if available from picker result
  - "Next →" button — disabled until video is selected

- **Step 2 view — Add details:**
  - Description `TextInput` (multiline, max 150 chars, char count shown)
  - Subject chips (same multi-select pattern as `CreatePostScreen` — check how that works and follow the same pattern)
  - Audience selector: Public / School / Followers (pill buttons, same as create post)
  - "Đăng Reel" submit button with loading spinner

- **On submit:**
  - Call `ensureSocialProfile()` to get `profileId` and `schoolId`
  - Call `createReel(profileId, schoolId, { videoUri, description, subjects, audience, durationSeconds })`
  - On success: show "Đang chờ kiểm duyệt" toast/alert, then `navigation.goBack()`
  - On error: show error message, reset loading state

- **Header:** Custom header with "✕" close button (top-left) + "Tạo Reel" title

- **Permissions:** Check `MediaLibrary.requestPermissionsAsync()` before launching picker. If denied, show a message explaining why permission is needed.

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const pickVideo = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please allow media access to pick a video.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'videos',
    allowsEditing: false,
    quality: 1,
  });
  if (!result.canceled && result.assets[0]) {
    setVideoAsset(result.assets[0]);
  }
};
```

### Step 4 — Navigation

**In `SocialStack.tsx`:** Add `CreateReel` to `SocialStackParamList` and register the screen:

```typescript
// Add to SocialStackParamList:
CreateReel: undefined;

// Add to Stack.Navigator:
<Stack.Screen
  name="CreateReel"
  component={CreateReelScreen}
  options={{ headerShown: false, presentation: 'modal' }}
/>
```

**In `SocialTabs.tsx`:** On the Reels tab, add a "+" `Pressable` in the tab bar header area or use the tab bar button. The cleanest approach for React Navigation:

```typescript
// In the Reels tab screen options:
tabBarButton: (props) => (
  <View style={{ flexDirection: 'row' }}>
    <DefaultTabBarButton {...props} />
    <Pressable
      onPress={() => navigation.navigate('CreateReel')}
      style={styles.createBtn}
    >
      <MaterialIcons name="add-circle" size={28} color="#0B5FFF" />
    </Pressable>
  </View>
),
```

Alternatively, add a floating "+" `Pressable` inside `ReelsScreen` (top-right corner, absolute position). This is simpler and equally discoverable.

### Part 5 Phase 2 — Do NOT Build

- Video trimming / editing
- Sound/music overlay system
- Reel comments bottom sheet (Phase 3)
- Duet / React feature

### Part 5 Phase 2 Acceptance Criteria

- [ ] Supabase Storage bucket `social-reels` exists
- [ ] Tapping "+" on Reels tab opens `CreateReelScreen` as modal
- [ ] Can pick a video from camera roll
- [ ] Video previews before submission
- [ ] Can add description, subjects, audience
- [ ] Submit uploads video to Storage and inserts `social_reels` row with `moderation_status: 'pending'`
- [ ] Success state shown after submit, modal closes
- [ ] New reel appears in own profile Reels grid (once moderation status is updated to `ai_reviewed`)

---

## PART 6 PHASE 2 — Group Chats + Read Receipts

### What to Build

| Deliverable | Description |
|-------------|-------------|
| DB: read receipts | `last_read_at` already in `social_conversation_participants` — just use it in the UI |
| `MessageBubble` update | Show ✓ (sent) / ✓✓ (read) on own messages |
| `NewGroupScreen.tsx` | Select 2+ users → create group conversation |
| `GroupChatInfoScreen.tsx` | View group members, group name, leave group |
| `conversations.service.ts` | Add `createGroupConversation()`, `getGroupInfo()`, `leaveConversation()` |
| Navigation | Group chat option from `NewMessage`, group info from `ChatScreen` header |

### Step 1 — Read Receipts (DB is already set up)

`social_conversation_participants.last_read_at` exists and `markConversationRead()` already updates it. What's missing is the UI.

**Update `MessageBubble.tsx`** — add read receipt to own messages:

Add a `readAt` prop and show tick icons below own messages:

```typescript
interface Props {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  readAt?: string | null;  // NEW — last_read_at of the OTHER participant
}

// In render, below the bubble for own messages:
{isOwn && (
  <View style={styles.tickRow}>
    <MaterialIcons
      name={readAt ? 'done-all' : 'done'}
      size={14}
      color={readAt ? '#0B5FFF' : '#9CA3AF'}
    />
  </View>
)}
```

**Update `ChatScreen.tsx`** — fetch other participant's `last_read_at` and pass to bubbles:

```typescript
const [otherLastRead, setOtherLastRead] = useState<string | null>(null);

// After loading messages, fetch other participant's last_read_at:
const { data: participants } = await socialSupabase
  .from('social_conversation_participants')
  .select('profile_id, last_read_at')
  .eq('conversation_id', conversationId);

const other = participants?.find(p => p.profile_id !== myProfileId);
setOtherLastRead(other?.last_read_at ?? null);

// Subscribe to changes on participants table for this conversation
// so the ticks update in real-time when the other person reads
```

Pass `readAt` to each `MessageBubble`: a message is "read" if `message.createdAt <= otherLastRead`.

### Step 2 — Extend `conversations.service.ts`

Add these functions without changing existing ones:

```typescript
export async function createGroupConversation(
  creatorProfileId: string,
  participantIds: string[],  // includes creator
  title: string,
): Promise<string> {
  const allIds = Array.from(new Set([creatorProfileId, ...participantIds]));
  if (allIds.length < 3) throw new Error('Group chat requires at least 3 participants');

  const { data: conv, error } = await socialSupabase
    .from('social_conversations')
    .insert({ type: 'group', created_by: creatorProfileId, title })
    .select('id')
    .single();

  if (error) throw error;
  const convId = (conv as { id: string }).id;

  await socialSupabase.from('social_conversation_participants').insert(
    allIds.map((id, idx) => ({
      conversation_id: convId,
      profile_id: id,
      role: id === creatorProfileId ? 'admin' : 'member',
    })),
  );

  return convId;
}

export async function getGroupParticipants(conversationId: string): Promise<{
  id: string; displayName: string; avatarUrl?: string; username: string; role: string;
}[]> {
  const { data, error } = await socialSupabase
    .from('social_conversation_participants')
    .select(`
      role,
      profile:social_profiles(id, display_name, avatar_url, username)
    `)
    .eq('conversation_id', conversationId);

  if (error) throw error;
  return (data ?? []).map((row) => {
    const p = row.profile as Record<string, unknown>;
    return {
      id: p.id as string,
      displayName: (p.display_name as string) ?? 'Unknown',
      avatarUrl: p.avatar_url as string | undefined,
      username: (p.username as string) ?? '',
      role: (row.role as string) ?? 'member',
    };
  });
}

export async function leaveConversation(conversationId: string, profileId: string): Promise<void> {
  await socialSupabase
    .from('social_conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('profile_id', profileId);
}
```

### Step 3 — `NewGroupScreen.tsx`

`src/screens/social/NewGroupScreen.tsx`:

- **Header:** "Tạo nhóm" title + "Tạo" button (disabled until title entered + ≥2 others selected)
- **Group name input:** `TextInput` at top — required
- **User search:** search bar (same pattern as `NewMessageScreen`) — search `social_profiles`
- **Selected users:** horizontal scroll row of selected avatar chips with "✕" to remove
- **Search results:** FlatList of users with checkbox-style selection
- **On submit:** call `createGroupConversation(myProfileId, selectedIds, title)` → navigate to `ChatScreen` with `conversationId`
- Minimum 2 other participants (3 total including creator) — show validation error if fewer

### Step 4 — `GroupChatInfoScreen.tsx`

`src/screens/social/GroupChatInfoScreen.tsx`:

- Route params: `{ conversationId: string }`
- Show group name (editable by admin)
- Show participant list — avatar + display name + role badge (Admin / Member)
- "Leave Group" button at bottom — calls `leaveConversation()` → navigates back to `ConversationsScreen`
- Only show "Remove member" option to admin role

### Step 5 — Update `ChatScreen.tsx`

Add group chat support:

1. Detect if conversation type is `group` (fetch from `social_conversations`)
2. If group: header shows group title + member count, tapping header navigates to `GroupChatInfo`
3. In `renderItem` for `MessageBubble`: for group chats, always `showSender={item.senderId !== myProfileId}` so you see who sent each message

```typescript
// In header options:
navigation.setOptions({
  headerShown: true,
  title: conversationType === 'group' ? `${groupTitle} (${participantCount})` : otherName,
  headerRight: conversationType === 'group' ? () => (
    <Pressable onPress={() => navigation.navigate('GroupChatInfo', { conversationId })}>
      <MaterialIcons name="info-outline" size={24} color="#0B5FFF" style={{ marginRight: 16 }} />
    </Pressable>
  ) : undefined,
});
```

### Step 6 — Update `ConversationListItem.tsx`

Show group avatar (or stacked initials) and group name for group conversations:

```typescript
// If conversation.type === 'group':
// - Show group title as the name
// - Show a generic group icon or stacked avatars placeholder
// - No "otherParticipant" to show
```

### Step 7 — Navigation Updates

**In `SocialStack.tsx`** — add to `SocialStackParamList` and register:

```typescript
// Add to type:
NewGroup: undefined;
GroupChatInfo: { conversationId: string };

// Add screens:
<Stack.Screen
  name="NewGroup"
  component={NewGroupScreen}
  options={{
    headerShown: true,
    title: 'Tạo nhóm',
    headerBackTitle: '',
    headerTintColor: '#0B5FFF',
  }}
/>
<Stack.Screen
  name="GroupChatInfo"
  component={GroupChatInfoScreen}
  options={{ headerShown: false }}
/>
```

**In `ConversationsScreen.tsx`** — add a "New Group" option. The pencil icon currently opens `NewMessage`. Change to show an action sheet:

```typescript
// On pencil press, show ActionSheetIOS (iOS) or Alert with options (cross-platform):
// Option 1: "New Message" → NewMessage
// Option 2: "New Group" → NewGroup
```

### Part 6 Phase 2 — Do NOT Build in This Session

- Image / video media sharing in messages (Phase 3)
- Message request system (Phase 3)
- Typing indicators (already excluded — Phase 3)
- Web messaging UI (Phase 3)

### Part 6 Phase 2 Acceptance Criteria

- [ ] Own messages show ✓ (sent) when delivered
- [ ] Own messages show ✓✓ (blue, read) when other participant has `last_read_at` >= message timestamp
- [ ] Pencil icon on Conversations screen offers "New Message" and "New Group" options
- [ ] `NewGroupScreen` lets you search users, select 2+, name the group, create it
- [ ] Group conversation appears in conversation list for all participants
- [ ] Group `ChatScreen` shows member name above each bubble (from other senders)
- [ ] Group header taps open `GroupChatInfoScreen`
- [ ] `GroupChatInfoScreen` shows all members + "Leave Group" button
- [ ] Leaving a group removes you from the conversation list

---

## Also Fix These Open Bugs (Same Session)

These are small and already diagnosed. Fix them while you're in the codebase.

| Bug | File | Fix |
|-----|------|-----|
| BUG-019 | `SocialStack.tsx` line 39 | `screenOptions={{ headerShown: false }}` is already set — but verify tabs also have `headerShown: false` in `SocialTabs.tsx`. If dual bars still appear, explicitly set `headerShown: false` on the `SocialTabs` stack screen. |
| BUG-020 | `ReelActions.tsx` | Show like/comment/share counts unconditionally (even when 0) — remove `> 0` conditional |
| BUG-021 | `SocialProfileScreen.tsx` or `ProfileHeader.tsx` | Wire the Message button to `startConversation(myProfileId, profile.id)` then navigate to `Chat` |
| BUG-022 | Already fixed in Phase 1 (`ReelItem.tsx` has `isMuted` + mute toggle) — verify it works, mark as resolved |

---

## Mandatory Housekeeping

After completing all work:

1. **`docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:**
   - Part 5 Reel Creation rows → `Complete`
   - Part 6 Group Chat rows → `Complete`
   - Part 6 Read Receipts rows → `Complete`

2. **`docs/qa/bug-register.csv`:**
   - BUG-019, BUG-020, BUG-021, BUG-022 → `Fixed — Pending Re-test`

3. **Fill in the Agent Report below.**

---

## Agent 4 Report *(fill in before closing)*

**Date:** 2026-03-20  
**Agent Transcript ID:** *(user to add)*  
**Status:** Complete

### Part 5 Phase 2 — Reel Creation

| Task | Result | Files Changed | Notes |
|------|--------|---------------|-------|
| Storage bucket `social-reels` | Done | 065_social_reels_storage.sql, MCP apply_migration | Bucket + RLS policies; policy fix for profile_id folder |
| `createReel()` in service | Done | reels.service.ts | base64-arraybuffer, expo-file-system |
| `CreateReelScreen.tsx` | Done | CreateReelScreen.tsx | 2-step flow: pick video → details; subjects, audience |
| "+" navigation wired | Done | ReelsScreen.tsx, SocialStack.tsx | Floating + button top-right; CreateReel modal |

### Part 6 Phase 2 — Group Chats + Read Receipts

| Task | Result | Files Changed | Notes |
|------|--------|---------------|-------|
| Read receipts in `MessageBubble` | Done | MessageBubble.tsx | readAt prop; ✓/✓✓ icons |
| `ChatScreen` other participant `last_read_at` | Done | ChatScreen.tsx | Fetch + Realtime subscription on participants |
| `createGroupConversation()` in service | Done | conversations.service.ts | + getGroupParticipants, leaveConversation |
| `NewGroupScreen.tsx` | Done | NewGroupScreen.tsx | Search, select 2+, title, create |
| `GroupChatInfoScreen.tsx` | Done | GroupChatInfoScreen.tsx | Members list, Leave Group |
| `ChatScreen` group mode | Done | ChatScreen.tsx | Group header, info button, showSender for group |
| Navigation registered | Done | SocialStack.tsx, ConversationsScreen.tsx | NewGroup, GroupChatInfo; Alert action sheet |

### Bug Fixes

| Bug | Fixed? | Notes |
|-----|--------|-------|
| BUG-019 | Verified | headerShown: false on Stack + SocialTabs; bottom offset 160 in ReelActions |
| BUG-020 | Verified | ReelActions shows counts unconditionally (no >0 check) |
| BUG-021 | Verified | SocialProfileScreen handleMessage + ProfileHeader onMessagePress wired |
| BUG-022 | Verified | ReelItem/ReelActions has isMuted + mute toggle; ReelDetailScreen uses ReelItem |

**What's left for Phase 3:** Reel comments bottom sheet; image/video in messages; message request system; typing indicators (excluded); web messaging UI.

**Notes for PM:** participants_update policy added (066) for markConversationRead. Realtime for social_conversation_participants may need ALTER PUBLICATION for live read receipt updates.

---

## PM Decision Gate

Once report is filled and CSV files updated, PM will:
1. Dispatch QA agent for re-test of reel creation, group chat, read receipts, and bug fixes
2. If QA green — plan Dev Agent 5 for Part 7 (Notifications) + Part 8 (Creator Analytics)

---

*Document owner: PM Agent | Last updated: 2026-03-20*
