# Dev Agent 6 — Apply Migrations + Part 8: Creator Tools & Analytics

**Prepared:** 2026-03-21  
**Agent role:** Supabase Engineer + React Native Engineer  
**Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)

---

## Mandatory Reading (before touching any file)

1. `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — full project context  
2. `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` — architecture rules  
3. `docs/qa/bug-register.csv` — all bugs closed, do not re-open unless you find a new one

---

## Priority 1 — Apply Pending Migrations (BLOCKING — do this first)

None of migrations 073–078 have been applied to Supabase yet. All Part 7 and Part 9 features are non-functional until these run. Apply them **in order** using the `user-supabase-tuto` MCP `apply_migration` tool or by pasting the SQL into `execute_sql`.

| Order | File | What it does |
|-------|------|-------------|
| 1 | `supabase/migrations/073_social_profiles_push_streak_notifications.sql` | Adds `push_token`, `streak_count`, `last_streak_date` to `social_profiles`; adds `reel_id` column + `reel_like` type to `social_notifications` |
| 2 | `supabase/migrations/074_social_notification_triggers.sql` | DB triggers: like → notification, comment → notification, follow → notification, reel_like → notification |
| 3 | `supabase/migrations/075_social_xp_level_streak_triggers.sql` | XP triggers (post +10, reel +20, like +5, comment +3, follow +15), level-up detection, `create_level_up_post()` RPC, `update_streak()` RPC |
| 4 | `supabase/migrations/076_social_reels_revert_moderation_default.sql` | **Reverts QA bypass** — sets `social_reels.moderation_status` default back to `'pending'` |
| 5 | `supabase/migrations/077_social_reports_blocks.sql` | Creates `social_reports`, `social_blocks`, `social_mutes` tables with RLS |
| 6 | `supabase/migrations/078_social_moderation_rejected_and_parental.sql` | Adds `'rejected'` to `social_posts` moderation constraint; adds `parental_settings` JSONB to `social_profiles` |

**Verify after 073:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'social_profiles'
AND column_name IN ('push_token', 'streak_count', 'last_streak_date');
-- Should return 3 rows
```

**Verify after 077:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('social_reports', 'social_blocks', 'social_mutes');
-- Should return 3 rows
```

---

## Priority 2 — Configure Database Webhook for Push Notifications (manual step)

The `social-notify` Edge Function is deployed and ready. It needs a Database Webhook to fire it on every `social_notifications INSERT`. **This cannot be done via migration — it must be done manually in the Supabase Dashboard.**

Steps:
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
5. Save

Document that this was done by adding a note to `docs/qa/` — create `docs/qa/WEBHOOK_SETUP.md` confirming the webhook is configured.

---

## Priority 3 — Part 8: Creator Tools & Analytics

### Background
Parts 1–7 complete. Part 9 partially complete (migrations just applied above). Part 8 is Creator Tools — gives authors visibility into how their content is performing. This feeds into teacher discovery and gamification.

### 3.1 Migration `079_social_post_views.sql`

Add view tracking to posts and reels:

```sql
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;
ALTER TABLE social_reels ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- RPC to increment view (called from mobile, debounced per session)
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

### 3.2 Mobile service — `src/services/social/analytics.service.ts`

Already exists (stub). Implement:

- `getCreatorStats(profileId)` — return aggregate stats for a profile:
  ```typescript
  {
    totalPosts: number;
    totalReels: number;
    totalViews: number;       // sum of view_count
    totalLikes: number;       // sum of likes_count
    totalComments: number;    // sum of comments_count
    topPosts: PostSummary[];  // top 5 by view_count
    topReels: ReelSummary[];  // top 5 by view_count
    xp: number;
    level: number;
    streakCount: number;
  }
  ```
- `incrementViewCount(type: 'post'|'reel', id: string)` — calls `increment_view_count` RPC. Debounce: track viewed IDs in a `Set` per session (module-level), only call RPC once per content item per app session.

### 3.3 Mobile screen — `src/screens/social/CreatorDashboardScreen.tsx`

New screen accessible from the Profile tab. Shows:

**Header section:**
- XP bar (current XP / next level threshold) with level badge
- Streak flame badge (streak_count ≥ 3)
- Total stats row: Posts · Reels · Views · Likes

**Top content section:**
- "Your top posts" — horizontal scroll of top 5 posts by views, showing thumbnail, view count, like count
- "Your top reels" — same for reels

**Design:** Use `achievement` gradient colors from theme (`#F59E0B → #F97316`) for the XP section. Gold/amber palette.

Add `CreatorDashboard` to `SocialStack.tsx` and link from `SocialProfileScreen` — a "Creator Dashboard" button visible only when viewing own profile.

### 3.4 View count tracking in feed

In `src/screens/social/SocialFeedScreen.tsx` — the `FlatList` already has `onViewableItemsChanged`. Wire it to call `incrementViewCount('post', id)` for each post that becomes >50% visible. Use `viewabilityConfig: { itemVisiblePercentThreshold: 50 }`.

Same pattern in `ReelsScreen.tsx` for reels.

### 3.5 Teacher Shield system

Shields are defined in `rules.tuto-social.mdc`. Implement in migration `080_social_teacher_shields.sql`:

```sql
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS shield_count INT NOT NULL DEFAULT 0;
ALTER TABLE social_profiles ADD COLUMN IF NOT EXISTS shield_rank TEXT NOT NULL DEFAULT 'beginner'
  CHECK (shield_rank IN ('beginner', 'bronze', 'silver', 'gold', 'elite'));

-- Trigger: on social_posts INSERT, if author role = 'teacher'
-- +5 shields if post has subjects (educational), +1 otherwise
-- Update shield_rank based on thresholds:
-- beginner=0, bronze=50, silver=150, gold=400, elite=1000
```

Show `shield_count` and `shield_rank` badge on teacher profiles in `ProfileHeader.tsx`.

---

## Key Facts (do not forget)

- **Supabase project:** tuto-social (MCP server: `user-supabase-tuto`)  
- **Supabase URL:** `https://fkjeggdxqifqqwhuqpgm.supabase.co`  
- **Mobile:** `src/` (React Native/Expo), Supabase only  
- **Metro cache trap:** If a fix doesn't show in simulator → kill port 8081, clear `.expo` + `node_modules/.cache`, run `npx expo start --clear`  
- **Test accounts:** `tarun_apollo` (admin / iPhone 17 Pro), `we_are_banana_republic_uI87` (parent / iPhone 17 Pro Max)  
- **QA bypass reverted:** Migration 076 sets `social_reels.moderation_status` default back to `'pending'` — this is correct for production  
- **AI moderation:** `OPENAI_API_KEY` not configured. The `social-moderation` Edge Function already handles this gracefully (no-op). When key is available, add it in Supabase Dashboard → Edge Functions → Secrets  
- **After finishing:** Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` for all Part 8 items completed, and update `docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` section §7 with what was done
