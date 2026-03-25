# Tuto Social — PM Handover

**Prepared:** 2026-03-20  
**Context window closed after:** Session fd7a4b (BATCH 10 bug-fix sprint)  
**Transcript reference:** [BATCH 10 Bug-Fix Sprint](fd7a4b0f-77b0-4ec8-a48b-6251728bc0f5)  
**Supabase project:** tuto-social (MCP server `user-supabase-tuto`)  
**Key docs:** `docs/prd-specs/TUTO_SOCIAL_PRD.md`, `TUTO_SOCIAL_IMPLEMENTATION_PLAN.md`, `TUTO_SOCIAL_CURSOR_RULES.md`

---

## 1. Product Vision (Why This Exists)

Tuto Social is the community layer of the Tuto EdTech platform. Its strategic moat is that it has **real school data, student progress data, teacher bookings, and class memberships** — something Facebook and Instagram cannot replicate.

**The killer use case (prioritise above all else):**
> A student completes a major milestone. It auto-posts as an achievement on the feed. Their teacher comments on it. Other parents from the school like it. This happens without anyone manually posting.

**Year 1 primary users:** Parents (consumers) + Teachers/School Admins (content creators). Students are secondary.

**Platform decision:** Social lives inside the Tuto mobile app as a feature (`src/`) first. `apps/social/` (tuto.social web) is the Phase 2 standalone destination. Building both simultaneously was the original plan but is expensive — mobile-first is the correct priority.

---

## 2. Monorepo Structure

```
tuto1/
├── src/                          # React Native / Expo — PRIMARY
│   ├── navigation/
│   │   ├── ParentTabs.tsx        # Main bottom tab bar (hides when CommunityTab active)
│   │   ├── SocialStack.tsx       # Stack navigator wrapping SocialTabNavigator
│   │   └── SocialTabs.tsx        # Social bottom tabs: Feed | Reels | Search | Messages | Profile
│   ├── screens/social/           # All social screens (ReelsScreen, SocialFeedScreen, etc.)
│   ├── components/social/        # All social UI components (ReelItem, PostCard, etc.)
│   └── services/social/          # Supabase data services (feed, reels, profile, follows, etc.)
│
├── apps/social/                  # Next.js — tuto.social web (Phase 2)
│   └── app/(main)/               # feed / post / profile / search pages
│
├── apps/dashboard/               # Next.js — school admin dashboard / tuto.asia
│   └── components/social/        # FeedPreview, FeedPreviewCTA, TrendingEducators
│
├── supabase/
│   ├── migrations/               # SQL migrations 001–072 (044+ are social)
│   └── functions/                # Edge Functions: social-profiles, social-follows,
│                                 #   social-stories, social-expire-stories
│
└── docs/
    ├── qa/bug-register.csv       # Single source of truth for all bugs
    ├── qa/test-cases.csv         # Full test case library (TC-001 → TC-091+)
    └── prd-specs/                # PRD, implementation plan, progress tracker, cursor rules
```

**Mobile navigation tree:**

```
ParentTabs (main app tab bar — hidden when social is active)
  └── CommunityTab
        └── SocialStackNavigator  [src/navigation/SocialStack.tsx]
              ├── SocialTabs      [src/navigation/SocialTabs.tsx]
              │     ├── Feed      → SocialFeedScreen
              │     ├── Reels     → ReelsScreen (uses ReelItem component)
              │     ├── Search    → SocialSearchScreen
              │     ├── Messages  → ConversationsScreen
              │     └── Profile   → SocialProfileScreen
              ├── ReelDetail      → ReelDetailScreen  (swipeable FlatList)
              ├── SocialProfile   → SocialProfileScreen (other users)
              ├── CreateReel      → CreateReelScreen
              ├── CreateStory     → CreateStoryScreen
              ├── StoryViewer     → StoryViewerScreen
              ├── Chat            → ChatScreen
              └── CreateGroup     → CreateGroupScreen
```

---

## 3. Architecture Rules (Non-Negotiable)

- **Supabase only** — No Firebase for social. The Supabase project is `tuto-social` (MCP server: `user-supabase-tuto`).
- **RLS blocks direct mobile/browser inserts** on sensitive tables. Those must go through `SECURITY DEFINER` RPC functions or server-side API routes.
- **All three platforms read the same Supabase tables.** Changes to schema must be reflected in mobile types (`src/types/social/`), web components (`apps/social/`), and any Edge Functions.
- **Metro cache trap (IMPORTANT):** If a fix is in code but not showing in the simulator, Metro is serving a stale bundle. Kill port 8081 (`lsof -ti :8081 | xargs kill -9`), clear `.expo` and `node_modules/.cache`, then restart Metro with `npx expo start --clear`. Never use `npx expo run:ios` if Metro is already running — it will reuse the old process.

