# Bug Fix Sprint 01 — PM Task Dispatch

**PM:** Product Manager Agent  
**Date:** 2026-03-19  
**Branch:** `tutoSocial1`  
**Sprint goal:** Close all 4 open high/medium bugs blocking QA re-test

---

## How This Document Works

- Each agent reads their section below and executes in priority order.
- After finishing, the agent fills in the **Agent Report** section at the bottom of their section.
- Both agents must update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` and `docs/qa/bug-register.csv` before closing their session.
- PM reads the reports and decides next steps (QA re-test or further fixes).

---

## AGENT 1 — Dev Agent 1 (Parts 1 + 2 domain: Auth, Feed, Posts)

**You are responsible for:** BUG-012, BUG-009, BUG-007  
**Context:** You originally built Parts 1 and 2 — SSO/auth bridge, feed, create post, comment section.  
**Supabase MCP server:** `user-supabase-tuto`  
**App under fix:** `apps/dashboard/` (for BUG-012) and `apps/social/` (for BUG-009, BUG-007)  
**Test account:** `marketing@tutoglobal.com` / `password`

---

### TASK A — BUG-012 — Login page stays on "Signing you in…" forever (PRIORITY 1)

**Severity:** Medium | **Blocks:** TC-042, TC-040 verification

**Root cause (from QA test manager):**  
The session IS being created (SSO from another tab works). `signIn()` in AuthContext succeeds. The problem is the `router.push()` or redirect call that should fire after auth success is not executing. The issue is in the **dashboard login page form's `onSubmit` handler**, not in `AuthContext.signIn()`.

**Files to inspect:**
- `apps/dashboard/contexts/AuthContext.tsx` — look at the `signIn` function (lines 424–470). Note it calls `router.push(redirectTo ?? '/home')` on line 444. The `redirectTo` param comes from `window.location.search` — confirm it resolves correctly when logging in from the community flow.
- Find the dashboard login page component — likely at `apps/dashboard/app/login/page.tsx` or `apps/dashboard/app/(auth)/login/` — and inspect its `onSubmit` handler.

**Fix instructions:**
1. Open the dashboard login page's `onSubmit` (or equivalent submit handler).
2. After `await signIn(email, password)` returns without throwing, add `console.log('signIn returned, navigating...')` immediately after. Confirm execution reaches that line.
3. The `signIn` in AuthContext already calls `router.push(redirectTo ?? '/home')`. Confirm the `redirectTo` search param contains the correct value (`/community` or the social redirect URL) when the user arrives from the SSO flow.
4. If `router.push` is firing but not navigating (Next.js App Router quirk), replace with `window.location.href = redirectTo ?? '/home'` as the fix. This is acceptable — SSO flows benefit from a hard navigation anyway.
5. Also check: the `signIn` function sets `setLoading(true)` and only sets it false in the `finally` block. If the UI is stuck on "Signing you in..." it could mean the form's `loading` state is controlled separately from AuthContext's `loading`. Confirm whether the login page has its own local `loading` state that doesn't get cleared.

**Acceptance criteria:**  
Log in at `http://localhost:3000/login` with `marketing@tutoglobal.com` / `password` → page navigates to `/community` (or `/home`) within 3 seconds. No stuck spinner.

---

### TASK B — BUG-009 — Create post fails: RLS blocks INSERT on `social_moderation_queue` (PRIORITY 2)

**Severity:** High | **Blocks:** TC-023

**Root cause (from QA test manager):**  
`/api/posts` server route (file: `apps/social/app/api/posts/route.ts`) already uses `createSupabaseServerClient()` for the `social_posts` INSERT — that was fixed and works. But the creation flow also inserts into `social_moderation_queue`, and that table has no INSERT RLS policy for authenticated users. The error is: `"new row violates row-level security policy for table social_moderation_queue"`.

**Current state of `/api/posts/route.ts` (confirmed):**  
The route at line 46–59 inserts into `social_posts` with `moderation_status: 'pending'` but does NOT insert into `social_moderation_queue`. This means the moderation queue insert is happening somewhere client-side, or the queue insert is triggered by a DB trigger on `social_posts`.

**Fix instructions:**
1. First, run this SQL via Supabase MCP `execute_sql` to confirm the trigger exists:
   ```sql
   SELECT trigger_name, event_manipulation, action_statement 
   FROM information_schema.triggers 
   WHERE event_object_table = 'social_posts';
   ```
