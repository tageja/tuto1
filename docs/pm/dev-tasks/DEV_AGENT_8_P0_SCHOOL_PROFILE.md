# Dev Agent 8 — P0 Gaps: School Profile Page

**Prepared:** 2026-03-21  
**Agent role:** React Native Engineer + Supabase Engineer  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)  
**Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules
3. `docs/qa/bug-register.csv` — do not re-open any closed bug unless you find a new regression

---

## PM Context — Why These Gaps

Parts 1–9 are complete. The following P0 items remain. **This agent owns the school profile group only.** Parent-child account linking and role-assignment-on-registration are deferred (need product decision on linking mechanism). Parent consent flow is deferred (depends on parent-child linking).

---

## Database Schema — Relevant Facts (verified 2026-03-21)

`social_profiles` columns you will use:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Profile ID |
| `user_id` | uuid | Auth user |
| `username` | varchar | Unique handle |
| `display_name` | varchar | School name / person name |
| `bio` | text | School description |
| `avatar_url` | text | School logo |
| `cover_url` | text | Cover photo |
| `role` | varchar | `'school_admin'` / `'teacher'` / `'parent'` / `'student'` |
| `is_verified` | boolean | Verified badge |
| `school_id` | uuid | Identifies which school; shared across all members of that school |
| `follower_count` | integer | |
| `post_count` | integer | |
| `shield_count` | integer | |
| `shield_rank` | text | |

`social_posts` columns:
- `post_type` varchar — can be `'text'` / `'photo'` / `'event'` / `'achievement'` / `'announcement'`
- `is_pinned` boolean — pinned announcements
- `school_id` uuid — school the post belongs to
- `moderation_status` varchar

**School profile data model:**
A school has **one** `social_profiles` row where `role = 'school_admin'`. All users in that school share the same `school_id`. The school page aggregates content by `school_id`.

**No new migrations needed.** All required data is already in existing tables.

---

## Task 1 — Quick Fix: Achievement Post Card Tracker (5 min)

`AchievementCard.tsx` is **already fully implemented** (verified). The progress tracker is wrong.

Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:

| Row | Column | Old Value | New Value |
|-----|--------|-----------|-----------|
| `Achievement System,Achievement post card design` | Status | `Not Started` | `Complete` |
| `Achievement System,Achievement post card design` | Notes | (existing) | `AchievementCard.tsx — gradient header (5 types), emoji, author row, reaction bar, share CTA, compact variant for Creator Dashboard` |

---

## Task 2 — New Service: School Profile queries

Add to **`src/services/social/profile.service.ts`** (do not create a new file — extend the existing one):

```typescript
export interface SchoolProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isVerified: boolean;
  followerCount: number;
  postCount: number;
  schoolId: string;
}

export interface StaffMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  shieldCount: number;
  shieldRank: string;
  isVerified: boolean;
}

// Fetch the school admin profile for a given school_id
export async function getSchoolProfile(schoolId: string): Promise<SchoolProfile | null> {
  const { data } = await socialSupabase
    .from('social_profiles')
    .select('id, username, display_name, bio, avatar_url, cover_url, is_verified, follower_count, post_count, school_id')
    .eq('school_id', schoolId)
    .eq('role', 'school_admin')
    .single();

  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    avatarUrl: data.avatar_url,
    coverUrl: data.cover_url,
    isVerified: data.is_verified,
    followerCount: data.follower_count,
    postCount: data.post_count,
    schoolId: data.school_id,
  };
}

// Fetch teachers belonging to this school — sorted by shield_count DESC
export async function getSchoolStaff(schoolId: string): Promise<StaffMember[]> {
  const { data } = await socialSupabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url, shield_count, shield_rank, is_verified')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(20);

  return (data ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    shieldCount: p.shield_count,
    shieldRank: p.shield_rank,
    isVerified: p.is_verified,
  }));
}

// Fetch pinned + recent announcements for this school
export async function getSchoolAnnouncements(schoolId: string, limit = 20): Promise<SocialPost[]> {
  const { data } = await socialSupabase
    .from('social_posts')
    .select(`
      id, content, post_type, is_pinned, created_at, likes_count, comments_count, view_count,
      author:social_profiles!author_id(id, username, display_name, avatar_url, role, is_verified),
      images
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'announcement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  return mapPostRows(data ?? []);  // use existing mapPostRows helper already in profile.service.ts or feed.service.ts
}