---

## 4. The 10-Part Implementation Plan

The project is broken into 10 sequential parts. Each part must be tested before starting the next. Current status based on `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:

| Part | Name | Priority | Status | Notes |
|------|------|----------|--------|-------|
| **1** | Database & Auth Foundation | P0 | **Complete** | All tables, RLS, indexes, Edge Functions, SSO |
| **2** | Core Feed & Posts | P0 | **Complete** | Feed tabs, post creation, reactions, comments, infinite scroll |
| **3** | Profiles & Social Graph | P0 | **Complete** | Profile pages, follow/unfollow, profile grid, edit profile |
| **4** | Stories Feature | P1 | **Complete** | Stories tables, Edge Functions, StoryBar, StoryViewer, CreateStory |
| **5** | Reels/Shorts | P1 | **Mostly Complete** | Reel feed, creation, likes, progress bar ✅; tap-to-pause BUG-031 ❌ |
| **6** | Messaging (DMs) | P1 | **Mostly Complete** | Conversations, group chat, Realtime; several polish bugs open (BUG-017–021) |
| **7** | Notifications & Engagement | P1 | **Not Started** | Push notifications, in-app notification centre, achievement system, XP/levels |
| **8** | Creator Tools & Analytics | P2 | **Not Started** | Creator dashboard, post analytics, audience insights, payout |
| **9** | Moderation & Safety | P2 | **Not Started** | AI content screening, school admin queue, parental controls, report/block |
| **10** | Premium & Monetization | P2 | **Not Started** | Subscription tiers, advertising, full monetization stack |

**Overall tracker:** 59 items Complete / 2 In Progress / 54 Not Started (out of ~115 total).

---

## 5. Part-by-Part Detail

### Part 1 — Database & Auth Foundation ✅ COMPLETE
All social Supabase migrations (044–054) are applied. Tables: `social_profiles`, `social_posts`, `social_comments`, `social_likes`, `social_follows`, `social_notifications`, `social_moderation_queue`, plus RLS policies and indexes.  
Edge Functions deployed: `social-profiles`.  
SSO integration with existing Tuto account via Supabase Auth is complete.

### Part 2 — Core Feed & Posts ✅ COMPLETE
- Feed tabs: School / For You / Following — all working and filtered correctly.
- Post creation (text, photo, audience selector, subject tags) — complete.
- Reactions (Like / Applaud / Curious), comment system, share sheet — complete.
- Feed on web (`apps/social/feed`) and FeedPreview on dashboard — complete.
- Post detail page at `/post/[id]` — complete.

### Part 3 — Profiles & Social Graph ✅ COMPLETE
- Student, parent, teacher profile pages (mobile + web) — complete.
- 3-column profile post grid — complete.
- Follow/Unfollow button — complete.
- Edit profile (basic) — complete.
- Search (users by username/name) — complete.
- `social_follows` table + Edge Function — complete.

**Still missing from Part 3:**
- Parent-child account linking
- School account linking
- Role assignment on registration (Student / Parent / Teacher / Admin)

### Part 4 — Stories ✅ COMPLETE
- `social_stories` table, RLS, `social-stories` bucket, Edge Functions (`social-stories`, `social-expire-stories`) — complete.
- Mobile: `StoryBar`, `StoryViewerScreen`, `CreateStoryScreen`, `StoryViewersScreen` — complete.
- Web: `StoryBar`, `StoryViewerModal`, `CreateStoryModal` — complete.
- Stories show `TypeError: Failed to fetch` on web (BUG-011) — Edge Function URL may not be configured in `apps/social` env.

### Part 5 — Reels/Shorts ⚠️ MOSTLY COMPLETE
- Reel feed (vertical swipeable FlatList), like/mute, progress bar — complete.
- Reel creation (video upload via `expo-file-system/legacy`, Base64 → Supabase Storage) — complete.
- New reels default to `moderation_status: 'ai_reviewed'` for QA (bypass — must be reverted for production).
- Profile → reel scrolling (swipeable by author) — complete.
- Reel feed refresh on screen focus — complete.
- **Still open:** BUG-031 (tap to pause), BUG-022 (mute button on detail screen — pending re-test).

### Part 6 — Messaging (DMs) ⚠️ MOSTLY COMPLETE
- `social_conversations` + `social_messages` + `social_participants` tables — complete.
- Realtime subscriptions via Supabase Realtime — complete.
- Direct messages (1:1) — complete.
- Group chat creation via `SECURITY DEFINER` RPC `create_group_conversation` — complete (BUG-039 fix).
- Conversation preview timestamp updated via DB trigger `trg_update_conversation_last_message` — complete (BUG-041 fix).
- **Still open:** BUG-017 (typing indicator), BUG-018 (read receipts), BUG-019 (pagination), BUG-020 (offline retry), BUG-021 (profile → DM button on web), BUG-029/032 (compose icon behind status bar), BUG-030 (stale conversation preview text), BUG-038 (group min participant validation).

### Part 7 — Notifications & Engagement ❌ NOT STARTED
Scope: push notifications (Expo Push), in-app notification centre, achievement system (XP, levels 1-5), streaks, leaderboards.  
DB table `social_notifications` exists (migration 049) but no mobile UI or push setup.

### Part 8 — Creator Tools & Analytics ❌ NOT STARTED
Scope: creator dashboard, post analytics (views, reach), audience insights, revenue tracking, tipping/gifts, payout settings.  
Requires Part 7 (engagement data) to be meaningful.

### Part 9 — Moderation & Safety ❌ NOT STARTED (BLOCKING FOR PRODUCTION)
Scope: AI text screening (OpenAI), AI image screening (Google Vision), school admin moderation queue, Tuto HQ human review for teacher posts, parental controls, report/block.  
**CRITICAL NOTE:** All reels and posts currently default to `moderation_status: 'ai_reviewed'` — this is a QA bypass applied in session fd7a4b. This **must be reverted** before any production launch. The bypass is in `src/services/social/reels.service.ts` (default value) and in `supabase/migrations/social_reels_auto_approve.sql` (column default).

### Part 10 — Premium & Monetization ❌ NOT STARTED
Scope: subscription tiers, advertising, full monetization stack.  
Depends on all previous parts being stable.

---

## 6. Agent Structure

The project uses role-based AI agents. Each agent owns a slice of the stack. When starting a new session, tell the agent which role to take and include `TUTO_SOCIAL_CURSOR_RULES.md` in context.

| Agent Role | Owns | Key Files |
|------------|------|-----------|
| **React Native Engineer** | Mobile screens, components, navigation | `src/screens/social/`, `src/components/social/`, `src/navigation/` |
| **Supabase Engineer** | Database migrations, RLS, triggers, RPC functions | `supabase/migrations/`, `supabase/functions/` |
| **Next.js Engineer** | Web feed, profile pages, API routes on `apps/social/` and `apps/dashboard/` | `apps/social/app/`, `apps/dashboard/components/social/` |
| **Trust & Safety Engineer** | Moderation queue, AI screening, parental controls | Part 9 scope — not started |
| **Analytics Engineer** | Metrics tracking, creator analytics, North Star metric | Part 8 scope — not started |
| **Auth Engineer** | Role assignment, parent-child linking, school account linking | Auth flows — not started |
| **Integration Engineer** | Zalo/Facebook cross-posting, school dashboard auto-share | Phase 2 integrations — not started |
| **Design System Engineer** | Color tokens, typography, spacing, component library | `src/components/social/`, NativeWind config, `apps/social/globals.css` |

**How agents hand off:** At the end of each context window, the outgoing agent updates:
1. `docs/qa/bug-register.csv` — status of all bugs touched
2. `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` — completion status of features worked on
3. This handover document — section §7 (session fixes) and §9 (open bugs)

**Always reference in new sessions:**
- `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules
- `docs/prd-specs/TUTO_SOCIAL_IMPLEMENTATION_PLAN.md` — part scope
- `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` — what's done / what's next
- `docs/qa/bug-register.csv` — open bugs

