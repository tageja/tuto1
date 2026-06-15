# Orchestrator Agent Handover

_Last updated: 2026-06-15 by agent session [Company Site Polish + Favicon + Email](a372fc83-827a-4076-a769-39e87edbec20)_  
_Previously: [Domain Consolidation Phases 3–4](a372fc83-827a-4076-a769-39e87edbec20)_

---

## 🟢 CURRENT FOCUS — Domain Consolidation + Company Site ✅ ALL PHASES DONE (2026-06-15)

**Branch:** `domainConsolidation` (off `communityFirstRedesign`) — **PUSHED to `origin/domainConsolidation`**, HEAD = `ddbaffc` (2026-06-15).
Key commits: `6deb0a3` phase 3 · `c582292` phase 4 · `9b6f5b3`+`1ff18a2`+`6cce3eb` company-site polish/favicon · `ddbaffc` contact-email fix.

> ⚠️ The working tree still holds **uncommitted community-redesign WIP** in `apps/social/*`
> (i18n / LanguageContext / feed + layout components) plus assorted `docs/`, `tests/`,
> `.vercel/` artifacts. These belong to a separate in-progress effort and were deliberately
> **left uncommitted** — do not bundle them into domain/company commits.

### Final domain map (all LIVE + verified)

| Domain | Serves | Vercel project | Status |
|---|---|---|---|
| `tuto.asia` | Community feed (apex = primary) | tuto-social | ✅ live |
| `www.tuto.asia` | 308 → `tuto.asia` | tuto-social | ✅ live |
| `tuto.social` / `www.tuto.social` | 308 → `tuto.asia` (host-based redirect in next.config) | tuto-social | ✅ live |
| `school.tuto.asia` | School dashboard | dashboard | ✅ live + SSL |
| `tutoglobal.com` | Company/marketing site (apex = primary) | **tuto-company** | ✅ live |
| `www.tutoglobal.com` | 308 → `tutoglobal.com` | tuto-company | ✅ live |
| `pro.tuto.asia` | Courses | unchanged | ✅ untouched |

**Storage:** Supabase was restricted (402, exceeded 1 GB free quota — 948 MB of orphaned HeyGen videos in `nursed-assets`). USER upgraded to Pro; restriction lifted. **Nothing was deleted.**

**QA artifacts created this session (safe to delete):** auth user `qa.sso@tuto.test` / `TutoQA!2026` (email-confirmed, no school role); one `company_leads` row with `organisation=QA-Phase4-Smoke-Org`.

### Verification (all PASS, via browser subagents + curl)
- SSO round-trip social↔dashboard both directions, on both old and new domains; no 402/500.
- `tuto.social → 308 → tuto.asia`; canonical/OG = `tuto.asia`.
- `tutoglobal.com` legacy bookmarks (`/admin`, `/teacher`, `/parent`, `/login`, `/investors`, subpaths + query) → `308 → school.tuto.asia`.
- Lead form on `tutoglobal.com` writes to `company_leads` (verified row).

### Phase 1 — Company site ✅ DONE

- **`apps/company/`** — new Next.js 16 app, static-first, Tailwind, VN/EN cookie toggle
- Pages: Home (hero, products, how-it-works, AI section, lead form), `/terms`, `/privacy`
- `company_leads` Supabase table (migration 085, anon-INSERT-only RLS, no SELECT)
- Vercel project `tuto-company` created under `tarun-tagejas-projects`
- **Preview/Production URL:** `https://tuto-company.vercel.app`
- Inspect: `https://vercel.com/tarun-tagejas-projects/tuto-company/2gxsNbGEWowMDuHeRWcooP6dhyDs`
- Env vars set in Vercel: `NEXT_PUBLIC_SUPABASE_URL/KEY`, social/dashboard/courses URLs

### Phase 2 — Dashboard → school.tuto.asia ✅ DONE

**Vercel project:** `dashboard` (prj_WKBhPJjLeXHtGrsy0kybt2eXZUTp) — NOT `tuto1`.
The `apps/dashboard/.vercel` links to project `dashboard`.

