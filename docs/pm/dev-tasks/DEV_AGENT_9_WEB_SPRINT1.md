# Dev Agent 9 — Web Sprint 1: Rejected Badge + School Profile + Notifications

**Prepared:** 2026-03-21  
**Agent role:** Next.js Engineer  
**Platform:** `apps/social/` (tuto.social web — Next.js App Router)  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)  
**Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules

---

## Codebase Orientation

### Key patterns to follow

**Server components (data fetching):** Use `createSupabaseServerClient()` from `apps/social/lib/supabase-server.ts`. See `apps/social/app/(main)/profile/[username]/page.tsx` as the canonical example — server component that fetches, maps data, then renders client components.

**Client components (interactivity):** Mark with `'use client'`. Access auth via `useAuth()` from `@/contexts/AuthContext`. Use browser Supabase client from `apps/social/lib/supabase.ts` for mutations.

**Routing:** Next.js App Router. All authenticated pages live under `apps/social/app/(main)/`. The `(main)` group layout handles the Header.

**Existing components to REUSE:**
- `components/ui/Avatar.tsx` — avatar with initials fallback
- `components/ui/Button.tsx` — primary/secondary button
- `components/profile/FollowButton.tsx` — follow/unfollow with optimistic update
- `components/profile/ProfilePostGrid.tsx` — 3-column post grid
- `components/feed/FeedPost.tsx` — full post card

**Do NOT touch:**
- `src/` (mobile) — this is web-only work
- `apps/dashboard/` — different app entirely

---

## Task 1 — Fix `rejected` Moderation Badge in `FeedPost.tsx` (10 min)

**File:** `apps/social/components/feed/FeedPost.tsx`

The `MOD_BADGE` and `MOD_LABEL` maps at lines 57–66 are missing the `rejected` status that was added in migration 078.

```typescript
// ADD to MOD_BADGE:
rejected: 'bg-red-50 text-red-600',

// ADD to MOD_LABEL:
rejected: '✕ Rejected',
```

That's the entire task. No other changes to this file.

---

## Task 2 — School Profile Page

### Route
`apps/social/app/(main)/school/[schoolId]/page.tsx`

### What it is
A public-facing page for a school's social presence. SEO-friendly — parents searching for a school by name can land here. The `schoolId` is the UUID shared by all members of that school.

### Data queries (all server-side)

```typescript
// 1. School admin profile (the school's "account")
const { data: schoolAdminRow } = await supabase
  .from('social_profiles')
  .select('id, username, display_name, bio, avatar_url, cover_url, is_verified, follower_count, post_count, school_id')
  .eq('school_id', schoolId)
  .eq('role', 'school_admin')
  .maybeSingle();

// 2. Staff (teachers from this school, sorted by shield_count)
const { data: staffRows } = await supabase
  .from('social_profiles')
  .select('id, username, display_name, avatar_url, shield_count, shield_rank, is_verified')
  .eq('school_id', schoolId)
  .eq('role', 'teacher')
  .order('shield_count', { ascending: false })
  .limit(20);

// 3. Announcements (pinned first, then recent)
const { data: announcementRows } = await supabase
  .from('social_posts')
  .select(`
    id, content, post_type, is_pinned, created_at, like_count, comments_count,
    author:social_profiles!social_posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)
  `)
  .eq('school_id', schoolId)
  .eq('post_type', 'announcement')
  .in('moderation_status', ['ai_reviewed', 'parent_approved'])
  .order('is_pinned', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(20);

// 4. Achievement spotlights
const { data: achievementRows } = await supabase
  .from('social_posts')
  .select(`
    id, content, post_type, created_at, like_count, achievement,
    author:social_profiles!social_posts_author_id_fkey(id, username, display_name, avatar_url, role, is_verified)
  `)
  .eq('school_id', schoolId)
  .eq('post_type', 'achievement')
  .in('moderation_status', ['ai_reviewed', 'parent_approved'])
  .order('created_at', { ascending: false })
  .limit(6);
```

If `schoolAdminRow` is null → call `notFound()`.

### Page layout

**`generateMetadata`:** title = `${schoolName} | tuto.social`, description = school bio.

**Page structure:**