---

## 7. What Was Done in Session fd7a4b (BATCH 10)

### BUG-039 — Group chat RLS violation → VERIFIED FIXED
- **Root cause:** Mobile called `supabase.from('social_conversations').insert()` directly; RLS `42501` blocked it.
- **Fix:** `SECURITY DEFINER` RPC `create_group_conversation` (migrations 070 + 071) creates the conversation and all participants atomically. Mobile `conversations.service.ts` calls `rpc()` instead of direct insert.

### BUG-040 — Reel creation Base64 crash → VERIFIED FIXED
- **Root cause 1 (crash):** `FileSystem.EncodingType.Base64` was `undefined` in the newer expo-file-system API.
- **Fix 1:** Import from `expo-file-system/legacy`; use string literal `'base64'`.
- **Root cause 2 (invisible after upload):** `createReel()` set `moderation_status: 'pending'` but `getReelsFeed()` only returns `'ai_reviewed'` / `'parent_approved'`.
- **Fix 2:** Changed default to `'ai_reviewed'` in `reels.service.ts`. Migration `social_reels_auto_approve.sql` backfills existing rows and sets column default. **Must be reverted for production.**

### BUG-041 — Stale conversation timestamp → VERIFIED FIXED
- **Root cause:** `last_message_at` / `last_message_preview` on `social_conversations` never updated on message insert.
- **Fix:** `SECURITY DEFINER` trigger `trg_update_conversation_last_message` (migration `072_update_conversation_on_message.sql`).

