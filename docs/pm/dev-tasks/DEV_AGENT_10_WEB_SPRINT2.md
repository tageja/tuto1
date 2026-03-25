# Dev Agent 10 — Web Sprint 2: Leaderboard + Creator Dashboard

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

**Read these files before building anything:**
- `apps/social/app/(main)/notifications/page.tsx` — canonical server component + client split pattern
- `apps/social/app/(main)/school/[schoolId]/page.tsx` — SSR with tabs pattern
- `apps/social/components/layout/Header.tsx` — where to add nav links

**Key patterns:**
- Server components use `createSupabaseServerClient()` from `apps/social/lib/supabase-server.ts`
- Client components use browser Supabase client from `apps/social/lib/supabase.ts` + `useAuth()` from `@/contexts/AuthContext`
- Tailwind design tokens: `text-primary` (#0B5FFF), `bg-surface`, `rounded-card`, `text-text-primary`, `text-text-secondary`
- **Do NOT touch** `src/` (mobile) or `apps/dashboard/`

**Mobile reference screens** (for design parity — read but do not copy imports):
- `src/screens/social/LeaderboardScreen.tsx` — mobile leaderboard design
- `src/screens/social/CreatorDashboardScreen.tsx` — mobile creator dashboard design

---

## Known constants (use these everywhere)

```typescript
// XP thresholds per level
const XP_THRESHOLDS = [0, 100, 250, 500, 1000]; // level 1–5
// XP needed for level N+1 = XP_THRESHOLDS[N] (0-indexed: level 1 = index 0)

// Shield rank colours
const SHIELD_RANK_COLOR: Record<string, string> = {
  beginner: '#6B7280',
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#FFD700',
  elite:    '#FF6B35',
};

// Podium rank ring colours
const PODIUM_COLOR = ['#FFD700', '#C0C0C0', '#CD7F32']; // rank 1, 2, 3
```

---

## Task 1 — Leaderboard Page (`/leaderboard`)

### Route
`apps/social/app/(main)/leaderboard/page.tsx`  
Public page — **no auth required** to view (remove the auth redirect). Auth state still used to show/hide the follow button per teacher.

### SEO metadata
```typescript
export const metadata = {
  title: 'Bảng xếp hạng Giáo viên | tuto.social',
  description: 'Top giáo viên được đánh giá cao nhất trên tuto.social dựa trên Shield tích lũy.',
};
```

### Data query (server component)

```typescript
const { data: teacherRows } = await supabase
  .from('social_profiles')
  .select('id, username, display_name, avatar_url, shield_count, shield_rank, subjects, is_verified, follower_count')
  .eq('role', 'teacher')
  .order('shield_count', { ascending: false })
  .limit(50);
```

No auth check needed — use `supabase.auth.getUser()` to optionally get current user for follow button state, but do not redirect if unauthenticated.

### Page layout

**Hero header:**
```
🏆  Bảng xếp hạng Giáo viên
    Dựa trên Shield tích lũy từ bài đăng giáo dục
```

**Top 3 podium** (ranks 1, 2, 3) — rendered as 3 cards side-by-side (or stacked on mobile):
- Rank 1 in center, slightly larger; ranks 2 and 3 on sides
- Gold/silver/bronze avatar ring border: `ring-4 ring-[#FFD700]` etc.
- Avatar (64×64) with ring colour, display name, shield count with 🛡 icon
- Shield rank pill badge (e.g. "gold") using `SHIELD_RANK_COLOR`
- 1–2 subject tags

**Rank list (4th place onward)** — vertical list:
```
#4  [Avatar 48×48]  Display Name              🛡 42  [silver pill]
                    #username  · Toán · Lý
```
- Tap/click anywhere on row → navigates to `/profile/[username]`
- Alternating `bg-white` / `bg-surface` rows for readability

**Empty state:** "Chưa có giáo viên nào trong bảng xếp hạng"

**How shields are earned** — small info box at bottom of page:
```
💡 Cách tích lũy Shield:
  +5 Shield mỗi bài đăng giáo dục (có môn học)
  +1 Shield mỗi bài đăng thông thường
  +1 Shield mỗi lượt bình luận nhận được
```

### Add to Header navigation

**`apps/social/components/layout/Header.tsx`** — add "Bảng xếp hạng" to the `<nav>` links:
```tsx
<Link href="/leaderboard" className="hover:text-primary transition-colors">
  Bảng xếp hạng
</Link>
```

---

## Task 2 — Creator Dashboard Page (`/dashboard`)

### Route
`apps/social/app/(main)/dashboard/page.tsx`  
Auth-gated — redirect to `/login` if not authenticated. Only shows the logged-in user's own stats.

### SEO metadata
```typescript
export const metadata = {
  title: 'Tổng quan sáng tạo | tuto.social',
};
```

### Data queries (server component)

```typescript
// 1. Current user's social profile
const { data: profile } = await supabase
  .from('social_profiles')
  .select('id, display_name, username, avatar_url, role, xp, level, streak_count, shield_count, shield_rank')
  .eq('user_id', user.id)
  .single();

// 2. Total post count
const { count: totalPosts } = await supabase
  .from('social_posts')
  .select('id', { count: 'exact', head: true })
  .eq('author_id', profile.id);

// 3. Total reel count
const { count: totalReels } = await supabase
  .from('social_reels')
  .select('id', { count: 'exact', head: true })
  .eq('author_id', profile.id);

// 4. Top 5 posts by view_count
const { data: topPosts } = await supabase
  .from('social_posts')
  .select('id, content, view_count, like_count, comments_count, created_at, media_urls')
  .eq('author_id', profile.id)
  .order('view_count', { ascending: false })
  .limit(5);

// 5. Top 5 reels by view_count
const { data: topReels } = await supabase
  .from('social_reels')
  .select('id, caption, view_count, like_count, created_at, thumbnail_url')
  .eq('author_id', profile.id)
  .order('view_count', { ascending: false })
  .limit(5);
```

Compute aggregates:
```typescript
const totalViews = 
  (topPosts ?? []).reduce((s, p) => s + (p.view_count ?? 0), 0) +
  (topReels ?? []).reduce((s, r) => s + (r.view_count ?? 0), 0);

const totalLikes = (topPosts ?? []).reduce((s, p) => s + (p.like_count ?? 0), 0);
const totalComments = (topPosts ?? []).reduce((s, p) => s + (p.comments_count ?? 0), 0);
```

### Page layout

Pass all data as props to a `DashboardClient` client component for tab interactivity.

**Section 1 — XP & Level header** (amber/gold gradient background `from-amber-400 to-orange-500`):
```
[Avatar]  Display Name
          Cấp {level}  🔥 {streakCount} ngày  (streak flame shown if streak ≥ 3)

[XP progress bar]
{currentXP} XP  ──████████░░░░──  Cấp {level+1} ({nextThreshold} XP)
```
XP bar: `currentXP / nextThreshold * 100`% filled. For level 5 (max), show "Cấp tối đa 🏆".

**Section 2 — Stats row** (4 tiles in a row):
```
[📝 Posts]  [🎬 Reels]  [👁 Views]  [❤️ Likes]
  {totalPosts}  {totalReels}  {totalViews}  {totalLikes}
```

**Section 3 — Shield section** (teachers only — show only if `profile.role === 'teacher'`):
```
🛡 {shieldCount} Shield  [{shieldRank} pill]
[Xem bảng xếp hạng →]  ← Link to /leaderboard
```
Next rank threshold info: e.g. "Còn 8 Shield nữa để đạt bronze"

**Section 4 — Tabs** (client-side): "Bài viết" | "Reels"

**Bài viết tab** — list of top 5 posts:
```
[thumbnail if media_urls[0], else content snippet]  👁 {view_count}  ❤️ {like_count}  💬 {comments_count}
```
Each row links to `/post/[id]`.

**Reels tab** — list of top 5 reels:
```
[thumbnail_url image]  caption (truncated)  👁 {view_count}  ❤️ {like_count}
```
No link (reels not viewable on web yet) — non-clickable, or link to `/profile/[username]`.

**Empty state for each tab:** "Chưa có bài viết nào" / "Chưa có Reel nào"

**"Bài đăng của tôi →" link** at bottom — links to `/profile/[profile.username]`

### Split into two files

1. `apps/social/app/(main)/dashboard/page.tsx` — server component with all data fetching
2. `apps/social/app/(main)/dashboard/DashboardClient.tsx` — client component with tab state

### Add to Header user dropdown

**`apps/social/components/layout/Header.tsx`** — in the user dropdown menu (where "Hồ sơ của tôi" lives), add above it:
```tsx
<Link
  href="/dashboard"
  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors"
  onClick={() => setMenuOpen(false)}
>
  Tổng quan sáng tạo
</Link>
```

---

## Task 3 — Progress Tracker + PM Handover

### `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`

Add these rows after the existing Web Platform rows:

```
Web Platform (tuto.social),Leaderboard on web,2,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/leaderboard — public page; top 3 podium + ranked list; shield info box; Header nav link
Web Platform (tuto.social),Creator Dashboard on web,2,Web,P1,Complete,Next.js Engineer,apps/social app,Not needed,/dashboard — auth-gated; XP bar; stats row; top posts/reels tabs; shield section for teachers; Header dropdown link
```

### `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md`

Append an entry to §7 "Dev Agent 10 — Web Sprint 2" covering:
- `/leaderboard` — public teacher ranking page, Header nav link added
- `/dashboard` — creator stats page, Header user dropdown link added
- Both pages reference data already live in DB (shield_count, shield_rank, view_count, xp, level, streak_count)

Also update the web sprint table in §12 to mark Web Sprint 2 as complete.

---

## Key Facts

- **Next.js App Router** — server components by default; `'use client'` only when needed
- **`createSupabaseServerClient()`** — server components and route handlers
- **`apps/social/lib/supabase.ts`** — browser client for client components
- **DB columns confirmed live:** `shield_count`, `shield_rank`, `view_count` (posts + reels), `xp`, `level`, `streak_count`
- **Do NOT create** documentation files unless asked
- **Do NOT touch** `src/` (mobile) or `apps/dashboard/`
- Leaderboard is a **public page** — do not redirect unauthenticated users, just hide the follow button if not logged in
- Creator dashboard is **auth-gated** — redirect to `/login` if no session
