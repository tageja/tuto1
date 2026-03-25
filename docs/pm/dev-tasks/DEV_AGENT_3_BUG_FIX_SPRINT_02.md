# Dev Agent 3 — Bug Fix Sprint 02 (Post-QA Patch)

**PM:** Product Manager Agent  
**Date:** 2026-03-19  
**Branch:** `tutoSocial1`  
**Context:** BATCH 8 + BATCH 9 QA found 7 bugs. PM has already fixed BUG-017 (RLS recursion — migration 062 applied) and BUG-018 (conversations seeded). Your job is the remaining 5 code bugs below.

---

## PM Pre-work Already Done — Do Not Redo

| Bug | Fix | Who |
|-----|-----|-----|
| BUG-017 | Migration `062_fix_conversation_participants_rls.sql` applied — `SECURITY DEFINER` function breaks the infinite recursion in `participants_select` RLS policy | PM via Supabase MCP |
| BUG-018 | 2 conversations seeded (`test_8z6r` ↔ `tarun_tuto`, `test_8z6r` ↔ `tarun_apollo`), 3 messages each | PM via Supabase MCP |

---

## Your 5 Bugs — Fix in Priority Order

---

### BUG-016 — Reels show blank black screen, no video playback (PRIORITY 1 — BLOCKER)

**Severity:** High | **Blocks:** TC-044 through TC-053

**PM diagnosis (confirmed):**  
- Data is fine: 3 reels seeded with valid HTTPS URLs (`test-videos.co.uk`), `ai_reviewed`, `public` ✅  
- Root cause is code: **Expo SDK 54 / `expo-av` v16** no longer reliably autoplay via the `shouldPlay` prop inside a `FlatList`. The `Video` component renders (black background is visible) but playback never starts.  
- Fix: Extract each reel into its own component with its own `videoRef`, and drive playback imperatively via `playAsync()` / `pauseAsync()` using `useEffect` when `isActive` changes.

**Fix instructions:**

1. Create a new component `src/components/social/ReelItem.tsx` that encapsulates a single reel (the `View` + `Video` + `ReelInfo` + `ReelActions`):

```tsx
import React, { useRef, useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av';
import type { Reel } from '../../services/social/reels.service';
import ReelInfo from './ReelInfo';
import ReelActions from './ReelActions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
}

export default function ReelItem({ reel, isActive, onLike, onComment, onAuthorPress }: Props) {
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = React.useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync().catch(() => {});
    } else {
      videoRef.current.pauseAsync().catch(() => {});
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: reel.videoUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted={isMuted}
        shouldPlay={false}  // controlled manually via ref
        onError={(err) => console.warn('Video error', err)}
      />
      <ReelInfo reel={reel} onAuthorPress={onAuthorPress} />
      <ReelActions
        reel={reel}
        onLike={onLike}
        onComment={onComment}  // TODO Phase 2: open comment bottom sheet
        onAuthorPress={onAuthorPress}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
});
```

2. Update `ReelsScreen.tsx` — replace the inline `View + Video + ReelInfo + ReelActions` in `renderItem` with `<ReelItem>`:

```tsx
import ReelItem from '../../components/social/ReelItem';

const renderItem = useCallback(
  ({ item, index }: { item: Reel; index: number }) => (
    <ReelItem
      reel={item}
      isActive={index === activeIndex}
      onLike={() => handleLike(item)}
      onComment={() => {}} // TODO Phase 2
      onAuthorPress={() => navigation.navigate('SocialProfile', { userId: item.author.id })}
    />
  ),
  [activeIndex, handleLike, navigation],
);
```

3. Remove the old `styles.item`, `styles.video`, `styles.skeleton` references that are now in `ReelItem`.

4. Update `ReelDetailScreen.tsx` with the same `useRef` + `playAsync` pattern — use a single `ReelItem` component directly:
```tsx
<ReelItem
  reel={reel}
  isActive={true}  // always active in detail view
  onLike={handleLike}
  onComment={() => {}}
  onAuthorPress={() => navigation.navigate('SocialProfile', { userId: reel.author.id })}
/>
```

5. In `ReelActions.tsx`, add `isMuted` and `onMuteToggle` to props and render the mute button (this also fixes BUG-022 simultaneously):
```tsx
interface Props {
  reel: Reel;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
  isMuted: boolean;           // NEW
  onMuteToggle: () => void;   // NEW
}
// Add mute button to the action bar:
<Pressable style={styles.action} onPress={onMuteToggle}>
  <MaterialIcons
    name={isMuted ? 'volume-off' : 'volume-up'}
    size={28}
    color="#fff"
  />
</Pressable>
```

**Acceptance criteria:** Open Reels tab → video plays within 2 seconds. Swipe to next reel → previous reel pauses, next reel plays.

---

### BUG-019 — Dual navigation bars visible simultaneously (PRIORITY 2)

**Severity:** Medium | **Blocks:** Overall polish, confusing UX

**What the tester saw:** Two navigation bars rendered at the same time — the tab bar AND a stack header above it, both visible on Reels or Messages screens.

**Fix instructions:**

1. Open `src/navigation/SocialStack.tsx` — find the `Stack.Navigator` that wraps `SocialTabs` (the tab navigator). Ensure the screen containing the tabs has `headerShown: false`:

```tsx
<Stack.Screen
  name="SocialTabs"
  component={SocialTabs}
  options={{ headerShown: false }}
/>
```

2. Open `src/navigation/SocialTabs.tsx` (or wherever the tab navigator is defined) — ensure `headerShown: false` is set on the `Tab.Navigator`:

```tsx
<Tab.Navigator
  screenOptions={{
    headerShown: false,
    // ... rest of tab options
  }}
>
```