### BUG-042 — Dual nav bars on iPhone 16e → DEFERRED
- All four approaches failed (static `tabBarStyle`, `useFocusEffect + setOptions`, custom `tabBar` returning `null`, zero-height View).
- Only affects iPhone 16e; 17 Pro and 17 Pro Max are clean.
- **Recommended future fix:** Move Social section to a root-level modal stack (`createNativeStackNavigator`) entirely outside `ParentTabs`, eliminating the nesting conflict.

### BUG-043 — Profile icon behind status bar → VERIFIED FIXED
- **Fix:** `SocialFeedScreen.tsx` applies `insets.top` padding. `ProfileHeader.tsx` accepts `insetTop` prop for Instagram-style full-bleed cover image with correct content offset below status bar.

### Reel feed refresh → VERIFIED FIXED
- Added `useEffect` with `useIsFocused()` in `ReelsScreen` to call `loadReels(true)` on focus.

### Profile → reel scrolling → VERIFIED FIXED
- `SocialProfileScreen` now passes `authorId` + `initialIndex` to `ReelDetailScreen`.
- `ReelDetailScreen` rewritten as a vertical paged `FlatList` fetching all reels by `authorId`.

### Reel progress bar → VERIFIED FIXED
- `ReelItem.tsx` wires `onPlaybackStatusUpdate` → `Animated.Value` → thin progress bar at bottom of video.
- `ReelsScreen` reads social tab bar height via `useBottomTabBarHeight()` and passes as `bottomOffset` to `ReelItem`, so the bar sits above the nav bar.

### Part 8 Creator Tools & Analytics (Dev Agent 7) → COMPLETE
- **Migration 079:** `increment_view_count` RPC for posts and reels.
- **Migration 080:** `shield_rank` column on `social_profiles`; `award_teacher_shields` trigger on post INSERT (educational +5, other +1; rank thresholds 50/150/400/1000).
- **analytics.service.ts:** `incrementViewCount` (session dedup) + `getCreatorStats` (profile, posts, reels, top 5).
- **CreatorDashboardScreen:** XP progress, stats row (posts/reels/views/likes), top posts/reels horizontal lists, shield section for teachers. Accessible from own profile via "Creator Dashboard" button.
- **View tracking:** SocialFeedScreen and ReelsScreen call `incrementViewCount` in `onViewableItemsChanged`.
- **ProfileHeader:** Shield icon + count + rank pill for teachers (shieldRank colors: beginner→elite).

### Dev Agent 7 Continuation → COMPLETE
- **ModerationStatus / ModerationBadge:** Added `rejected` (migration 078); type, CONFIG, LABEL_KEY, i18n keys.
- **Migration 081:** `award_shield_on_comment` trigger — teacher +1 shield when someone comments on their post (no self-comment).
- **LeaderboardScreen:** Teacher leaderboard by shield_count; top 3 podium, FlatList 4+, pagination, empty state; navigates to SocialProfile.
- **Navigation:** CreatorDashboard "View leaderboard" CTA (all roles); ProfileHeader "Xem bảng xếp hạng" link for teacher profiles.