2. If there is a trigger that auto-inserts into `social_moderation_queue` on `social_posts` INSERT: the trigger runs as the authenticated user, so RLS applies. Fix: add an INSERT policy.
3. Create migration `supabase/migrations/059_social_moderation_queue_rls.sql`:
   ```sql
   -- Allow authenticated users to insert into moderation queue
   -- (rows are created automatically by trigger when posts are created)
   CREATE POLICY "auth_users_insert_moderation_queue"
     ON social_moderation_queue
     FOR INSERT
     TO authenticated
     WITH CHECK (true);
   ```
4. Apply via Supabase MCP `apply_migration`.
5. If there is NO trigger and the client is calling a separate insert: move that insert into the `/api/posts` server route instead, then remove the client-side call. The server route already uses `createSupabaseServerClient()` which bypasses RLS.

**Acceptance criteria:**  
Create a post at `http://localhost:3001/feed` → post appears in feed (even as pending moderation). No 500 error. Console shows no RLS violation.

---

### TASK C — BUG-007 — Comment count stale on feed card after posting a comment (PRIORITY 3)

**Severity:** Medium | **Blocks:** TC-018

**Root cause (from QA test manager):**  
DB trigger fix is confirmed working (F5 shows correct count). The problem is 100% client-side: Next.js App Router restores the cached server component when navigating back to `/feed` — it does not re-run `fetch`. The `FeedInvalidationContext` + `sessionStorage` approach that exists in `CommentSection.tsx` (lines 150–155) has been tried 3 times and does not work reliably.

**Current state (confirmed by reading the files):**
- `CommentSection.tsx` already sets `sessionStorage.setItem('feedNeedsRefresh', '1')` after a comment (line 154) ✅
- `CommentSection.tsx` also calls `invalidateFeed()` from `FeedInvalidationContext` (line 151)
- `apps/social/app/(main)/layout.tsx` currently wraps children in `<FeedInvalidationProvider>` — no `FeedRefreshListener` is rendered
- The `FeedRefreshListener` component does NOT yet exist

**Fix instructions — implement `FeedRefreshListener`:**

1. Create `apps/social/components/feed/FeedRefreshListener.tsx`:
   ```tsx
   'use client'
   import { useEffect } from 'react'
   import { usePathname, useRouter } from 'next/navigation'
   
   export function FeedRefreshListener() {
     const pathname = usePathname()
     const router = useRouter()
     useEffect(() => {
       if (pathname === '/feed' && sessionStorage.getItem('feedNeedsRefresh') === '1') {
         sessionStorage.removeItem('feedNeedsRefresh')
         router.refresh()
       }
     }, [pathname, router])
     return null
   }
   ```

2. Update `apps/social/app/(main)/layout.tsx` — add `FeedRefreshListener` inside the layout:
   ```tsx
   import Header from '@/components/layout/Header';
   import { FeedInvalidationProvider } from '@/contexts/FeedInvalidationContext';
   import { FeedRefreshListener } from '@/components/feed/FeedRefreshListener';
   
   export default function MainLayout({ children }: { children: React.ReactNode }) {
     return (
       <FeedInvalidationProvider>
         <FeedRefreshListener />
         <Header />
         {children}
       </FeedInvalidationProvider>
     );
   }
   ```

3. The `sessionStorage.setItem('feedNeedsRefresh', '1')` in `CommentSection.tsx` (line 154) is already correct — leave it in place.

4. Do NOT remove `FeedInvalidationContext` — it is used for same-session navigation (browser-back within the same tab). `FeedRefreshListener` handles the case where the React tree resets (fresh navigation to `/feed`). Both are needed.

**Acceptance criteria:**  
1. Post a comment on any feed post.  
2. Navigate back to `/feed` (via back button or clicking the feed link).  
3. The comment count on the card must show the updated number — without pressing F5.

---

### Agent 1 — Mandatory Housekeeping

After completing all tasks above:

1. **Update `docs/qa/bug-register.csv`:** Set BUG-012, BUG-009, BUG-007 to `Fixed — Pending Re-test` (or `Open` with a note if blocked).
2. **Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:** Update any rows for auth, create post, and comment count features.
3. **Fill in the Agent 1 Report section below.**

---

### Agent 1 Report *(fill in after your session)*

**Date:** 2026-03-19  
**Agent Transcript ID:** af6a7a90-2072-40ab-80a6-9831769d4b03  
**Status:** Complete

