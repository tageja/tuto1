# PM Handoff — tuto.social

**Prepared for:** Incoming Product Manager Agent  
**Project:** tuto.social — School-Scoped Social Platform  
**Branch:** `tutoSocial1`  
**Last updated:** 2026-03-20

---

## 🚀 PHASE 1 MVP — PM SIGN-OFF

**Status: ✅ APPROVED FOR LAUNCH** — signed off by PM Agent, 2026-03-20

| QA Metric | Result |
|-----------|--------|
| Test cases | 69 total |
| Pass rate | 85.3% (58 PASS) |
| Critical bugs open | 0 |
| High-severity bugs open | 0 |
| Open bugs | 6 (all Phase 2 / cosmetic) |

**One pre-launch blocker remaining:** BUG-019 (dual nav bars on mobile) must be confirmed fixed before production deployment. Fix is already briefed to Dev Agent 3 in `docs/pm/dev-tasks/DEV_AGENT_3_BUG_FIX_SPRINT_02.md`.

**Full QA documentation:** `docs/qa/QA_FINAL_REPORT.md` and `docs/qa/PM_BRIEF_FINAL.md`

---

## 1. Project Overview

**tuto.social** is a school-scoped social platform embedded within the Tuto EdTech ecosystem. It is education-first by design: content is scoped to schools and their communities (parents, teachers, students), not open to the general public.

### Three Platforms

| Platform | Path | Port | Tech |
|----------|------|------|------|
| Mobile App | `src/` | Expo | React Native / Expo / NativeWind |
| Main Dashboard (web) | `apps/dashboard/` | :3000 | Next.js |
| Social Web App | `apps/social/` | :3001 | Next.js |

### Local Dev Setup

- Dashboard: `http://localhost:3000`
- Social app: `http://localhost:3001`
- Mobile: run via Expo (`npx expo start`)
- Test account: `marketing@tutoglobal.com` / `password`

### Key Infrastructure

- **Auth:** Supabase (SSO bridge from :3000 → :3001 via `/auth/sso?access_token=&refresh_token=`)
- **Database:** Supabase (PostgreSQL + RLS policies)
- **Mobile state:** React Context / Zustand
- **Backend:** Firebase Functions (for Airtable-backed features) + Supabase (for social features)

---

## 2. Mandatory Docs — Read Before Doing Anything

Read these in order. Do not skip them.

| Document | Path | Purpose |
|----------|------|---------|
| Full Product Spec | `docs/prd-specs/TUTO_SOCIAL_PRD.md` | Canonical feature list, user stories, acceptance criteria |
| Build Plan | `docs/prd-specs/TUTO_SOCIAL_IMPLEMENTATION_PLAN.md` | 10-part incremental build plan, each part's scope |
| Progress Tracker | `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` | Live status of every feature — what is built, in progress, or not started |
| Asset Map | `docs/prd-specs/TUTO_SOCIAL_ASSET_MAP.csv` | All design references, screenshots, Figma prompts per feature |
| Architecture Rules | `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` | Non-negotiable rules for all agents — auth, data access, SSO, migrations |
| Cursor Rule (auto-loaded) | `.cursor/rules/rules.tuto-social.mdc` | The rule file agents auto-load in Cursor — always kept in sync with CURSOR_RULES |
| QA Test Cases | `docs/qa/test-cases.csv` | All 42 test cases (TC-001 to TC-042) across 7 batches |
| Bug Register | `docs/qa/bug-register.csv` | All logged bugs (BUG-001 to BUG-015), severity, status, re-test status |

---

## 3. The 10-Part Build Plan — Status Summary

| Part | Name | Status | Delivering Agent |
|------|------|--------|-----------------|
| 1 | Database & Auth Foundation | ✅ Complete | Dev Agent 1 ([af6a7a90](af6a7a90)) |
| 2 | Core Feed & Posts | ✅ Complete | Dev Agent 1 ([af6a7a90](af6a7a90)) |
| 3 | Profiles & Social Graph | ✅ Complete | Dev Agent 2 ([1afe8d26](1afe8d26)) |
| 4 | Stories Feature | ✅ Complete | Dev Agent 2 ([1afe8d26](1afe8d26)) |
| 5 | Reels / Shorts | ⚠️ Phase 1 Complete — viewer only; creation flow pending | Dev Agent 3 |
| 6 | Messaging (DMs) | ⚠️ Phase 1 Complete — 1:1 chat + Realtime; group chats pending | Dev Agent 3 |
| 7 | Notifications & Engagement | ❌ Not Started | — |
| 8 | Creator Tools & Analytics | ❌ Not Started | — |
| 9 | Moderation & Safety | ❌ Not Started | — |
| 10 | Premium & Monetization | ❌ Not Started | — |

