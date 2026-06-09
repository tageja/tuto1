# Dev Agent 7 — Part 8: Creator Tools & Analytics

**Prepared:** 2026-03-21  
**Agent role:** Supabase Engineer + React Native Engineer  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context  
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules  
3. `docs/qa/bug-register.csv` — all bugs closed, do not re-open unless you find a new one

---

## Database Status (verified 2026-03-21 via MCP)

These are already applied — do NOT re-apply:

| Migration | Status | Notes |
|-----------|--------|-------|
| 073 – push_token / streak cols | ✅ Applied | `push_token`, `streak_count`, `last_streak_date` exist on `social_profiles` |
| 074 – notification triggers | ✅ Applied | like/comment/follow/reel_like triggers active |
| 075 – XP / level / streak RPCs | ✅ Applied | `add_xp_and_check_level`, `update_streak`, `create_level_up_post` RPCs exist |
| 076 – revert reels bypass | ✅ Applied | `social_reels.moderation_status` defaults to `'pending'` ✅ |
| 077 – reports / blocks / mutes | ✅ Applied | `social_reports`, `social_blocks`, `social_mutes` tables exist |
| 078 – rejected status + parental | ✅ Applied | `parental_settings` JSONB on `social_profiles` exists |
| `view_count` on posts + reels | ✅ Exists | Both `social_posts.view_count` and `social_reels.view_count` columns exist |

**What is NOT yet done (your work):**
- `increment_view_count` RPC — **does not exist**, needs migration
- `shield_rank` column on `social_profiles` — **does not exist**, needs migration 080
- Teacher shield award trigger — **not implemented**
- `analytics.service.ts` — **does not exist** in `src/services/social/`
- `CreatorDashboardScreen.tsx` — **does not exist** in `src/screens/social/`
- View tracking wired in `SocialFeedScreen` + `ReelsScreen` — **not done**
- Database Webhook for push notifications — **not configured**

---

## Priority 1 — Configure Database Webhook (manual — cannot be scripted)

The `social-notify` Edge Function is deployed and waiting. It fires push notifications whenever a `social_notifications` row is inserted, but there is no trigger connecting the DB to the function yet.

**Steps (do this in Supabase Dashboard, not via code):**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → select `tuto-social` project
2. Left sidebar → **Database** → **Webhooks**
3. Click **Create a new hook**
4. Configure:
   - **Name:** `notify_on_social_notification_insert`
   - **Table:** `social_notifications`
   - **Events:** `INSERT` only
   - **Type:** HTTP Request
   - **URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co/functions/v1/social-notify`
   - **HTTP Headers:** Add `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
5. Save and verify it appears in the list

Create `docs/qa/WEBHOOK_SETUP.md` confirming this was done (one paragraph, date, who configured it).

---

## Priority 2 — Migration `079_social_increment_view_rpc.sql`

The `view_count` columns already exist on `social_posts` and `social_reels`. You only need to create the RPC:

```sql
-- supabase/migrations/079_social_increment_view_rpc.sql
CREATE OR REPLACE FUNCTION increment_view_count(
  p_content_type TEXT,  -- 'post' or 'reel'
  p_content_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_content_type = 'post' THEN
    UPDATE social_posts SET view_count = view_count + 1 WHERE id = p_content_id;
  ELSIF p_content_type = 'reel' THEN
    UPDATE social_reels SET view_count = view_count + 1 WHERE id = p_content_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(TEXT, UUID) TO authenticated;
```

Apply via `user-supabase-tuto` MCP `execute_sql`, then save the file.

**Verify:**
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'increment_view_count';
-- Should return 1 row
```

---

## Priority 3 — Migration `080_social_teacher_shields.sql`

Add `shield_rank` column and an auto-update trigger for teachers:

```sql
-- supabase/migrations/080_social_teacher_shields.sql
ALTER TABLE social_profiles
  ADD COLUMN IF NOT EXISTS shield_rank TEXT NOT NULL DEFAULT 'beginner'
  CHECK (shield_rank IN ('beginner','bronze','silver','gold','elite'));

-- Trigger function: award shields on educational posts by teachers
CREATE OR REPLACE FUNCTION award_teacher_shields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_shields INT;
BEGIN
  -- Only for teacher posts
  SELECT role INTO v_role FROM social_profiles WHERE id = NEW.author_id;
  IF v_role <> 'teacher' THEN
    RETURN NEW;
  END IF;

  -- +5 if educational (has subjects), +1 otherwise
  IF NEW.subjects IS NOT NULL AND jsonb_array_length(NEW.subjects) > 0 THEN
    v_shields := 5;
  ELSE
    v_shields := 1;
  END IF;

  UPDATE social_profiles
  SET
    shield_count = shield_count + v_shields,
    shield_rank = CASE
      WHEN shield_count + v_shields >= 1000 THEN 'elite'
      WHEN shield_count + v_shields >= 400  THEN 'gold'
      WHEN shield_count + v_shields >= 150  THEN 'silver'
      WHEN shield_count + v_shields >= 50   THEN 'bronze'
      ELSE 'beginner'
    END
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_teacher_shields
  AFTER INSERT ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION award_teacher_shields();
```

Apply via MCP `execute_sql`, then save the file.

**Verify:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'social_profiles' AND column_name = 'shield_rank';
-- Should return 1 row
```

---

## Priority 4 — `src/services/social/analytics.service.ts`

Create this file. The `view_count` columns and `increment_view_count` RPC (from Priority 2) are the backend dependencies.