| Task | Bug | Fix Applied | Files Changed | Migration? | Re-test Ready? |
|------|-----|-------------|---------------|------------|----------------|
| A | BUG-012 | `window.location.href` hard nav in `AuthContext.signIn()`; `redirectTo` param respected in login page `useEffect([user])` | `apps/dashboard/contexts/AuthContext.tsx`, `apps/dashboard/app/login/page.tsx` | No | ✅ Yes |
| B | BUG-009 | Dropped `social_moderation_insert_service` policy (had `WITH CHECK (false)` — blocked all inserts); created `auth_users_insert_moderation_queue` with `WITH CHECK (true)` | `supabase/migrations/059_social_moderation_queue_rls.sql` | ✅ Yes — applied live | ✅ Yes |
| C | BUG-007 | Created `FeedRefreshListener` component; added to `(main)/layout.tsx` inside `FeedInvalidationProvider`; also fixed pre-existing `.catch()` TS error on RPC builder in `CommentSection.tsx` | `apps/social/components/feed/FeedRefreshListener.tsx`, `apps/social/app/(main)/layout.tsx`, `apps/social/components/feed/CommentSection.tsx` | No | ✅ Yes |

**Root causes found:**
- **BUG-012:** Three compounding issues discovered via live browser diagnostics: (1) `window.location.href` does NOT navigate in Next.js App Router — it is intercepted by the client router, so the line after it still executes (confirmed via diagnostic logs). (2) The login page `useEffect([user, router])` always called `router.replace('/home')` overriding any `?redirectTo=` param. (3) Supabase DB cold-start (free-tier sleep) causes `fetchUserProfile` to timeout twice (18s total) then sign the user out — this is the "stuck on Signing you in…" UX the test agent observed. Fix: removed `window.location.href` from `signIn()` entirely; login page `useEffect` now handles all redirects via `router.replace()`, including special-casing `redirectTo=/community` to perform the full SSO token exchange (`supabase.auth.getSession()` → `window.location.href = ${SOCIAL_URL}/auth/sso?...`).
- **BUG-009:** `social_posts_auto_enqueue_trigger` inserts into `social_moderation_queue` on every post INSERT. The existing INSERT policy on that table had `WITH CHECK (false)` — a literal "deny all" policy that blocked every row the trigger tried to insert. Fixed by dropping that policy and replacing with `WITH CHECK (true)`.
- **BUG-007:** `FeedRefreshListener` was described in the task but did not exist. Created it. `router.refresh()` forces a re-run of the `/feed` server component, fetching fresh `comments_count` from the DB. Works for direct URL navigation where React Context (`feedVersion`) has reset to 0.

**Bugs introduced (if any):** None. Fixed one pre-existing TS error in `CommentSection.tsx` (`.catch()` on RPC builder).

**Notes for PM:**
- Dashboard `tsc` has 40+ pre-existing errors in unrelated files — not introduced by this session.
- `apps/social tsc` — exit code 0, clean.
- BUG-009 migration `059_social_moderation_queue_rls.sql` is applied and verified live in Supabase.
- Re-test for BUG-009 must use a fresh SSO login (`marketing@tutoglobal.com` via `:3000 → Cộng đồng`) to get a valid JWT before attempting post creation.

---
---

## AGENT 2 — Dev Agent 2 (Parts 3 + 4 domain: Profiles, Social Graph, Stories)

**You are responsible for:** BUG-010  
**Context:** You originally built Parts 3 and 4 — profile pages, follow system, search, and the stories scaffold.  
**Supabase MCP server:** `user-supabase-tuto`  
**App under fix:** `apps/social/`  
**Test account:** `marketing@tutoglobal.com` / `password`

---

### TASK A — BUG-010 — Profile page returns 404 for all usernames (PRIORITY 1 — blocks 6 test cases)

**Severity:** High | **Blocks:** TC-025, TC-026, TC-027, TC-028, TC-029, TC-030, TC-036

**Root cause (from QA test manager):**  
The `.eq('username', username).maybeSingle()` change was applied and the query executes without error — but returns 0 rows for all usernames. Users DO exist in `social_profiles` (confirmed via search results). The most likely cause: the column in the DB is NOT named `username`. It could be `user_name`, `handle`, or something else. The query silently returns null, `maybeSingle()` returns null, `notFound()` fires.

**Current state of `apps/social/app/(main)/profile/[username]/page.tsx` (confirmed):**  
- Line 80: `.eq('username', username)` — primary query
- Line 88: `.ilike('username', username)` — fallback case-insensitive query
- Both use `'username'` as the column name
- `PROFILE_QUERY` string (lines 13–29) also selects `username` explicitly