// Fetch recent achievement posts from this school (for spotlight section)
export async function getSchoolAchievementSpotlights(schoolId: string, limit = 6): Promise<SocialPost[]> {
  const { data } = await socialSupabase
    .from('social_posts')
    .select(`
      id, content, post_type, created_at, likes_count,
      author:social_profiles!author_id(id, username, display_name, avatar_url, role, is_verified),
      achievement
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'achievement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(limit);

  return mapPostRows(data ?? []);
}
```

> **Note:** Check how `SocialPost` is mapped in the existing `feed.service.ts` or `profile.service.ts` and reuse the same `mapPostRows` helper (or equivalent). Do not duplicate mapping logic.

---

## Task 3 — New Screen: `src/screens/social/SchoolProfileScreen.tsx`

### Layout

The screen receives `{ schoolId: string }` as route params.

**Sections (top to bottom):**

**1. Cover + header**
- Full-bleed cover image (`cover_url`) or gradient fallback (#0B5FFF → #6366F1)
- School logo (`avatar_url`) overlapping the cover bottom edge, 72×72, rounded-full, white border
- Verified badge (✓) if `isVerified`
- School name (`displayName`) bold, 20px
- Follower count + Follow button (reuse existing `FollowButton` component)

**2. Bio**
- School description (`bio`) — 3 line max, expandable "Xem thêm" / "Rút gọn"

**3. Stats row**
- Posts count · Followers · Staff count (teachers)

**4. Tabs — horizontal scrollable tabs with underline indicator:**
- **Thông báo** (Announcements) — `getSchoolAnnouncements`
- **Giáo viên** (Staff) — `getSchoolStaff`
- **Thành tích** (Achievements) — `getSchoolAchievementSpotlights`

**Announcements tab:**
- FlatList of `PostCard` (reuse existing component) with `is_pinned` posts shown first (📌 pin icon)
- Empty state: megaphone icon + "Chưa có thông báo nào"

**Staff tab:**
- FlatList of compact teacher rows: avatar | name | `isVerified` badge | shield count + rank pill
- Tap → navigate to `SocialProfile` for that teacher
- Empty state: "Chưa có giáo viên nào"

**Achievements tab:**
- 2-column grid of `AchievementCard` (variant `compact`) — reuse existing component
- Empty state: trophy icon + "Chưa có thành tích nào"

### Loading states
- Use `ActivityIndicator` during fetch
- All 3 tabs load lazily (only load data when tab becomes active)

### Error state
- If `getSchoolProfile` returns null: "Không tìm thấy trang trường" with back button

---

## Task 4 — Navigation Wiring

### `src/navigation/SocialStack.tsx`

```typescript
import SchoolProfileScreen from '../screens/social/SchoolProfileScreen';

// Add to SocialStackParamList:
SchoolProfile: { schoolId: string };

// Add screen:
<Stack.Screen
  name="SchoolProfile"
  component={SchoolProfileScreen}
  options={{ headerShown: false }}
/>
```

### Entry points — add navigation to school page from:

**`src/components/social/PostCard.tsx`** — the role badge that shows "Trường học" (school) on posts from school admins. When tapped, navigate to `SchoolProfile` with the post's `school_id`.

**`src/screens/social/SocialProfileScreen.tsx`** — when viewing a `school_admin` profile, show a "Trang trường →" button in the profile actions row that navigates to `SchoolProfile` with `profile.schoolId`.

**`src/screens/social/SocialFeedScreen.tsx`** — optional: the school name in the feed header ("Trường học" tab) can navigate to the school profile for the current user's school.

---

## Task 5 — Translations

Add to `src/translations/index.ts` under both `en` and `vi` `community` blocks (find the section with other community keys):

```typescript
// vi
school: {
  pageTitle:        'Trang trường',
  announcements:    'Thông báo',
  staff:            'Giáo viên',
  achievements:     'Thành tích',
  noAnnouncements:  'Chưa có thông báo nào',
  noStaff:          'Chưa có giáo viên nào',
  noAchievements:   'Chưa có thành tích nào',
  notFound:         'Không tìm thấy trang trường',
  followersCount:   '{count} người theo dõi',
  staffCount:       '{count} giáo viên',
  viewSchoolPage:   'Trang trường →',
},

// en
school: {
  pageTitle:        'School Page',
  announcements:    'Announcements',
  staff:            'Staff',
  achievements:     'Achievements',
  noAnnouncements:  'No announcements yet',
  noStaff:          'No staff listed yet',
  noAchievements:   'No achievements yet',
  notFound:         'School page not found',
  followersCount:   '{count} followers',
  staffCount:       '{count} teachers',
  viewSchoolPage:   'School Page →',
},
```

---

## Task 6 — Progress Tracker + PM Handover Updates

### `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`

Update these rows:

| Feature | New Status |
|---------|-----------|
| `Achievement System, Achievement post card design` | `Complete` |
| `School Page, School profile page` | `Complete` |
| `School Page, School announcements feed` | `Complete` |
| `School Page, Staff directory (teacher list)` | `Complete` |
| `School Page, Achievement spotlights` | `Complete` |

### `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md`

Add a §7 entry for "Dev Agent 8 — P0 School Profile Sprint" describing:
- `SchoolProfileScreen.tsx` — 3-tab layout (announcements / staff / achievements)
- Service functions added to `profile.service.ts`
- Navigation wired from PostCard role badge, SocialProfileScreen (school_admin), optional feed header
- Tracker updated for achievement card + school page group

---

## Deferred P0 Items (NOT in this sprint — do not implement)

These are excluded because they require product decisions not yet made:

| Feature | Reason deferred |
|---------|----------------|
| Parent-child account linking | Linking mechanism not decided (QR code? student ID? email code?) |
| School account linking | Same — product decision pending |
| Role assignment on registration | Existing Tuto users already have roles; new self-signup flow is a separate auth project |
| Parent consent flow for student posts | Depends on parent-child linking (excluded above) |
| Tuto HQ moderation for teacher posts | Requires OpenAI key + human review queue infrastructure |
| Auto-share consent popup | Requires school dashboard webhook integration |

---

## Key Facts (do not forget)

- **Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)
- **Mobile app:** `src/` (React Native/Expo)
- **Supabase client:** check `src/services/social/api.client.ts` for `socialSupabase`
- **Metro cache trap:** kill port 8081 + clear `.expo` + `node_modules/.cache` → `npx expo start --clear`
- **Test accounts:** `tarun_apollo` (admin / iPhone 17 Pro), `we_are_banana_republic_uI87` (parent / iPhone 17 Pro Max)
- **Do NOT touch** `apps/social/` or `apps/dashboard/` — all work is in `src/` (mobile)
- **Do NOT create** documentation files unless explicitly asked
- **Reuse** existing components: `PostCard`, `AchievementCard` (compact variant), `FollowButton`, `RoleBadge`, `ModerationBadge`
- **Check** how existing screens like `SocialProfileScreen.tsx` are structured before building `SchoolProfileScreen` — follow the same patterns
