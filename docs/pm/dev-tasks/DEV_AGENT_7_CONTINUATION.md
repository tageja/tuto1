# Dev Agent 7 — Continuation: Leaderboard, Shield Triggers & Moderation Badge Fix

**Prepared:** 2026-03-21  
**Agent role:** React Native Engineer + Supabase Engineer  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context  
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules

---

## What Is Already Done (do NOT re-implement)

- `src/components/social/AchievementCard.tsx` ✅ — fully built with gradient header, emoji, author row, reaction bar, share CTA, compact variant
- `src/components/social/ModerationBadge.tsx` ✅ — built with `ai_reviewed`, `pending`, `parent_approved` states. Already rendered in `PostCard.tsx`
- `supabase/migrations/080_social_teacher_shields.sql` ✅ — `shield_rank` column and `trg_award_teacher_shields` trigger on `social_posts` are live in DB
- `src/components/social/ProfileHeader.tsx` ✅ — shield badge already shown on teacher profiles
- `src/screens/social/CreatorDashboardScreen.tsx` ✅ — built and registered in `SocialStack`

---

## Task 1 — Fix `ModerationStatus` type and `ModerationBadge` (15 min)

### Problem

Migration `078_social_moderation_rejected_and_parental.sql` added `'rejected'` as a valid value for `social_posts.moderation_status`. The TypeScript type and UI component were never updated to reflect this.

**File:** `src/types/social/common.types.ts` line 33:
```typescript
// CURRENT (broken — missing 'rejected')
export type ModerationStatus = 'ai_reviewed' | 'pending' | 'parent_approved';

// CORRECT
export type ModerationStatus = 'ai_reviewed' | 'pending' | 'parent_approved' | 'rejected';
```

**File:** `src/components/social/ModerationBadge.tsx`

Add `rejected` to the `CONFIG` and `LABEL_KEY` maps:

```typescript
rejected: { bg: '#FEF2F2', icon: 'cancel', color: '#DC2626' },
```

```typescript
rejected: 'community.moderation.rejected',
```

**File:** `src/translations/index.ts`

Add the missing key under both `vi` and `en` blocks (look for existing `community.moderation.*` keys):

```typescript
// vi
'community.moderation.rejected': 'Bị từ chối',
// en
'community.moderation.rejected': 'Rejected',
```

---

## Task 2 — Migration `081_social_shield_on_comment.sql`

Shield triggers currently only fire on `social_posts` INSERT. A teacher should also earn +1 shield when they receive a comment on their post. Add this migration:

```sql
-- supabase/migrations/081_social_shield_on_comment.sql

CREATE OR REPLACE FUNCTION award_shield_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_role        TEXT;
BEGIN
  -- Find the post author
  SELECT author_id INTO v_post_author
  FROM social_posts
  WHERE id = NEW.post_id;

  IF v_post_author IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only award if post author is a teacher
  SELECT role INTO v_role
  FROM social_profiles
  WHERE id = v_post_author;

  IF v_role <> 'teacher' THEN
    RETURN NEW;
  END IF;

  -- Do not award shield for own comment on own post
  IF NEW.author_id = v_post_author THEN
    RETURN NEW;
  END IF;

  UPDATE social_profiles
  SET
    shield_count = shield_count + 1,
    shield_rank = CASE
      WHEN shield_count + 1 >= 1000 THEN 'elite'
      WHEN shield_count + 1 >= 400  THEN 'gold'
      WHEN shield_count + 1 >= 150  THEN 'silver'
      WHEN shield_count + 1 >= 50   THEN 'bronze'
      ELSE 'beginner'
    END
  WHERE id = v_post_author;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_shield_on_comment
  AFTER INSERT ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION award_shield_on_comment();
```

Apply via `user-supabase-tuto` MCP `execute_sql`, then save the file.