---

## 4. Full Agent History

### Dev Agent 1 — [tuto.social DB & Auth / Feed](af6a7a90)
- **Date:** 2026-03-18
- **Scope:** Parts 1 + 2
- **What was built:**
  - Supabase schema via migrations `044–053` (posts, profiles, reactions, comments, RLS)
  - SSO bridge: dashboard (:3000) → social app (:3001) via `/auth/sso?access_token=&refresh_token=`
  - Full feed UI (`apps/social/app/(main)/feed/`)
  - Post cards, reactions, comments, create post modal
  - Mobile social screens (`src/screens/social/SocialFeedScreen.tsx`)
- **Key files:** `supabase/migrations/044–053_*`, `apps/social/app/(main)/feed/page.tsx`, `apps/social/components/feed/`, `src/screens/social/SocialFeedScreen.tsx`

---

### Dev Agent 2 — [tuto.social Profiles & Search](1afe8d26)
- **Date:** 2026-03-18
- **Scope:** Parts 3 + 4
- **What was built:**
  - `/profile/[username]` page (profile header, posts grid, follow button)
  - Follow / unfollow system (social graph)
  - Search page (`/search`) with user search results
  - Stories scaffold (CreateStoryModal, StoryBar, StoryViewerModal) — partially broken
- **Active bug:** BUG-011 — stories fetch fails with `TypeError: Failed to fetch`
- **Key files:** `apps/social/app/(main)/profile/[username]/page.tsx`, `apps/social/app/(main)/search/`, `apps/social/components/profile/`, `apps/social/components/stories/`

---

### QA Test Manager — [QA test design](4c597c3a)
- **Date:** 2026-03-18
- **Role:** Designed all 7 test batches (42 test cases), created CSV tracking docs, wrote all QA agent prompts
- **Output:** `docs/qa/test-cases.csv`, `docs/qa/bug-register.csv`

---

### QA Test Agent (Batches 1–7) — [Browser QA testing](478a2446)
- **Date:** 2026-03-18 to 2026-03-19
- **Ran:** TC-001 through TC-042 in browser using browser automation
- **Logged:** BUG-001 through BUG-015

---

### QA Re-test Agent — [Bug re-test session](d95488a6)
- **Date:** 2026-03-19
- **Scope:** Re-tested BUG-007, BUG-008, BUG-009 after dev fixes were applied
- **Outcome:** BUG-008 confirmed fixed. BUG-007 and BUG-009 still failing (fixes partial).

---

### PM / Brainstorm Agent — [tuto.social brainstorm](e493c446)
- **Date:** 2026-03-18
- **Role:** Read Figma designs and brainstorming notes; produced the feature scorecard and initial project framing
- **Output:** Informed `TUTO_SOCIAL_PRD.md` and `TUTO_SOCIAL_IMPLEMENTATION_PLAN.md`

---

### Scraper Agent — [Kindergarten scraper](5563f382)
- **Date:** 2026-03-16
- **Note:** Separate workstream — Python scraper for HCMC kindergartens. Unrelated to tuto.social.

---

### Mobile Apple Login Agent — [Apple Sign-In UI](b2843066)
- **Date:** 2026-03-18
- **Note:** Separate workstream — Apple login on `apps/med` mobile app. Unrelated to tuto.social.

---

## 5. Current Bug Status

Full detail in `docs/qa/bug-register.csv`. Summary below.

### OPEN — Needs Dev Agent (Priority order)

| Bug | Severity | Description | Root Cause | Re-test TC |
|-----|----------|-------------|------------|------------|
| **BUG-010** | 🔴 High | Profile page 404 for all usernames | `.eq('username', ...).maybeSingle()` returns 0 rows — suspected column name mismatch in DB | TC-025–031, TC-036 |
| **BUG-009** | 🔴 High | Create post fails — INSERT blocked by RLS | `social_moderation_queue` has no INSERT policy for authenticated users | TC-023 |
| **BUG-012** | 🔴 High | Login form (:3000) stays on "Signing you in..." indefinitely | `router.push()` not firing after auth success in `AuthContext.signIn` | TC-042 |
| **BUG-007** | 🟡 Medium | Feed card comment count stale after posting | DB trigger fix applied (migrations 057+058 ✅). Client-side `router.refresh()` still needed | TC-018 |