```
┌─────────────────────────────────────┐
│  Cover image (full-width, h-48)     │ ← cover_url or #0B5FFF→#6366F1 gradient
│  ┌──────────────────────────────┐   │
│  │  Avatar (72×72, -mt-9)       │   │ ← overlap cover bottom
│  └──────────────────────────────┘   │
│  School name + ✓ badge             │
│  Bio (3-line clamp, expandable)    │
│  Stats: X bài viết · X người theo dõi · X giáo viên │
│  [Follow School] button             │
├─────────────────────────────────────┤
│  Tabs: Thông báo | Giáo viên | Thành tích │
├─────────────────────────────────────┤
│  Tab content (see below)            │
└─────────────────────────────────────┘
```

**Tabs** — implement as client-side tab state (useState for activeTab). SSR data is passed as props; no additional fetching needed for tab switch.

**Thông báo tab:**
- Render announcements using `<FeedPost>` component (already handles all post types)
- Show 📌 "Ghim" badge on `is_pinned: true` posts
- Empty state: megaphone icon + "Chưa có thông báo nào"

**Giáo viên tab:**
- List of teacher cards: avatar + name + verified badge + shield count pill
- Shield rank colour: `beginner=#6B7280`, `bronze=#CD7F32`, `silver=#C0C0C0`, `gold=#FFD700`, `elite=#FF6B35`
- Each card links to `/profile/[username]`
- Empty state: "Chưa có giáo viên nào"

**Thành tích tab:**
- 2-column grid of achievement cards — reuse the `AchievementHeader` pattern already in `FeedPost.tsx` (extract as a shared mini-component or inline)
- Each card shows: gradient header (emoji + title) + student name + date
- Empty state: trophy icon + "Chưa có thành tích nào"

### Link from existing pages

**`apps/social/components/feed/FeedPost.tsx`** — the role badge that shows "Trường" for `school_admin` authors. Wrap it in a `<Link href={`/school/${post.author.schoolId}`}>` if `schoolId` is available. To get `schoolId`, add it to the `FeedPostData` interface and the query in `feed/page.tsx`:

```typescript
// Add to FeedPostData interface:
schoolId?: string;

// Add school_id to the POST_QUERY in feed/page.tsx:
author:social_profiles!social_posts_author_id_fkey(
  id, user_id, username, display_name, avatar_url, role, is_verified, school_id
)

// Add to the author mapping:
schoolId: a.school_id as string | undefined,
```

**`apps/social/app/(main)/profile/[username]/page.tsx`** — for `school_admin` profiles, add a "Xem trang trường →" link/button that navigates to `/school/[schoolId]`. Check if `profile.schoolId` exists before rendering.

---

## Task 3 — Notifications Page

### Route
`apps/social/app/(main)/notifications/page.tsx`

Note: **The header already has a nav link to `/notifications`** (`Header.tsx` line 47) — this page just needs to exist.

### Architecture

Split into two files:
1. **`page.tsx`** — Server Component: auth check, initial SSR fetch of notifications
2. **`NotificationsClient.tsx`** — Client Component: renders list, handles mark-as-read

### Server component (`page.tsx`)

```typescript
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

const NOTIF_QUERY = `
  id, type, read, created_at, post_id, data,
  actor:social_profiles!social_notifications_actor_id_fkey(
    id, username, display_name, avatar_url
  )
`;

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get current user's social profile
  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/feed');

  const { data: notifications } = await supabase
    .from('social_notifications')
    .select(NOTIF_QUERY)
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text-primary mb-4">Thông báo</h1>
      <NotificationsClient
        initialNotifications={notifications ?? []}
        profileId={profile.id}
      />
    </main>
  );
}
```

### Client component (`NotificationsClient.tsx`)

**Props:**
```typescript
interface Notification {
  id: string;
  type: string;
  read: boolean;
  created_at: string;
  post_id: string | null;
  data: Record<string, unknown>;
  actor: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
}

interface Props {
  initialNotifications: Notification[];
  profileId: string;
}
```

**On mount (`useEffect`):** Mark all unread notifications as read:
```typescript
await supabase
  .from('social_notifications')
  .update({ read: true })
  .eq('recipient_id', profileId)
  .eq('read', false);
```

**Notification row layout:**
```
[Actor Avatar] [Action text]          [time ago]
               [Post snippet if applicable]
```

Unread rows: `bg-blue-50` left border `border-l-2 border-primary`.
Read rows: plain white.

**Action text by type** (write a helper `getNotificationText(type, actorName, data)`):