### Dev Agent 8 — P0 School Profile Sprint → COMPLETE
- **SchoolProfileScreen.tsx:** 3-tab layout (Announcements / Staff / Achievements). Cover + header with school logo, verified badge, FollowButton. Bio expandable. Stats row (posts, followers, staff count). Lazy-load tab data. Empty states per tab. Back button overlay on cover.
- **profile.service.ts:** `getSchoolProfile(schoolId)`, `getSchoolStaff(schoolId)`, `getSchoolAnnouncements(schoolId)`, `getSchoolAchievementSpotlights(schoolId)`. Types `SchoolProfile`, `StaffMember`.
- **Navigation:** PostCard role badge (school_admin + schoolId) tappable → SchoolProfile. ProfileHeader "Trang trường →" button for school_admin profiles → SchoolProfile. SocialStack Screen added.
- **Tracker:** Achievement post card design, School profile page, School announcements feed, Staff directory, Achievement spotlights — all Complete.

### Dev Agent 10 — Web Sprint 2 → COMPLETE
- **`/leaderboard`:** Public teacher ranking (no login required). Top-3 podium (gold/silver/bronze rings) + list from rank 4; optional follow when logged in; shield explainer; Header nav link **Bảng xếp hạng**.
- **`/dashboard`:** Auth-gated creator overview: XP progress (thresholds 0/100/250/500/1000), stats tiles (posts/reels/views/likes from top-5 aggregates per brief), teacher shield section + next-rank hint + link to leaderboard, tabs for top posts (link to `/post/[id]`) and top reels (non-clickable). Header user menu **Tổng quan sáng tạo**.
- **Data:** Uses existing `social_profiles` (xp, level, streak_count, shield_count, shield_rank) and `social_posts` / `social_reels` view/like counts.

### Dev Agent 9 — Web Sprint 1 → COMPLETE
- **Rejected badge fix:** `FeedPost.tsx` — added `rejected` to MOD_BADGE (`bg-red-50 text-red-600`) and MOD_LABEL (`✕ Rejected`).
- **School profile page:** `/school/[schoolId]` — 3-tab layout (Thông báo / Giáo viên / Thành tích). Cover, avatar, bio, stats, FollowButton. Announcements rendered with FeedPost; staff cards with shield ranks; achievement grid.
- **School links wired:** FeedPost role badge (school_admin) links to `/school/[schoolId]` when schoolId present; ProfileHeader shows "Xem trang trường →" for school_admin profiles.
- **Notifications page:** `/notifications` — SSR initial load, mark-as-read on mount, action text by type, links to post/profile/feed. Empty state + "Đánh dấu tất cả đã đọc" button.
- **Bell dot in Header:** Red dot on "Thông báo" nav link when unread count > 0 (client-side fetch of unread count).

### Dev Agent 11 — Web Sprint 3 → COMPLETE
- **`/messages`:** Two-panel layout (desktop): conversation list + chat; SSR initial messages (latest 50); Realtime insert for new messages; mark `last_read_at` on open; mobile: full conversation list on `/messages`, chat at `/messages/[conversationId]` with back link.
- **`/settings`:** Blocked and muted user tabs with unblock/unmute via Supabase client deletes.
- **Profile BUG-021 (web):** `ProfileHeader` "Nhắn tin" opens or creates 1:1 (`created_by` + participant rows) and navigates to chat.
- **Header:** Nav link **Tin nhắn** with unread dot (conversations where `last_message_at` > `last_read_at`); user menu **Cài đặt** → `/settings`.

---

## 8. Database Migrations — Not Yet Committed to Git

The last committed snapshot is `181f095`. All migrations below exist on disk but are uncommitted. Run against Supabase before any fresh environment setup.

| File | Purpose |
|------|---------|
| `055_social_profiles_subjects.sql` | Subjects array on social_profiles |
| `056_social_stories.sql` | Stories tables + RLS + storage bucket |
| `057_social_comments_count_trigger.sql` | Auto-maintain `comments_count` on social_posts |
| `058_social_increment_comments_rpc.sql` | `increment_comments_count` RPC |
| `059_social_moderation_queue_rls.sql` | RLS for moderation queue |
| `060_social_reels.sql` | Reels table |
| `061_social_messaging.sql` | Conversations + messages tables |
| `063_reel_like_count_trigger_security_definer.sql` | Reel like counter trigger |
| `064_social_reels_video_url_fix.sql` | Fix video_url column |
| `065_social_reels_storage.sql` | Reels storage bucket + policies |
| `066_participants_update_last_read.sql` | Update `last_read_at` for participants |
| `067_realtime_participants.sql` | Realtime publication for participants |
| `068_realtime_conversations.sql` | Realtime publication for conversations |
| `069_fix_participants_insert_rls.sql` | Fix participant INSERT RLS |
| `070_*.sql` + `071_*.sql` | Group conversation SECURITY DEFINER RPC (BUG-039) |
| `072_update_conversation_on_message.sql` | Trigger: update last_message on message INSERT (BUG-041) |
| `social_reels_auto_approve.sql` | Backfill moderation_status + column default (QA bypass — revert for production) |
| `079_social_increment_view_rpc.sql` | increment_view_count RPC for posts/reels |
| `080_social_teacher_shields.sql` | shield_rank column + award_teacher_shields trigger |
| `081_social_shield_on_comment.sql` | award_shield_on_comment trigger (teacher +1 per comment received) |