**Critical fix — why dashboard builds kept failing on Vercel:**
`vercel deploy` from inside `apps/dashboard` only uploads that folder, so every
monorepo `packages/*` reference broke. Made the dashboard **fully self-contained**
(same pattern that makes tuto-social deploy cleanly):
- Added all 13 env vars to the `dashboard` Vercel project (were completely missing)
- Inlined `packages/schemas/src/*` → `apps/dashboard/lib/schemas/`
- Inlined `packages/i18n/{en,vi}.json` → `apps/dashboard/lib/i18n/`
- Inlined `packages/shared/*` → `apps/dashboard/lib/shared/`
- Rewrote `apps/dashboard/tsconfig.json` to drop `extends ../../packages/config` and
  point `@tuto/shared` / `@tuto/schemas` aliases at the local copies
- Cleared the broken project-level `installCommand` (`cd ../.. && npm install`) via API

**Domain:** `school.tuto.asia` added to `dashboard` project, **verified**, SSL live.
DNS: CNAME `school → cname.vercel-dns.com` at GoDaddy (USER done).
Supabase redirect `https://school.tuto.asia/**` added (USER done).

**Code/env changes:**
- tuto-social Vercel env `NEXT_PUBLIC_DASHBOARD_URL=https://school.tuto.asia` (prod+preview;
  was an empty string — latent bug). Local `apps/social/.env.local` updated too.
- Cosmetic comment updates in `apps/social/lib/ecosystem.ts`, `apps/social/app/auth/sso/route.ts`,
  `apps/social/app/auth/sso-exchange/page.tsx`, `apps/dashboard/app/auth/sso/route.ts`.
- tuto-social redeployed to production (build-time inlines the new URL).

**Verified (HTTP):** school.tuto.asia 200, /login 200, /auth/sso-exchange 200,
tuto.social/feed 200, tutoglobal.com still 200 (parallel run intact).
**Still to verify by USER:** interactive SSO round-trip with real login (dashboard ↔ social).

**Note:** mobile `src/screens/settings/*` legal links still point at
`www.tutoglobal.com/legal/{privacy,terms}` + `/support` — these are NOT dashboard SSO
URLs (no SSO URLs exist in mobile src/services|config). Handle in Phase 4.

### Phase 3 — tuto.asia → community feed ✅ DONE (commit `6deb0a3`)

USER did domain swap + Supabase `https://tuto.asia/**` redirect URL. Executor:
- `apps/social/next.config.js`: host-based 308 `tuto.social`/`www.tuto.social` → `tuto.asia`
- `apps/social/app/layout.tsx`: `metadataBase` + canonical/OG → `tuto.asia` (env `NEXT_PUBLIC_APP_URL`)
- `apps/social/components/feed/ShareModal.tsx`: share links use `NEXT_PUBLIC_APP_URL`
- `apps/dashboard/app/login/page.tsx`: added `https://tuto.asia` to allowed SSO redirect origins
- Vercel: flipped apex/www so `tuto.asia` is primary; set prod env `tuto-social NEXT_PUBLIC_APP_URL` + `dashboard NEXT_PUBLIC_SOCIAL_URL` = `https://tuto.asia`; redeployed both.

### Phase 4 — tutoglobal.com → company site ✅ DONE (commit `c582292`)

USER removed `tutoglobal.com`+`www` from dashboard, added them to tuto-company. Executor:
- `apps/company/next.config.js`: 308 redirects `/admin`, `/teacher`, `/parent`, `/login`, `/investors` (subpaths) → `${NEXT_PUBLIC_DASHBOARD_URL}` (`school.tuto.asia`)
- Vercel: flipped apex/www so `tutoglobal.com` is primary; set prod env `tuto-company NEXT_PUBLIC_DASHBOARD_URL=https://school.tuto.asia`; redeployed.
- Confirmed `tutoglobal.com` fully removed from `dashboard` project.

**Remaining cleanup (optional, not blocking):** mobile `src/screens/settings/*` legal links still point at `www.tutoglobal.com/legal/{privacy,terms}` + `/support`; dashboard i18n string `Visit tutoglobal.com/investors` now relies on the `/investors` 308 redirect.