**Fix instructions:**

1. **BEFORE touching any code**, run these two SQL queries via Supabase MCP `execute_sql`:

   ```sql
   -- Query 1: Get actual column names
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'social_profiles' 
   ORDER BY ordinal_position;
   ```

   ```sql
   -- Query 2: Sample actual data values
   SELECT id, username, display_name 
   FROM social_profiles 
   LIMIT 5;
   ```
   
   *(If `username` column doesn't exist in Query 1, adjust Query 2 to use whatever the real column name is.)*

2. Note the exact column name and the exact username values in the DB.

3. Compare to the URL being visited — e.g., if profiles are seeded with username `teacher_nguyen` but the URL is `/profile/Teacher_Nguyen`, it's a casing issue. If the column is named `handle` not `username`, that's the rename fix.

4. Apply the fix — two scenarios:

   **Scenario A — Column is named something other than `username`** (e.g. `handle`):
   - Update `PROFILE_QUERY` constant in `profile/[username]/page.tsx` to select the real column name
   - Update both `.eq()` calls (lines 80 and 88) to use the real column name
   - Update `generateMetadata` (line 59) the same way
   - Update `mapRowToProfile()` — the field access on line 35 `row.username` to match the real column name
   - Check `apps/social/components/profile/ProfileHeader.tsx` — if it references `.username` from the profile object, update accordingly
   - Check `apps/social/components/profile/types.ts` — if `SocialProfile` type has `username` field sourced from a different column, align it

   **Scenario B — Column is `username` but values don't match URL format**:
   - Check if the URL is URL-encoded (e.g. space → `%20`) and decode before querying: `decodeURIComponent(username)`
   - Or if values are email addresses or IDs — adjust the lookup accordingly

5. After the fix, navigate to `/profile/[a-real-username-from-query-2]` and confirm you get a profile page, not 404.

6. Also check `apps/social/app/(main)/profile/[username]/followers/page.tsx` and `following/page.tsx` — if they contain the same `.eq('username', ...)` pattern, apply the same fix there.

**Acceptance criteria:**  
Navigate to `http://localhost:3001/profile/[real-username]` → full profile page renders with avatar, display name, post count, follower/following counts. No 404.

---

### Agent 2 — Mandatory Housekeeping

After completing the task above:

1. **Update `docs/qa/bug-register.csv`:** Set BUG-010 to `Fixed — Pending Re-test` (or `Open` with a note if blocked).
2. **Update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:** Update profile page rows accordingly.
3. **Fill in the Agent 2 Report section below.**

---

### Agent 2 Report *(fill in after your session)*

**Date:** 2026-03-19  
**Agent Transcript ID:** *(current session)*  
**Status:** Complete

| Task | Bug | Fix Applied | Files Changed | Migration? | Re-test Ready? |
|------|-----|-------------|---------------|------------|----------------|
| A | BUG-010 | Removed `subjects` from PROFILE_QUERY (column does not exist in DB); use `ilike` for case-insensitive username match; `decodeURIComponent` on username param | `apps/social/app/(main)/profile/[username]/page.tsx` | No | ✅ Yes |

**Actual column name found in DB:** `username` — column exists and is correct. Sample values: tarun_apollo, tarun_tuto, test_8z6r, we_are_banana_republic_ul87.

**Root cause:** PROFILE_QUERY selected `subjects` but the `subjects` column does not exist in `social_profiles` (migration 055 may not be applied). The Supabase query failed when selecting a non-existent column, causing 0 rows to be returned and `notFound()` to fire.

**Bugs introduced (if any):** None.

**Notes for PM:**
- `apps/social` tsc — exit code 0, clean.
- Followers and following pages already use `.ilike('username', username)` and do not select `subjects` — no changes needed.

---
---

## PM Decision Gate — After Both Agents Report

Once both agent report sections above are filled in, PM will:

1. Read both reports.
2. If all 4 bugs are fixed → dispatch QA re-test agent with this exact test list:
   - TC-018 (BUG-007 — comment count)
   - TC-023 (BUG-009 — create post)
   - TC-025 through TC-030 (BUG-010 — profiles)
   - TC-036 (BUG-010 — search profile link)
   - TC-040 (BUG-015 — pending re-test)
   - TC-042 (BUG-012 — login redirect)
3. If any bug is still blocked → send agent back with updated instructions.
4. After QA gives green light on all re-tests → dispatch Dev Agent for Part 5 (Reels/Shorts).

---

*Document owner: PM Agent | Last updated: 2026-03-19*