```typescript
// src/services/social/analytics.service.ts
import { supabase } from '../supabase';

export interface PostSummary {
  id: string;
  content: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface ReelSummary {
  id: string;
  caption: string | null;
  view_count: number;
  likes_count: number;
  created_at: string;
}

export interface CreatorStats {
  totalPosts: number;
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  topPosts: PostSummary[];
  topReels: ReelSummary[];
  xp: number;
  level: number;
  streakCount: number;
  shieldCount: number;
  shieldRank: string;
}

// Session-level dedup — only call RPC once per content item per app session
const viewedIds = new Set<string>();

export async function incrementViewCount(
  type: 'post' | 'reel',
  id: string,
): Promise<void> {
  const key = `${type}:${id}`;
  if (viewedIds.has(key)) return;
  viewedIds.add(key);

  await supabase.rpc('increment_view_count', {
    p_content_type: type,
    p_content_id: id,
  });
}

export async function getCreatorStats(profileId: string): Promise<CreatorStats> {
  const [profileRes, postsRes, reelsRes] = await Promise.all([
    supabase
      .from('social_profiles')
      .select('xp, level, streak_count, shield_count, shield_rank')
      .eq('id', profileId)
      .single(),
    supabase
      .from('social_posts')
      .select('id, content, view_count, likes_count, comments_count, created_at')
      .eq('author_id', profileId)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase
      .from('social_reels')
      .select('id, caption, view_count, likes_count, created_at')
      .eq('author_id', profileId)
      .order('view_count', { ascending: false })
      .limit(5),
  ]);

  const profile = profileRes.data;
  const posts = postsRes.data ?? [];
  const reels = reelsRes.data ?? [];

  const totalViews =
    posts.reduce((s, p) => s + (p.view_count ?? 0), 0) +
    reels.reduce((s, r) => s + (r.view_count ?? 0), 0);

  const totalLikes = posts.reduce((s, p) => s + (p.likes_count ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments_count ?? 0), 0);

  return {
    totalPosts: posts.length,
    totalReels: reels.length,
    totalViews,
    totalLikes,
    totalComments,
    topPosts: posts as PostSummary[],
    topReels: reels as ReelSummary[],
    xp: profile?.xp ?? 0,
    level: profile?.level ?? 1,
    streakCount: profile?.streak_count ?? 0,
    shieldCount: profile?.shield_count ?? 0,
    shieldRank: profile?.shield_rank ?? 'beginner',
  };
}
```

---

## Priority 5 — `src/screens/social/CreatorDashboardScreen.tsx`

New screen accessible from the own profile. Design uses achievement palette: amber/gold.

**What to build:**
- Header: XP progress bar (current XP / threshold for next level), level badge pill, streak flame badge (only shown when streak_count ≥ 3)
- Stats row: Posts · Reels · Views · Likes (4 stat tiles)
- "Your top posts" — horizontal `FlatList` of top 5 posts, each card shows thumbnail (if photo), content snippet (truncated 2 lines), view icon + count, like icon + count
- "Your top reels" — same for reels (show video thumbnail via `video_url` + a play icon overlay)
- Shield section (teachers only): shield count + rank badge pill

**Wiring:**
- Add `CreatorDashboard` screen to `src/navigation/SocialStack.tsx`
- In `src/screens/social/SocialProfileScreen.tsx` — add a "Creator Dashboard" `TouchableOpacity` button in the profile actions row, visible **only when `isOwnProfile === true`**
- Navigate with `navigation.navigate('CreatorDashboard')`

**XP level thresholds** (from `rules.tuto-social.mdc`):
```
Level 1: 0–99 XP
Level 2: 100–249 XP
Level 3: 250–499 XP
Level 4: 500–999 XP
Level 5: 1000+ XP
```

Use `shieldRank` colors: beginner=gray, bronze=`#CD7F32`, silver=`#C0C0C0`, gold=`#FFD700`, elite=`#FF6B35`.

---

## Priority 6 — Wire view tracking in feeds

### `src/screens/social/SocialFeedScreen.tsx`

The `FlatList` should already have an `onViewableItemsChanged` callback or be ready for one. Add:

```typescript
import { incrementViewCount } from '../../services/social/analytics.service';

const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
  viewableItems.forEach(({ item }: any) => {
    if (item?.id) {
      incrementViewCount('post', item.id);
    }
  });
});

// In FlatList:
// viewabilityConfig={viewabilityConfig.current}
// onViewableItemsChanged={onViewableItemsChanged.current}
```

### `src/screens/social/ReelsScreen.tsx`

Same pattern but with `'reel'` as the type.

---

## Priority 7 — Shield badge on teacher profiles

In `src/components/social/ProfileHeader.tsx` (or equivalent), show `shield_count` and `shield_rank` **only when `profile.role === 'teacher'`**. 

Add a small row below the follow button with a shield icon (MaterialIcons `shield`) + count + rank pill.

---

## Progress Tracker Update

When done, update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` for these rows:
- Teacher Shields / Gamification → all 5 rows → `Complete`
- Success Metrics → Parent view rate, Weekly Active Posters → `In Progress` (tracking is now wired)
- Design System → Component library (React Native) → `Complete`

And update `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` §7 with a brief summary of Part 8 completion.

---

## Key Facts (do not forget)

- **Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)
- **Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`
- **Mobile app:** `src/` (React Native/Expo), Supabase JS client at `src/services/supabase.ts`
- **Metro cache trap:** kill port 8081 + clear `.expo` + `node_modules/.cache` → `npx expo start --clear`
- **Test accounts:** `tarun_apollo` (admin / iPhone 17 Pro), `we_are_banana_republic_uI87` (parent / iPhone 17 Pro Max)
- **AI moderation:** intentionally non-functional — `OPENAI_API_KEY` not set. Do not change this.
- **Do not re-apply** migrations 073–078 — they are already live in production
- **Do not create** documentation files unless explicitly asked