### Phase 5 — Company site design polish + brand fixes ✅ DONE (2026-06-15)

Post-launch polish of `tutoglobal.com` (project `tuto-company`) after USER design review.

- **Icons:** replaced ALL emoji with `lucide-react` (already the monorepo standard in
  social/dashboard/`packages/ui`). Chose Lucide over Canva (Canva content-license forbids
  extracting elements as standalone assets; Lucide is MIT + has a RN variant for mobile).
- **New sections:** About/mission, Investors & Partners (CTA → lead form), "Get the app"
  band linking **iOS App Store** (`https://apps.apple.com/vn/app/tuto/id6757738235`).
- **Visual pass:** hero gradient + animated blobs, browser-framed hero screenshot,
  value-props strip, CSS load animation (instant, no hydration dependency), section
  eyebrows, richer card hover, scroll-reveal (`components/Reveal.tsx`), captioned gallery.
- **NO fabricated social proof** — USER confirmed none available; left out intentionally.
- **Contact email:** corrected `hello@tuto.asia` → **`support@tutoglobal.com`** everywhere
  (Footer, /privacy, /terms, i18n). Verified live.
- **Favicon FIX (important):** the brand cube favicon was served by a `app/favicon.ico/route.ts`
  that read `../../assets/favicon.ico` from the **monorepo root** — but per-app Vercel deploys
  only upload the app folder, so the path 404'd in prod. Replaced with a real deployed
  `app/favicon.ico` file in **company** (`tutoglobal.com`) and **social** (`tuto.asia`).
  Both now serve the real 15 406-byte `.ico` (were 404 / 9-byte "Not Found").

**Verified live (curl, 2026-06-15):**
- tutoglobal.com 200 · www→308 · tuto.asia→307 `/feed` · www.tuto.asia→308 · tuto.social→308 `tuto.asia` · school.tuto.asia 200 · pro.tuto.asia 200
- `support@tutoglobal.com` present, `hello@tuto.asia` gone
- favicons: tutoglobal.com ✅ 15406 · tuto.asia ✅ 15406

> ⚠️ **STILL BROKEN — `school.tuto.asia/favicon.ico` returns 9-byte "Not Found"** (dashboard
> still uses the old root-reading `route.ts`). One-line fix: drop the route handler and add a
> real `apps/dashboard/app/favicon.ico` file (`cp assets/favicon.ico apps/dashboard/app/`),
> then redeploy `dashboard`. Not yet done (awaiting go-ahead).

---

## Previous Focus — Community-First Redesign Round 3 Gap Fixes (earlier 2026-06-11)

**Branch:** `communityFirstRedesign` (pushed + deployed to production)  
**Preview/Production URL:** `https://tuto.social` (deployment `dpl_Ew6dBG4w6ycNZKHo3PjmbFGr8Taa`)  
**Inspector:** `https://vercel.com/tarun-tagejas-projects/tuto-social/Ew6dBG4w6ycNZKHo3PjmbFGr8Taa`

### What shipped in Round 3

| Task | Fix | Migration |
|---|---|---|
| T1 | RSVP real DB write + toggle off + hydration on reload + live count from `social_event_rsvps` | — |
| T2 | `increment_story_view` RPC (security definer) created | migration 082 |
| T3 | Photo posts + stories re-seeded with real school mobile photos (no receipts/screenshots) | migration 083 |
| T4 | Public event seeded (Ngày hội Tuyển sinh) so guests see `/events` hub | migration 084 |
| T5 | LeftRail + RightRail sticky: `sticky top-[3.75rem] max-h-[calc(100vh-3.75rem)] overflow-y-auto` | — |
| T6 | All gated routes use `?redirectTo=` consistently (login page param) | — |
| T7 | TypeScript errors fixed; branch pushed; production deployed to `tuto.social` | — |

### Deploy note (for next agent)
CLI `vercel deploy` preview builds (non-production) fail due to missing NEXT_PUBLIC_SUPABASE_* env vars in Vercel preview environment. Always use `vercel deploy --yes --prod` to deploy from this branch.

### Known gaps (resolved in Round 3)
All Round 2 gaps resolved. No new gaps introduced.