**Verify:**
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_shield_on_comment';
-- Should return 1 row
```

---

## Task 3 — `src/screens/social/LeaderboardScreen.tsx` (main task)

### Background

`shield_count` and `shield_rank` are now live on `social_profiles` and awarded automatically. The leaderboard makes this gamification visible, driving teachers to post educational content.

### What to build

A **full-screen leaderboard** showing teachers ranked by `shield_count` descending.

**Data query** (add to `src/services/social/analytics.service.ts`):

```typescript
export interface LeaderboardEntry {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  shieldCount: number;
  shieldRank: string;
  subjects: string[];
  isVerified: boolean;
}

export async function getTeacherLeaderboard(limit = 20, offset = 0): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from('social_profiles')
    .select('id, display_name, username, avatar_url, role, shield_count, shield_rank, subjects, is_verified')
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .range(offset, offset + limit - 1);

  return (data ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name,
    username: p.username,
    avatarUrl: p.avatar_url,
    role: p.role,
    shieldCount: p.shield_count,
    shieldRank: p.shield_rank,
    subjects: p.subjects ?? [],
    isVerified: p.is_verified ?? false,
  }));
}
```

**Screen layout (`src/screens/social/LeaderboardScreen.tsx`):**

- **Header:** "Bảng xếp hạng giáo viên" title + subtitle "Dựa trên điểm Shield tích lũy"
- **Top 3 podium** — rows 1, 2, 3 shown with larger cards + gold/silver/bronze ring on avatar
- **Rank list (4th onward)** — FlatList with compact rows: rank number | avatar | name + subject chips | shield count + rank pill
- **Pagination:** load 20 at a time; `onEndReached` loads next page
- **Empty state:** if no teachers yet — shield icon + "Chưa có giáo viên nào" message
- **Tap a row** → navigate to `SocialProfile` screen for that teacher

**Design:** Use amber/gold palette consistent with `CreatorDashboardScreen`. Rank 1 = `#FFD700`, rank 2 = `#C0C0C0`, rank 3 = `#CD7F32`.

**Shield rank pill colours** (same as `ProfileHeader`):
```
beginner = #6B7280 (gray)
bronze   = #CD7F32
silver   = #C0C0C0
gold     = #FFD700
elite    = #FF6B35
```

### Navigation wiring

**`src/navigation/SocialStack.tsx`:**
- Import `LeaderboardScreen`
- Add to `SocialStackParamList`: `Leaderboard: undefined`
- Add `<Stack.Screen name="Leaderboard" component={LeaderboardScreen} />`

**`src/screens/social/CreatorDashboardScreen.tsx`:**
- In the shield section (already built for teachers), add a `TouchableOpacity` button labelled "Xem bảng xếp hạng →" that navigates to `Leaderboard`
- Show this button for all roles (anyone can view the leaderboard), not just teachers

**`src/screens/social/SocialProfileScreen.tsx`:**
- For teacher profiles (`profile.role === 'teacher'`), add a small tappable "Xem bảng xếp hạng" link near the shield badge row (already rendered in `ProfileHeader`)

---

## Task 4 — Update Progress Tracker

When done, update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` for these rows:

| Row | New Status |
|-----|-----------|
| Teacher Shields / Gamification → Shield award logic (comments received) | Complete |
| Teacher Shields / Gamification → Teacher ranking leaderboard | Complete |
| Moderation System → Moderation badge display on posts | Complete |

And update `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` §7 with a brief note on what was completed in this session.

---

## Key Facts

- **Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)
- **Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`
- **Mobile:** `src/` (React Native/Expo); Supabase client at `src/services/social/api.client.ts` (exported as `socialSupabase`) or check `src/services/supabase.ts`
- **Metro cache trap:** kill port 8081 + clear `.expo` + `node_modules/.cache` → `npx expo start --clear`
- **Test accounts:** `tarun_apollo` (admin / iPhone 17 Pro), `we_are_banana_republic_uI87` (parent / iPhone 17 Pro Max)
- **Do NOT re-implement** anything listed in the "What Is Already Done" section above
- **Do NOT create** documentation files unless asked
- **Do not touch** `apps/social/` (web) or `apps/dashboard/` — all work is in `src/` (mobile)