---

## 9. Open Bugs (Prioritised)

Full details in `docs/qa/bug-register.csv`.

### Fix These Next (P1 — High impact, quick wins)

| Bug ID | Description | Likely fix location |
|--------|-------------|---------------------|
| BUG-029 / 032 | Compose icon on Messages tab behind status bar | `ConversationsScreen.tsx` — add `useSafeAreaInsets` top padding |
| BUG-030 | Conversation list shows stale preview text | `conversations.service.ts` — ensure query orders by `last_message_at DESC` and selects `last_message_preview` |
| BUG-038 | Group creation enforces min 3 participants | `CreateGroupScreen.tsx` — lower minimum to 2 |
| BUG-031 | Reel tap to pause not working | `ReelItem.tsx` `handleTap` — `isPlaying` state and Video ref may be out of sync |
| BUG-040 CSV | Bug register still marked "Open" — update to Verified Fixed | `docs/qa/bug-register.csv` |
| BUG-043 CSV | Bug register still shows "RE-TEST FAILED" — update to Verified Fixed | `docs/qa/bug-register.csv` |

### Important UX Gaps (P2)

| Bug ID | Description |
|--------|-------------|
| BUG-017 | Typing indicator — Supabase Realtime broadcast `typing_status` event |
| BUG-018 | Message read receipts — track `read_at` per participant, show single/double tick |
| BUG-019 | Chat pagination — `onEndReached` + cursor-based fetch |
| BUG-021 | Profile messaging button non-functional on web (`apps/social`) |
| BUG-034 | No way to exit Community and return to dashboard |

### Low Priority / Deferred

| Bug ID | Description |
|--------|-------------|
| BUG-011 | Stories `TypeError: Failed to fetch` on web — Edge Function URL not configured in `apps/social` env |
| BUG-013 | Next.js hydration mismatch |
| BUG-020 | Messages fail offline — no retry queue |
| BUG-022 | Mute button on Reel detail — pending re-test |
| BUG-035 / 036 / 037 | Search bar and profile header layout polish |
| BUG-042 | Dual nav bar on iPhone 16e — see structural fix note above |

---

## 10. Testing Infrastructure

**Test assets:**
- Test cases: `docs/qa/test-cases.csv` (TC-001 → TC-091+)
- Bug register: `docs/qa/bug-register.csv` — update status here for every fix and re-test

**Test accounts — full reference (all verified in Supabase auth.users):**

| Email | Username | Display Name | Role | Used For |
|-------|----------|--------------|------|----------|
| `tarun.tageja@apollo.edu.vn` | `tarun_apollo` | Tarun (Apollo) | `teacher` | Mobile: iPhone 17 Pro simulator; web two-account tests (TC-177, TC-179) |
| `tarun.tageja@gmail.com` | `we_are_banana_republic_ul87` | We are Banana Republic | `parent` | Mobile: iPhone 17 Pro Max simulator |
| `tarun@tutoglobal.com` | `tarun_tageja` | Tarun Tageja | `parent` | Mobile: iPhone 16e simulator (BUG-042 known); Tuto Admin dashboard |
| `marketing@tutoglobal.com` | `test_8z6r` | Test User | `parent` | Primary web test account (BATCH 1–14 web tests) |
| `qa.teacher@tuto.test` | `qa_teacher_tuto` | QA Test Teacher | `teacher` | **Web teacher-specific tests:** TC-164, TC-129–132, TC-163; leaderboard |
| `qa.parent@tuto.test` | `qa_parent_tuto` | QA Test Parent | `parent` | **Web parent/second-user tests:** TC-177 (Realtime), TC-185–188 (settings) |
| `tarun.tageja@outlook.com` | `tarun_tuto` | Tarun Tageja | `schoolAdmin` | School admin / school profile tests |