---

## Previous Focus — Community-First Redesign M1-M5 (2026-06-11)

**Branch:** `communityFirstRedesign` (off `integration/community-first`)  
**All milestones M0–M5 shipped.** Committed as `feat(social): M1-M5 Community-First Redesign [redesign-M1-M5]`.

### What shipped in this round

| Milestone | Scope | Key files |
|---|---|---|
| M0 | Branch, schema inventory, test account verification, notification seed | migrations 083–088 |
| M1 | FeedComposerCard, multi-photo upload (social-media bucket), +N overflow, Lightbox, AchievementCard, 6 seeded posts | `FeedComposerCard.tsx`, `CreatePostModal.tsx`, `FeedPost.tsx`, `app/api/posts/route.ts` |
| M2 | InlineComments, reaction aggregate row, Header bell badge (99+), /notifications page, document.title count, report via social_reports | `InlineComments.tsx`, `PostInteractions.tsx`, `Header.tsx`, `PostOptionsDropdown.tsx` |
| M3 | 3-column lg layout, LeftRail, RightRail, MobileTabBar, SchoolBanner, stories direct DB (no edge fn) | `feed/page.tsx`, `LeftRail.tsx`, `RightRail.tsx`, `MobileTabBar.tsx`, `SchoolBanner.tsx`, `lib/stories.ts` |
| M4 | social_event_rsvps table+RLS (migration 085), /events hub, EventCard RSVP, 5-tab school page, school_branding cover/logo | `events/page.tsx`, `SchoolProfileClient.tsx`, `school/[schoolId]/page.tsx` |
| M5 | /saved page, SuggestedTeachers (every 5th post), block → social_blocks, freshness labels | `saved/page.tsx`, `SuggestedTeachers.tsx`, `FeedContainer.tsx` |

### Known gaps (non-blocking, next agent picks up)
1. **EventCard RSVP write** — optimistic count only; needs full `social_event_rsvps` upsert + `social_posts.event.rsvpCount` update.
2. **`increment_story_view` RPC** — does not exist; gracefully caught but view_count stays 0. Add the RPC or a trigger.
3. **RSVP hydration on reload** — EventCard doesn't fetch viewer's existing RSVP state on mount; button always shows "Tham gia".
4. **class-groups proposal** — PR description outline below; do NOT build yet.

### Class-Groups Proposal (for PR description)
> **Proposal: social_class_groups (do NOT implement yet)**
>
> Allow cross-school topic groups modelled on Facebook Groups. Each group has:
> - `social_class_groups(id, name, school_id nullable, description, avatar_url, member_count)`
> - `social_group_members(group_id, profile_id, role admin|member, joined_at)` — RLS: member sees group
> - Groups appear in LeftRail "Nhóm của tôi"; top-level `/groups` hub
> - Posts gain optional `group_id` FK; feed can filter by group
> - Moderation follows school: school_admin can appoint group admins
> - Phase 1: school-scoped groups only; Phase 2: cross-school (opt-in by admin)

---

## Previous Focus — Community-First Ecosystem (2026-06-09)

The product was re-oriented from **LMS-first** to **community/social-first**: the
community feed (tuto.social) is now the front door for everyone (guests included,
Facebook-style); sign-in is prompted only when a guest tries to interact. Signed-in
users get a subtle ecosystem switcher to the **School Dashboard (LMS)** and
**Home-Learning Courses (pro.tuto.asia)**, with SSO so they stay logged in across apps.

**Integration branch:** `integration/community-first` (latest: `c21abbd`)  
**Courses branch:** `agent-x-integration` (med app — does NOT auto-promote; promote manually)  
**Vercel team:** `tarun-tagejas-projects` (`team_lEgbPvI9vppuQCVFpFCJVA8P`)

### Apps, projects & live state (all verified 2026-06-09)