### OPEN — Low Priority (Background)

| Bug | Severity | Description |
|-----|----------|-------------|
| **BUG-011** | 🟢 Low | Stories fetch fails: `TypeError: Failed to fetch`. Stories feature partially built. |
| **BUG-013** | 🟢 Low | Hydration mismatch warnings (cosmetic, no user impact). |

### VERIFIED FIXED — No Action Needed

BUG-001, BUG-002, BUG-003, BUG-004, BUG-005, BUG-006, BUG-008, BUG-014

### FIXED — Awaiting Re-test

BUG-007, BUG-009, BUG-010, BUG-012, BUG-015

---

## 6. QA Status — All Test Batches

| Batch | Area | Test Cases | Status |
|-------|------|-----------|--------|
| 1 | Auth & SSO | TC-001–004 | ✅ All PASS |
| 2 | Feed & Posts | TC-005–013 | ✅ All PASS (after fixes) |
| 3 | Post Detail & Comments | TC-014–018 | ⚠️ TC-018 FAIL — BUG-007 |
| 4 | Create Post | TC-019–024 | ⚠️ TC-023 FAIL — BUG-009 |
| 5 | Profiles | TC-025–031 | 🔴 ALL BLOCKED — BUG-010 |
| 6 | Search | TC-032–036 | ⚠️ TC-036 BLOCKED — BUG-010 |
| 7 | Dashboard Integration | TC-037–042 | ⚠️ Mixed (see detail below) |

### Batch 7 Detail

| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-037 | ✅ PASS | — |
| TC-038 | ✅ PASS | — |
| TC-039 | ✅ PASS | BUG-014 fixed and confirmed |
| TC-040 | ⏳ Pending re-test | BUG-015 fix applied |
| TC-041 | ✅ PASS | — |
| TC-042 | 🔴 BLOCKED | BUG-012 — login redirect broken |

### Next Re-test Batch (once bugs are fixed)

Run: **TC-018, TC-023, TC-025–031, TC-036, TC-040, TC-042**

---

## 7. Architecture Rules — Summary

> Full rules: `docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md` and `.cursor/rules/rules.tuto-social.mdc`. These are non-negotiable for all dev agents.

| Rule | Detail |
|------|--------|
| Data access | All data through Supabase (social features) or Firebase Functions (Airtable features). Never direct Airtable from web or mobile. |
| SSO flow | Dashboard (:3000) → `/auth/sso?access_token=&refresh_token=` → Social app (:3001/feed) |
| Server client | Use `createSupabaseServerClient()` for all auth-sensitive and RLS-protected operations |
| Browser client | `getSupabaseBrowserClient()` for reads only. Never use it for RLS-protected inserts. |
| Migrations | Live in `supabase/migrations/`. Apply via Supabase MCP tool `apply_migration`. Never run SQL directly in the Supabase dashboard for tracked changes. |
| Progress tracker | Every dev agent MUST update `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv` at the end of their session. |
| Dev reports | Every dev agent MUST produce a report in `docs/pm/dev-reports/` using `DEV_AGENT_REPORT_TEMPLATE.md`. |

---

## 8. PM Protocol — How to Work With Dev Agents

### Starting a New Dev Agent Session

1. Read `TUTO_SOCIAL_IMPLEMENTATION_PLAN.md` — confirm scope for the target Part
2. Read `TUTO_SOCIAL_PROGRESS_TRACKER.csv` — confirm what is done, what is needed
3. Read `docs/qa/bug-register.csv` — note any open bugs relevant to this Part
4. Write a full handoff prompt (use `DEV_AGENT_REPORT_TEMPLATE.md` as the report format the agent must follow)
5. Dispatch via Task tool: `subagent_type: "generalPurpose"`
6. When agent finishes, check their report in `docs/pm/dev-reports/`

### After a Dev Agent Session

1. Confirm `TUTO_SOCIAL_PROGRESS_TRACKER.csv` was updated
2. Check `docs/pm/dev-reports/` for the agent's session report
3. Review any new migrations — confirm they were applied via Supabase MCP
4. Update bug register if fixes were applied
5. Decide: dispatch QA agent, or send back for fixes

### Supabase MCP Access

- Server name: `user-supabase-tuto`
- Tool schemas: `/Users/pc/.cursor/projects/Users-pc-tutoAll-tuto1/mcps/user-supabase-tuto/tools/`
- **Always read the tool schema file before calling any MCP tool**
- Key tools: `apply_migration`, `execute_sql`, `list_migrations`, `list_tables`