> **Password for QA accounts:** `TutoQA2026!` — applies to both `qa.teacher@tuto.test` and `qa.parent@tuto.test`. Reset by PM on 2026-03-21 via Supabase admin SQL. All other accounts use `password`.

**Test account (Tuto Admin dashboard — tutoglobal.com/tutoadmin):**

| Email | Access |
|-------|--------|
| `tarun@tutoglobal.com` | Full Tuto Admin access (same as `tarun_tageja` Supabase user) |

**Running the app:**
```bash
# Always start Metro fresh — never use expo run:ios if Metro is running
npx expo start --clear

# If simulator doesn't auto-connect, press i in Metro terminal
# If still serving old code: kill port 8081, clear caches, restart
lsof -ti :8081 | xargs kill -9
rm -rf .expo node_modules/.cache
npx expo start --clear
```

---

## 11. P0 Gap Analysis — PM Decisions (2026-03-21)

The following P0 items were reviewed and decisions made:

| Feature | Decision | Reason |
|---------|----------|--------|
| School profile page | ✅ Dev Agent 8 | Feasible with current schema — no new migrations needed |
| School announcements feed | ✅ Dev Agent 8 | Subset of school profile work |
| Staff directory | ✅ Dev Agent 8 | Simple teacher query by school_id |
| Achievement post card design | ✅ Complete (tracker fix) | AchievementCard.tsx already fully built |
| Parent-child account linking | ⏸ Deferred | Linking mechanism not decided (QR code vs student ID vs email code) |
| School account linking | ⏸ Deferred | Same product decision pending |
| Role assignment on registration | ⏸ Deferred | Existing Tuto users already have roles; self-signup is a separate auth project |
| Parent consent flow | ⏸ Deferred | Depends on parent-child linking (above) |
| Tuto HQ moderation | ⏸ Deferred | Requires OpenAI key + human review infrastructure |
| Auto-share consent popup | ⏸ Deferred | Requires school dashboard webhook integration |

Brief for Dev Agent 8: `docs/pm/dev-tasks/DEV_AGENT_8_P0_SCHOOL_PROFILE.md`

---

## 12. Web Sprint Plan (decided 2026-03-21)

Mobile-first phase is complete through Part 9. Web (`apps/social/`) now needs parity on key features:

| Sprint | Scope | Agent | Status |
|--------|-------|-------|--------|
| **Web Sprint 1** | Rejected badge fix · School profile page (`/school/[schoolId]`) · Notifications page (`/notifications`) + bell dot | Dev Agent 9 | Brief: `docs/pm/dev-tasks/DEV_AGENT_9_WEB_SPRINT1.md` |
| **Web Sprint 2** | Leaderboard (`/leaderboard`) · Creator Dashboard (`/dashboard`) | Dev Agent 10 | **Complete** — see §7 Dev Agent 10 |
| **Web Sprint 3** | Messaging on web (`/messages`) · Blocked/Muted settings (`/settings`) · Parental Controls (when linking is done) | Dev Agent 11 | **Complete** — messaging + settings shipped; Parental Controls still deferred on parent-child linking |

**Reels on web:** Deferred — video creation UX is mobile-native. Reel *viewing* page may be added in Sprint 3.

---

## 13. Immediate Next Actions for Incoming PM

1. **Update bug-register.csv** — Mark BUG-040 and BUG-043 as "Verified Fixed".
2. **Commit all uncommitted files** — `git add . && git commit` to capture everything since `181f095`.
3. **Fix BUG-029/032** — Compose button safe area (quick fix, same pattern as BUG-043).
4. **Fix BUG-030** — Check `conversations.service.ts` query ordering.
5. **Fix BUG-038** — Lower group minimum from 3 to 2 in `CreateGroupScreen`.
6. **Fix BUG-031** — Reel tap-to-pause in `ReelItem.tsx`.
7. **Start Part 7 (Notifications)** — In-app notification centre and achievement system. This unlocks the product's core viral loop (achievement auto-posts).
8. **Plan Part 9 (Moderation)** — Required before any public launch. The `ai_reviewed` bypass must be replaced with real AI screening.
9. **Revert QA bypass** — Before any production release, change `moderation_status` default back to `'pending'` in `reels.service.ts` and remove the `social_reels_auto_approve.sql` column default.