| App | Path | Vercel project | Domain(s) | State |
|---|---|---|---|---|
| Social feed | `apps/social/` (Next.js, port **3001**) | `tuto-social` | `tuto.social`, `www.tuto.social` | LIVE; feed/search/profile/post guest-browsable (200/404, no `/login` redirect) |
| Web dashboard / LMS | `apps/dashboard/` (Next.js, port **3000**) | `tutomain` (`prj_6Y9UtN0EeUuO2W8VsHi1iaGyUzzC`) | `tutoglobal.com`, `tuto.asia` | LIVE; `NEXT_PUBLIC_SOCIAL_URL=https://tuto.social` set (Prod+Dev) |
| Courses / NurseEd | `apps/med/` (Next.js, `agent-x-integration`) | `med` (`prj_23SdtfcC8eLN0p6rjPRaHX7PHkRl`) | `pro.tuto.asia` | LIVE; `/auth/sso` → `307 /auth/login?next=/learn/courses` ✅ |
| Mobile | `src/` (Expo) | — (EAS) | App Store `6757738235` | Code merged on integration branch; feed-first; **EAS build pending** |

> ⚠️ `tuto1` (`prj_B8gh5MqVM8Hp6RxXg92uG74LDMYQ`) is a **redundant duplicate** dashboard
> project that auto-builds every branch as previews and lacks Supabase env on its
> **Preview** environment → those preview builds fail and send "build failed" emails.
> It is NOT a real serving project. To silence: add `NEXT_PUBLIC_SUPABASE_URL` +
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` to its Preview env, OR disable auto-deploy for
> non-production branches. (Prod+Dev env already added.)

### What shipped in this work

- **Mobile:** `AppNavigator` Splash routes everyone into `Social` (community feed); new
  `SocialStack`/`SocialTabs`; `SocialFeedScreen` gates react/save/compose/post behind
  `promptSocialSignIn` (`src/utils/socialAuthGate.ts`) for guests; `FeedHeader` apps-grid
  icon → ecosystem; `src/services/ecosystem.ts` `openCourses()` opens pro.tuto.asia w/ SSO;
  remember-me via `src/services/rememberMe.ts` (AsyncStorage) honored in Splash + `AuthUnifiedScreen`.
- **Social web:** `app/page.tsx` → redirect `/feed`; `middleware.ts` gates only
  `AUTH_REQUIRED_PREFIXES` (create/messages/notifications/settings/dashboard/profile/edit);
  guest gates removed from feed, post detail, profiles, followers/following, search;
  `contexts/AuthGateContext.tsx` modal; `components/layout/EcosystemSwitcher.tsx`; `lib/ecosystem.ts`.
- **Dashboard web:** remember-me (`lib/supabase.ts` `rememberMeStorage` localStorage/sessionStorage);
  `app/(home)/page.tsx` "Courses" link w/ SSO handoff; `lib/ecosystem.ts`; `app/auth/sso/route.ts`.
  **Build fix:** module-scope `supabase = createClient(url, key)` now falls back to placeholders
  when env is absent (was crashing `next build` page-data collection with `supabaseUrl is required`).
- **Courses (med):** `apps/med/app/auth/sso/route.ts` SSO receiver (sets session, upserts `nursed_profiles`).
- **SSO receiving routes** exist in all three web apps at `/auth/sso` (accept `access_token`/`refresh_token`).
- **Supabase Auth:** `tuto.social` redirect URLs added by the project owner (done 2026-06-09).

### Open / non-blocking
- `tuto1`/`med` preview-build email noise (config cleanup — see warning above).
- Reconcile `integration/community-first` with `main` before merging (branch is behind `main`).
- Feed-first **mobile EAS build** + App Store submission (needs credentials).

---

## 🧪 NEXT TASK — Phased E2E Testing (Playwright)

**Goal:** thorough end-to-end testing, **local first then a production smoke pass**, web then mobile.
Playwright **1.60.0** is installed. Run `npx playwright install chromium` first.

**Local dev servers** (run from repo root; both need their existing `.env.local`):
```bash
# Terminal A — social feed
cd apps/social && npm run dev        # http://localhost:3001
# Terminal B — dashboard / LMS
cd apps/dashboard && npm run dev     # http://localhost:3000
# Courses (apps/med) has no local .env.local → test against https://pro.tuto.asia
```

**Phases:**
1. **Community-first (local, :3001):** guest can browse `/feed`, `/search`, `/profile/:username`,
   `/post/:id`, followers/following (all 200/404, never redirect to `/login`). Guest clicking
   react / comment / follow / compose / create → **auth-gate modal** appears. Sign in with a test
   account → the gated interaction now succeeds.
2. **Persistent login / remember-me (local):** with remember-me ON the session is in
   `localStorage` (key `tuto-dashboard-auth` on dashboard; supabase key on social) and survives
   reload; OFF → `sessionStorage`, cleared on tab close. Verify on both social and dashboard login.
3. **Ecosystem / SSO handoff:** signed in on social → EcosystemSwitcher → School (dashboard) and
   Courses; confirm session carries over (no re-login). Courses SSO is validated against
   `pro.tuto.asia/auth/sso` (302/307 to `/auth/login` when no tokens; signed-in handoff lands on `/learn/courses`).
4. **Production smoke (both):** `tuto.social/feed`=200 guest, auth gate + real sign-in;
   `pro.tuto.asia/auth/sso`=307; `tutoglobal.com` loads with the "Courses" link.
5. **Mobile (Expo, later):** Splash → community feed as front door; guest gating on
   react/save/compose; ecosystem alert → dashboard/courses; remember-me sign-out behavior.

**Test accounts:** see [Test Accounts](#test-accounts) below (shared Supabase Auth across all apps;
`tarun@tutoglobal.com` works everywhere). Note: a `social_profiles` row may need to exist for full
social interactions — create one via the app sign-up/profile flow if a fresh account is used.

---

## Project Overview

**Tuto** — EdTech platform (Vietnam-focused).

| Layer | Stack | Repo path |
|---|---|---|
| Mobile app | React Native / Expo | `src/` |
| Web dashboard | Next.js 16 App Router | `apps/dashboard/` |
| Backend | Firebase Functions + Supabase | `functions/src/`, Supabase project `fkjeggdxqifqqwhuqpgm` |

**Active mobile branch:** `AppleLogin+homeRedesign2`  
**Mobile version:** `2.2.0` (build 24) — `runtimeVersion: 2.1.1` (OTA target)  
**App Store ID:** `6757738235`

---

## Supabase

- **Project:** `fkjeggdxqifqqwhuqpgm.supabase.co`
- **Key tables:** `public.users`, `school_users`, `school_teachers`, `schools`, `school_branding`, `platform_feedback`
- **Social tables (migrations 044–088):** `social_profiles`, `social_posts`, `social_likes`, `social_comments`, `social_comment_likes`, `social_saves`, `social_notifications`, `social_stories`, `social_story_views`, `social_story_reactions`, `social_reports`, `social_blocks`, `social_mutes`, `social_conversations`, `social_messages`, `social_follows`, `social_event_rsvps`
- **Storage buckets:** `school-logos` (legacy), `school-branding` (active — logo + header), `social-media` (photo posts — public-read, auth-write, migration 083)
- **Logo sync rule:** `uploadLogo()` in `src/services/settings/branding.ts` must update BOTH `school_branding.logo_url` AND `schools.logo_url` — critical for splash screen

---

## Test Accounts

| Role | Email | Notes |
|---|---|---|
| Tuto global admin | `tarun@tutoglobal.com` | Also linked as teacher+admin for Tuto Demo School |
| School admin | `schooladmin@tutoglobal.com` | `school_admin` role, Tuto Demo School |
| School admin | `nhule@empowerenglish.edu.vn` | Admin, Empower English (has logo uploaded) |
| Parent/QA | `qa.parent@tuto.test` | |

**Tuto Demo School ID:** `bed99290-1b7c-4e90-ac55-0ec7f496491b`  
**Empower English ID:** `65498184-1615-40f4-b2b5-5267a458696c`

---

## Architecture Rules

- **ALL mobile data flows → Supabase directly** (not Next.js API routes) — mobile JWTs are not accepted by `requireBearerAuth` on the dashboard server
- `platform_feedback` is an exception confirmed: mobile uses `supabase.from('platform_feedback')` with RLS
- Web dashboard → Supabase via Next.js API routes (server-side, service role)
- `school_branding.logo_url` ≠ `schools.logo_url` — always keep in sync via `uploadLogo()`

---

## Mobile App — What Was Shipped (2026-04-28 OTA)

**OTA update group:** `e456ebf8-fd7c-4b47-af9c-e9e38042a972`  
**EAS branch:** `production` | **Runtime:** `2.1.1`

### Fixes in this OTA

1. **Help & Support screen** (`src/screens/school/AdminHelpSupportScreen.tsx`)
   - New screen for school admins to submit/view feedback to Tuto
   - Uses Supabase directly (bypasses Next.js API which rejected mobile JWTs)
   - Menu item added to `DashboardMenu.tsx`, registered in `AppNavigator.tsx`

2. **School-branded splash screen**
   - `AppLoadingScreen` now reads cached school from AsyncStorage on mount (not just SchoolContext) — fixes timing race
   - `SplashRoute` added as `initialRouteName` — splash shows on EVERY cold launch (not just post-login)
   - `SplashRoute` routes to `Welcome` (not `Home`) so role resolution runs fresh
   - 1500ms minimum display duration enforced in `SplashRoute`
   - `WelcomeScreen` + `SchoolSelectorScreen`: now include `logo_url: school.school_logo_url` in `setCurrentSchool()` — was silently discarded before, causing logo to never cache
   - `schools.logo_url` synced from `school_branding.logo_url` for Tuto Demo School (DB fix)

3. **Admin role preserved after relaunch**
   - `SplashRoute` → `Welcome` (not `Home`) ensures `WelcomeScreen` fetches fresh associations and re-resolves role (admin > teacher > parent)

4. **Sign-out** (`SettingsHomeScreen`)
   - `supabase.auth.signOut()` called before `clearUser()` to terminate server session

5. **School admin code redemption** (`school.service.ts`)
   - `redeemAdminCode` now inserts into `school_users` with `role: 'admin'` (was incorrectly using legacy `school_admins` table)

6. **Role deduplication** (`school.service.ts`)
   - `getUserSchoolAssociations` deduplicates by `school_id`, keeps highest-privilege role (admin > teacher > parent)
   - Fixes case where user with both admin + teacher rows for same school saw duplicate cards

7. **Teacher role badge** (`SchoolSelectorScreen.tsx`, `translations/index.ts`)
   - Teacher role now shows "Teacher" badge (was falling through to "Parent")

8. **Debug log cleanup** (`AuthUnifiedScreen.tsx`, `WelcomeScreen.tsx`)
   - Removed all `fetch('http://127.0.0.1:7242/ingest/...')` debug blocks

---

## Key File Map (Mobile)

| File | Purpose |
|---|---|
| `src/navigation/AppNavigator.tsx` | Navigation stack. `SplashRoute` = initial screen. `RoleGate` = post-login role resolver |
| `src/components/common/AppLoadingScreen.tsx` | School-branded splash (reads AsyncStorage + SchoolContext) |
| `src/screens/WelcomeScreen.tsx` | Post-login router: fetches school associations, sets currentSchool, routes to admin/teacher/parent view |
| `src/screens/SchoolSelectorScreen.tsx` | Multi-school picker — must include `logo_url` in setCurrentSchool |
| `src/services/school.service.ts` | `getUserSchoolAssociations` (RPC + dedup), `redeemAdminCode` |
| `src/services/settings/branding.ts` | `uploadLogo` — syncs to both `school_branding` and `schools` tables |
| `src/screens/school/AdminHelpSupportScreen.tsx` | Help & Support for school admins |
| `src/contexts/SchoolContext.tsx` | `currentSchool` state + AsyncStorage persistence. `refreshSchoolData` joins `school_branding` |

---

## Pending / Known Issues

- No pending issues as of 2026-04-28
- Next planned work: screenshot document for school staff onboarding (Vietnamese)

---

## OTA / Release Process

```bash
# OTA update (JS-only changes, no native):
eas update --branch production --message "description"

# Full native build (requires new App Store submission):
npx expo run:ios --configuration Release   # simulator test
eas build --platform ios --profile production
```

**Never commit `.env` or `.env.local`.**