3. For screens that push a custom header (like `ChatScreen` which sets `navigation.setOptions({ headerShown: true, title: otherName })`), verify the stack navigator ABOVE the tabs DOES show the header for pushed screens (Chat, ReelDetail, NewMessage, SocialProfile) — those should have `headerShown: true` or use the default stack header.

4. Test: Navigate to Feed tab → only bottom tab bar visible, no extra header. Navigate to a chat → only the back-button stack header visible (no tab bar).

**Acceptance criteria:** Only one navigation element visible at a time on all screens.

---

### BUG-020 — Like count always empty below heart icon (PRIORITY 3)

**Severity:** Low | **Affects:** TC-048 UX

**Current code in `ReelActions.tsx` line 50:**
```tsx
<Text style={styles.count}>{reel.likeCount > 0 ? reel.likeCount : ''}</Text>
```

This hides the count when it's 0 (consistent with TikTok UX). BUT the QA tester found counts are always empty even when likes exist — likely because the like count on seeded reels is 0 and no likes have been added yet during testing.

**Fix:** Show count unconditionally for all action buttons. Change all three count lines:
```tsx
// Like
<Text style={styles.count}>{reel.likeCount}</Text>
// Comment
<Text style={styles.count}>{reel.commentCount}</Text>
// Share
<Text style={styles.count}>{reel.shareCount}</Text>
```

This makes the count always visible (even when 0), consistent with how the feed post interactions work (BUG-004 fix precedent).

---

### BUG-021 — Profile page Message button does nothing (PRIORITY 4)

**Severity:** Medium | **Affects:** TC-061 user flow

**What it should do:** On another user's profile, tapping the Message button should open a DM conversation with that user.

**Find the message button:** It is in `src/components/social/ProfileHeader.tsx` or `src/screens/social/SocialProfileScreen.tsx`. There should be a "Nhắn tin" button next to the Follow button on other users' profiles.

**Fix instructions:**

1. Find the Message button in the profile components. It likely has an empty `onPress` or is commented out.

2. Wire it to `startConversation` from `conversations.service.ts` then navigate to `ChatScreen`:

```tsx
import { startConversation } from '../../services/social/conversations.service';
import { ensureSocialProfile } from '../../services/social/auth.service';

const handleMessage = useCallback(async () => {
  try {
    const myProfile = await ensureSocialProfile();
    if (!myProfile) return;
    const conversationId = await startConversation(myProfile.id, profile.id);
    navigation.navigate('Chat', { conversationId });
  } catch (err) {
    console.error('Failed to start conversation', err);
  }
}, [profile.id, navigation]);

// Then in JSX:
<Pressable onPress={handleMessage} style={styles.messageBtn}>
  <MaterialIcons name="chat-bubble-outline" size={20} color="#0B5FFF" />
  <Text style={styles.messageBtnText}>Nhắn tin</Text>
</Pressable>
```

3. Make sure this button only shows on OTHER users' profiles (not own profile), consistent with how the Follow button is conditionally shown.

**Acceptance criteria:** Tap Message on another user's profile → navigates to `ChatScreen` with that user. If no existing conversation, a new one is created.

---

### BUG-022 — No mute button on Reels (PRIORITY 5 — handle in BUG-016 fix)

**Severity:** Low

**Note: This is already handled as part of the BUG-016 fix above.** The `ReelItem` component includes `isMuted` state and `onMuteToggle`, and `ReelActions` is updated to render the mute button. No additional work needed here if BUG-016 is fixed correctly.

---

## Mandatory Housekeeping

After completing all fixes:

1. **Update `docs/qa/bug-register.csv`:**
   - BUG-016 → `Fixed — Pending Re-test`
   - BUG-017 → `Verified Fixed` (PM applied migration 062)
   - BUG-018 → `Verified Fixed` (PM seeded data)
   - BUG-019 → `Fixed — Pending Re-test`
   - BUG-020 → `Fixed — Pending Re-test`
   - BUG-021 → `Fixed — Pending Re-test`
   - BUG-022 → `Fixed — Pending Re-test` (covered by BUG-016 fix)

2. **Fill in the Agent Report section below.**

---

## Agent Report *(fill in before closing)*

**Date:** 2026-03-19  
**Agent Transcript ID:** *(see Cursor agent-transcripts)*  
**Status:** Complete

| Bug | Fix Applied | Files Changed | Re-test Ready? |
|-----|-------------|---------------|----------------|
| BUG-016 | ReelItem with videoRef + playAsync/pauseAsync; ReelActions mute | ReelItem.tsx (new), ReelsScreen.tsx, ReelDetailScreen.tsx, ReelActions.tsx, index.ts | Yes |
| BUG-019 | Stack default headerShown: false; explicit true for PostDetail/Followers/Following/StoryViewers/NewMessage | SocialStack.tsx | Yes |
| BUG-020 | Show like/comment/share counts unconditionally | ReelActions.tsx | Yes |
| BUG-021 | onMessagePress prop; handleMessage with startConversation + navigate to Chat | ProfileHeader.tsx, SocialProfileScreen.tsx | Yes |
| BUG-022 | Covered by BUG-016 (mute in ReelActions) | — | Yes |

**Notes for PM:**

- BUG-017 and BUG-018 were fixed by PM (migration 062, seeded conversations); not touched.
- ReelItem uses `shouldPlay={false}` and drives playback via `videoRef.current.playAsync()` / `pauseAsync()` when `isActive` changes — addresses expo-av v16 FlatList autoplay issue.
- Profile message button only enabled when `!isOwnProfile`; calls `startConversation(myProfile.id, profile.id)` then navigates to Chat.

---

*Document owner: PM Agent | Last updated: 2026-03-19*