| type | Text |
|------|------|
| `like` | `{actor} đã thích bài viết của bạn` |
| `applaud` | `{actor} đã hoan nghênh bài viết của bạn` |
| `curious` | `{actor} tò mò về bài viết của bạn` |
| `comment` | `{actor} đã bình luận: "{data.preview}"` |
| `comment_like` | `{actor} đã thích bình luận của bạn` |
| `follow` | `{actor} đã theo dõi bạn` |
| `mention` | `{actor} đã đề cập đến bạn` |
| `achievement` | `Chúc mừng! Bạn đã đạt thành tích: {data.achievementTitle}` |
| `level_up` | `Bạn đã lên cấp {data.level}! 🎉` |
| `shield_earned` | `Bạn nhận được {data.shieldCount} Shield 🛡` |
| `school_announcement` | `Thông báo mới từ trường: {data.title}` |
| `moderation_approved` | `Bài viết của bạn đã được duyệt ✓` |
| `moderation_rejected` | `Bài viết của bạn đã bị từ chối` |
| `reel_like` | `{actor} đã thích Reel của bạn` |

**Tap/click behaviour:**
- `like`, `applaud`, `curious`, `comment`, `comment_like` → `<Link href={`/post/${n.post_id}`}>`
- `follow` → `<Link href={`/profile/${n.actor?.username}`}>`
- `achievement`, `level_up`, `shield_earned` → `<Link href={`/profile/me`}>` (or own profile)
- `reel_like` → no link (reels not on web yet) — non-clickable row
- `school_announcement` → `<Link href="/feed">`
- `moderation_approved`, `moderation_rejected` → `<Link href={`/post/${n.post_id}`}>` if post_id exists

**Empty state:** Bell icon + "Chưa có thông báo nào" + subtitle "Khi có người thích hoặc bình luận bài viết của bạn, sẽ hiển thị ở đây."

**"Mark all read" button:** Show at top only if there are unread notifications. On click: call Supabase update + optimistically set all `read: true` in state.

### Notification bell badge in Header

Update `apps/social/components/layout/Header.tsx`:

- Add a red badge dot on the "Thông báo" nav link when there are unread notifications
- Fetch unread count client-side: on mount call `supabase.from('social_notifications').select('id', { count: 'exact', head: true }).eq('recipient_id', profileId).eq('read', false)`
- Show a red dot (not a number — keep it simple) on the nav link
- The `Header` already uses `useAuth()` which provides `profile` — use `profile.id` to query

---

## Task 4 — Progress Tracker + PM Handover

### `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`

Add new rows for these web features (add after the existing `Web Platform` rows):

```
Web Platform (tuto.social),School public pages on web,3,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/school/[schoolId] — 3-tab layout (announcements/staff/achievements); SEO metadata
Web Platform (tuto.social),Notification page on web,3,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/notifications — SSR initial load; mark-as-read on mount; unread bell dot in Header
Web Platform (tuto.social),Rejected moderation badge on web,1,Web,P0,Complete,Next.js Engineer,apps/social app,Not needed,FeedPost.tsx MOD_BADGE + MOD_LABEL — added rejected case (bg-red-50 text-red-600)
```

### `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md`

Append a new §7 entry "Dev Agent 9 — Web Sprint 1" summarising:
- Rejected badge fixed in `FeedPost.tsx`
- `/school/[schoolId]` page with 3-tab layout
- School link wired from `FeedPost` role badge and school_admin profile pages
- `/notifications` page with SSR initial load, mark-as-read, bell dot in Header

---

## Key Facts

- **Next.js App Router** — server components by default; add `'use client'` only when needed (event handlers, useState, useEffect)
- **`createSupabaseServerClient()`** — use in server components and route handlers
- **`apps/social/lib/supabase.ts`** — browser client (for client components)
- **Tailwind** — use existing design tokens: `text-primary`, `bg-primary`, `text-text-primary`, `text-text-secondary`, `bg-surface`, `rounded-card`
- **Do NOT create** documentation files unless asked
- **Do NOT touch** `src/` (mobile) or `apps/dashboard/`
- **Reference** `apps/social/app/(main)/profile/[username]/page.tsx` before building the school page — follow the exact same server component + metadata pattern
- **actor join alias** — check the actual foreign key name on `social_notifications` before using `social_notifications_actor_id_fkey`; it might be just `actor_id` referenced directly. If the join alias fails, fetch actor separately.