### Dispatching a QA Agent

- Give agent: URL to test (`:3001` or `:3000`), test account credentials, list of TCs to run
- Tell agent to update `docs/qa/bug-register.csv` for any new bugs
- Tell agent to mark re-tested TCs in `docs/qa/test-cases.csv`

---

## 9. Phase 2 Roadmap — Next Actions

Phase 1 MVP is signed off. Execute Phase 2 in this order.

### Pre-Launch (Do First)
- Confirm BUG-019 (dual nav bars) is fixed — check with Dev Agent 3
- Run deployment checklist from `docs/qa/PM_BRIEF_FINAL.md`
- Brief support team on Phase 2 gaps (reel creation, group chat, read receipts)

### Phase 2 — Priority Order (Post-Launch)

**Dev Agent 4 — Part 5 Phase 2 + Part 6 Phase 2:**
- Reel creation: upload from camera roll, `CreateReelScreen`, `CreateReelModal`
- Group chat: extend messaging to multi-participant conversations
- Message media: image sharing in DMs
- Message read status: double-tick delivery/read indicators
- Reel comments: wire the empty `onComment` handler

**Dev Agent 5 — Part 7 (Notifications):**
- Push notifications for new messages, reactions, follows
- In-app notification centre
- Notification preferences

**Dev Agent 6 — Part 9 (Moderation & Safety):**
- Admin moderation dashboard
- Parent consent flow for student posts
- Content reporting

### Open Bugs to Fix in Phase 2
| Bug | Priority | Notes |
|-----|----------|-------|
| BUG-011 | Low | Stories fetch error — edge function may need re-deploy |
| BUG-013 | Low | Hydration mismatch warnings (cosmetic) |
| BUG-019 | **Pre-launch** | Dual nav bars — must fix before go-live |
| BUG-020 | Low | Like count display on reels |
| BUG-021 | Medium | Profile Message button not wired |
| BUG-022 | Low | Mute button on ReelDetailScreen |
| BUG-024 | Medium | Profile images differ between accounts |

---

## 10. Previous Next Actions (Phase 1 — COMPLETED)

### Step 1 — Fix BUG-010 (Blocks 7 test cases)
Dispatch a dev agent with Supabase MCP access.

**Agent instructions:**
1. Run `SELECT username, display_name, id FROM social_profiles LIMIT 10` via `execute_sql`
2. Inspect actual column names (suspected: column may be `user_handle` or similar — not `username`)
3. Fix the query in `apps/social/app/(main)/profile/[username]/page.tsx` to match actual schema
4. Also fix `apps/social/components/profile/ProfileHeader.tsx` if it references the wrong column
5. Test: navigate to `/profile/[username]` for a known user — must return a profile page, not 404

---

### Step 2 — Fix BUG-009 (Create post RLS failure)
Simple migration fix.

**Agent instructions:**
1. Create migration `059_social_moderation_queue_rls.sql`
2. Add: `CREATE POLICY "authenticated_insert" ON social_moderation_queue FOR INSERT TO authenticated WITH CHECK (true);`
3. Apply via Supabase MCP `apply_migration`
4. Test: create a post in the feed — must succeed without 500 error

---

### Step 3 — Fix BUG-012 (Login redirect broken)
Requires careful AuthContext debugging.

**Agent instructions:**
1. Open `apps/dashboard/contexts/AuthContext.tsx` — inspect `signIn` function
2. Check: is `router.push('/feed')` or `router.push('http://localhost:3001/feed')` firing?
3. Check: is there a try/catch swallowing the error before the push?
4. Likely fix: ensure `router.push()` is called after `await supabase.auth.setSession()` resolves successfully
5. Test: log in at `:3000` → must redirect to `:3001/feed`

---

### Step 4 — Fix BUG-007 (Comment count stale)
Client-side cache invalidation.

**Agent instructions:**
1. Open `apps/social/components/feed/CommentSection.tsx`
2. After successful comment POST, call `router.refresh()` (Next.js App Router cache bust)
3. Confirm the comment count on the feed card updates without full page reload
4. Test: TC-018

---

### Step 5 — QA Re-test
After all 4 bugs above are fixed, dispatch a QA agent.

**Re-run:** TC-018, TC-023, TC-025–031, TC-036, TC-040, TC-042

---

### Step 6 — Start Part 5 (Reels / Shorts)
Only after QA gives green light on all re-tests.

Read `TUTO_SOCIAL_IMPLEMENTATION_PLAN.md` Part 5 for full scope before dispatching.
