# Handover — Orchestrator Agent (Tuto Main Project)

> **Scope**: this file covers the **Tuto main project** — mobile app + web dashboard + Firebase Functions backend. It does **NOT** cover the NurseEd / `apps/med` project, which has its own orchestrator file at `apps/med/docs/dev-agent-reviews/HANDOVER_ORCHESTRATOR_AGENT.md`. Keep them separate; never mix tasks across the two.

---

## 1. Your Role

You are the **Orchestrator Agent** for the Tuto main project. Your job is *not* to write code directly — it is to:

1. **Understand the current state** of the repo, deployments, database, and live customer issues *before* doing anything.
2. **Listen to the product owner** (Tarun) and translate his requests into precise, actionable handover documents for specialist dev agents.
3. **Assign the right scope and guardrails** to each agent so they stay inside the project's architecture (mobile vs web vs functions).
4. **Track what has been built / fixed** so you never duplicate work or contradict prior decisions.
5. **Triage urgent customer issues yourself** when a fix is small (single file, <100 LOC) and clearly understood — but escalate to a dev agent when scope grows.
6. **Verify every dev agent's claims personally** ("build passes", "no new TS errors", "deployed") by re-running the checks. Do not trust output blindly.
7. **Update this file** as you learn new lessons, ship new fixes, and discover quirks.

You think like a senior engineering manager + product architect combined. You understand both what the user wants emotionally (urgency, customer-facing impact) and what it takes technically to deliver cleanly.

---

## 2. The Project

**Tuto** is a multi-tenant Vietnamese ed-tech platform with three audience-facing surfaces backed by a single Supabase database and a shared Firebase Functions API layer.

| Surface | Tech | URL | Purpose |
|---|---|---|---|
| **Mobile app** | React Native + Expo (`src/`) | App Store / Play Store, build channel `eas.json` | Parents, teachers, students. Primary product. |
| **Web dashboard** | Next.js 16 App Router (`apps/dashboard/`) | `tutoglobal.com` (production), `tuto-murex.vercel.app` (Vercel alias) | School admins, parents, teachers, **and** Tuto's internal admins (`/tutoadmin`). |
| **Backend API** | Firebase Functions (`functions/src/`) | `*.cloudfunctions.net` | Shared business logic + Airtable + Supabase access for both apps. |

**Sister project** (different repo concern, same monorepo): NurseEd (`apps/med/`) → `med.tuto.asia`, deploys from the `nursemed` branch, owned by a different orchestrator. **Do not touch `apps/med/` from this role.**

---

## 3. Monorepo Layout

```
tuto/                            ← git root, single repo "tageja/tuto1"
├── src/                         ← Mobile app (React Native + Expo)
│   ├── screens/                 ← All screens (38 files)
│   ├── components/
│   ├── navigation/
│   ├── services/                ← backend.* services that call Functions
│   ├── contexts/                ← AuthContext etc.
│   └── hooks/
├── apps/
│   ├── dashboard/               ← Web dashboard (Next.js 16 App Router) ← YOUR primary web concern
│   │   ├── app/
│   │   │   ├── (home)/          ← Marketing landing
│   │   │   ├── login/           ← Login + register
│   │   │   ├── home/            ← Authed user home
│   │   │   ├── school/          ← School admin/teacher/parent areas (legacy & URL-based both exist)
│   │   │   │   ├── admin/       ← Legacy "demo" admin pages (kept for back-compat)
│   │   │   │   └── [schoolId]/  ← URL-based admin/teacher/parent (canonical)
│   │   │   │       ├── admin/
│   │   │   │       ├── teacher/
│   │   │   │       └── parent/
│   │   │   ├── tutoadmin/       ← Internal Tuto staff dashboard (only @tutoglobal.com emails)
│   │   │   └── api/             ← Next.js Route Handlers (~120 endpoints)
│   │   ├── components/
│   │   ├── contexts/            ← AuthContext, SchoolContext, I18nContext
│   │   ├── lib/                 ← supabase client, formatters, school helpers, import logic
│   │   └── docs/                ← Dashboard-specific design notes (rare)
│   └── med/                     ← NurseEd (NOT YOURS — different orchestrator)
├── functions/                   ← Firebase Functions (shared API for both apps)
│   └── src/
│       ├── index.ts             ← Entry; exports all v1 functions
│       ├── v1/
│       │   ├── airtable.ts      ← airtableService — single source for Airtable access
│       │   ├── teachers.ts
│       │   ├── students.ts
│       │   ├── school-classes.ts
│       │   ├── school-students.ts
│       │   ├── school-teachers.ts
│       │   ├── notifications.ts
│       │   ├── payments.ts
│       │   ├── bookings.ts
│       │   ├── reviews.ts
│       │   ├── auth.ts          ← JWT middleware
│       │   └── cors.ts
│       ├── moderation/
│       └── webhooks/payments.ts
├── packages/                    ← Workspace packages (shared across apps)
│   ├── api/                     ← @tuto/api — shared API contracts
│   ├── i18n/                    ← @tuto/i18n — shared translations
│   ├── shared/                  ← @tuto/shared — utility types
│   └── ui/                      ← @tuto/ui — shared UI primitives
├── supabase/
│   └── migrations/              ← Sequential SQL migrations (001..053)
│       (note: 04x and 05x prefixed `nursed_` belong to NurseEd; you do not own them)
├── airtable/                    ← Airtable schema snapshot (schema.json + .d.ts)
├── docs/
│   ├── dev-agent-reviews/       ← THIS folder — main-project handovers + this file
│   ├── prd-specs/               ← Product specs
│   ├── DATA_DICTIONARY.md       ← Airtable + Postgres field reference
│   └── feature_schema_map.yml   ← Feature → table mapping
├── scripts/                     ← One-off DB / seed / migration scripts
├── .github/workflows/           ← CI
├── firebase.json, firestore.rules
└── package.json                 ← Workspaces: apps/*, packages/*
```

### File-ownership rules

- **Mobile features** → only `src/`
- **Web dashboard features** → only `apps/dashboard/`
- **Backend / shared business logic** → only `functions/src/`
- **DB schema** → only `supabase/migrations/NNN_*.sql` (do **not** prefix with `nursed_`)
- **Cross-app contracts** → `packages/api`, `packages/shared`, `packages/i18n`
- **NurseEd (`apps/med/`)** → off-limits; route to the NurseEd orchestrator instead

---

## 4. The Critical Architecture Rule (read this twice)

**ALL data access from BOTH the mobile app and the web dashboard MUST go through Firebase Functions.**

```
Mobile (src/)     ─┐
                   ├──→ Firebase Functions ──→ Airtable / Supabase
Web (apps/dashboard/) ─┘   (functions/src/)        (single source of truth)
```

This rule exists because:

1. Code reuse — don't duplicate Airtable queries in both apps.
2. Security — Airtable PAT lives only in `functions/.env`, never in `apps/dashboard/.env.local` or `src/.env`.
3. Consistency — both apps return the same data shape from the same code.
4. Maintenance — change once, applies everywhere.

**Red flag in code review**: any Airtable PAT or direct Airtable URL inside `apps/dashboard/` or `src/` → it should move to `functions/src/v1/airtable.ts` and be exposed via a Function.

**Practical exception (current reality)**: many `apps/dashboard/app/api/*` routes call Supabase directly through `apps/dashboard/lib/supabase.ts`. That is acceptable for Supabase-only data (the dashboard already has Supabase credentials) but Airtable access must still go through Functions.

See the workspace rule `.cursor/rules/rules.fullstack.mdc` for the full doctrine.

---

## 5. Database — Supabase

**Project**: `fkjeggdxqifqqwhuqpgm.supabase.co` (production). The MCP server `user-supabase-tuto` is wired to this project — use it for SQL inspection and migration application.

> The same Supabase project is **also** used by NurseEd (its tables are prefixed `nursed_*`). When you write SQL, only touch non-prefixed tables; let the NurseEd orchestrator manage `nursed_*`.

### Key tables (main project)

| Table | Purpose |
|---|---|
| `auth.users` | Supabase Auth (managed) |
| `public.users` | App profile rows; FK `auth_user_id → auth.users.id`. Has `role` column (`admin`, `school_admin`, `teacher`, `parent`). |
| `schools` | One row per school. `school_code`, `parent_pin`, `status`. |
| `school_admins` | `(school_id, user_id)` link table for school-level admins. |
| `school_users` | Multi-role join with `role` column (legacy + still in use). |
| `school_teachers` | Per-school teacher records (status, subjects, …). |
| `school_students` | Per-school student records. |
| `school_classes` | Class rosters within a school. |
| `school_invitations` | Pending invites with `token`, `status`, `invitation_type`. |
| `parent_pin` (column on `schools`) | 4-6 digit PIN parents enter to link to school. |
| `homework_*`, `attendance_*`, `messages`, `announcements`, `events`, `feedback`, `notifications`, `progress_reports`, `payments`, `health_*`, `medicine_*`, `photo_albums` | Feature-scoped. See `docs/feature_schema_map.yml`. |

### RLS — important caveat

`public.users` has RLS enabled with a **`auth_user_id = auth.uid()` SELECT policy**. PostgREST returns **HTTP 406** for `.single()` queries when RLS filters everything out (e.g. JWT missing/expired). A 406 here is almost always a session problem, not a DB problem. See "Lessons learned" #7.

### Migrations

- Numbered sequentially: `001_initial_schema.sql` … `053_*.sql`.
- Files prefixed `04x_nursed_*` and `05x_nursed_*` belong to NurseEd.
- New main-project migrations should pick the next free number that is **not** a `nursed_*` slot.
- Apply via Supabase MCP (`apply_migration` tool) or the SQL editor.
- Always inspect existing schema with the `user-supabase-tuto` MCP server's `list_tables` and `execute_sql` tools before authoring a migration.

### MCP servers available to the orchestrator

| Server | Use for |
|---|---|
| `user-supabase-tuto` | SQL queries, migrations, RLS inspection on the main Tuto Supabase project |
| `user-supabase-oioi` | (separate project — verify before using) |
| `project-0-tuto-vercel` | List deployments, get build logs, monitor production for the `tuto` Vercel project |
| `user-vercel`, `plugin-vercel-vercel` | General Vercel API access |
| `cursor-ide-browser` | Live browser smoke-tests of the deployed dashboard |

---

## 6. Deployment

### Web dashboard (`apps/dashboard/`)

| Item | Value |
|---|---|
| Platform | Vercel |
| Vercel team | `tarun-tagejas-projects` (id `team_lEgbPvI9vppuQCVFpFCJVA8P`) |
| Vercel project | `tutomain` (id `prj_XIHnBOXutzrHb3G7IVOVZy4pfAXw`) — note: project was previously named `tuto`; ID is unchanged. The MCP server `project-0-tuto-vercel` still uses the old name in its identifier but points at this project. |
| Production branch | **`main`** |
| Production aliases | `tuto-murex.vercel.app`, `tutoglobal.com`, `www.tutoglobal.com` |
| Framework | Next.js 16 |
| Install command | `cd ../.. && npm install --legacy-peer-deps` (monorepo-aware, set in `apps/dashboard/vercel.json`) |
| Build command | `npm run build` (= `next build`) |
| Region | `iad1` |

**Production branch must remain `main`.** In April 2026 the production branch silently switched to `nursemed` (a `nursemed` PR was promoted to production), which masked main's build failures for ~2 weeks. If you ever see a `nursemed` commit running on `tutoglobal.com`, fix the Vercel project settings immediately.

### Mobile app (`src/`)

| Item | Value |
|---|---|
| Platform | Expo + EAS Build |
| Config | `eas.json`, `app.json`, `app.config.js` |
| Stores | iOS App Store, Google Play |
| Current version | `2.1.1` (build 21) — bumped via commits `c7cf914`, `dcf14c5` |
| iOS bundle | `com.tuto.app` (verify with `app.config.js` before bumping) |

### Firebase Functions

| Item | Value |
|---|---|
| Project | configured in `.firebaserc` |
| Deploy | `npm run deploy:firebase` (root) |
| Region | default `us-central1` (verify in `functions/src/index.ts`) |

### Branches

| Branch | Owner | Deploys to |
|---|---|---|
| `main` | Main-project orchestrator (you) | `tutoglobal.com` production |
| `nursemed` | NurseEd orchestrator | `med.tuto.asia` production |
| feature branches | dev agents | preview deployments only |

**Cross-branch hygiene**:
- Never merge `nursemed` → `main` without explicit Tarun approval. NurseEd has its own evolving schema and would clobber main's UI.
- When a `lib/` file diverges between branches (e.g. `apps/dashboard/lib/supabase.ts` did in April 2026), assume the more-recently-touched branch is the intended one and port that fix to the other branch as a separate commit. Document the port in the commit message so future audits can see it.
- Periodically (every ~2 weeks) check `git log main..nursemed -- apps/dashboard/lib/` and `git log nursemed..main -- apps/dashboard/lib/` to catch drift early.

---

## 7. Authentication Model

The dashboard uses **Supabase Auth** with `@supabase/ssr` + `@supabase/supabase-js`. The mobile app uses Supabase Auth too (separate session storage).

### Roles → routing

| `public.users.role` | Default landing page | Can access |
|---|---|---|
| `admin` | `/tutoadmin` | All schools, all data, internal tooling |
| `school_admin` | `/school/[schoolId]/admin` | Only their linked school(s) (via `school_admins` table) |
| `teacher` | `/school/[schoolId]/teacher` | Their classes |
| `parent` | `/school/[schoolId]/parent` or `/home` | Their children |

The role mapping logic lives in `apps/dashboard/lib/school/auth.ts`. The user-to-schools resolution lives in `apps/dashboard/app/api/school/user-schools/route.ts` — this route was buggy in April 2026 (returned all schools for everyone). When in doubt, re-read it before assuming role behaviour.

### `AuthContext` (`apps/dashboard/contexts/AuthContext.tsx`)

- Single source of `user`, `supabaseUser`, `accessToken`, `loading`.
- `signIn()` and `signUp()` are blocking; `signOut()` is **fire-and-forget + hard redirect** (intentional — see Lesson #4).
- Profile fetch (`fetchUserProfile`) has a single 15s timeout. **On timeout it must NOT call `supabase.auth.signOut()`** — doing so kills in-flight queries on the same page (returns 406s) and creates redirect loops on routes like `/tutoadmin`. See Lesson #7.

### `/tutoadmin` access

- Gated by **email domain** check in `apps/dashboard/app/tutoadmin/layout.tsx` (`@tutoglobal.com` only).
- Has its own `supabase.auth.onAuthStateChange` listener — be careful, this races with `AuthContext`'s listener. Both must agree on session state.

---

## 8. Test Accounts & Demo Data

### Production Tuto admin

| Field | Value |
|---|---|
| Email | `tarun@tutoglobal.com` |
| Role (`public.users.role`) | `admin` |
| `auth_user_id` | `9c107921-1730-4481-8e02-77fffab593d4` |
| Use | Internal QA on `/tutoadmin` |

If this account loses admin access (e.g. shows the teacher view), update directly in Supabase:
```sql
UPDATE public.users SET role = 'admin'
WHERE auth_user_id = '9c107921-1730-4481-8e02-77fffab593d4';
```

To force-logout from server side (browser cache stuck loop):
```sql
DELETE FROM auth.sessions WHERE user_id = '9c107921-1730-4481-8e02-77fffab593d4';
DELETE FROM auth.refresh_tokens WHERE user_id = '9c107921-1730-4481-8e02-77fffab593d4';
```
Then have the user clear localStorage/cookies for `tutoglobal.com` and hard-refresh.

### Tuto Demo School test accounts (use these for QA on `tutoglobal.com`)

All three live in Supabase, password `password`, email pre-confirmed, linked to **Tuto Demo School** (`school_id = bed99290-1b7c-4e90-ac55-0ec7f496491b`). Use them to QA cross-role flows without touching the real customer (`Empower English`).

| Email | `public.users.role` | Linked via | Use for |
|---|---|---|---|
| `schooladmin@tutoglobal.com` | `school_admin` | `school_users` (role='admin') **AND** `school_teachers` (so `get_user_school_ids()` resolves it under RLS) | School-admin sidebar, Help & Support feedback flow, school-scoped pages |
| `schoolteacher@tutoglobal.com` | `teacher` | `school_teachers` (status='active') | Teacher dashboard, class roster views |
| `schoolparent@tutoglobal.com` | `parent` | `school_parents` (joined_via_pin=true) | Parent dashboard, child views |

> **Do not delete these accounts.** If they ever stop working, recreate via the SQL pattern below — note the trigger `on_auth_user_created` reads `role` from `raw_user_meta_data` and auto-creates the `public.users` row, so you only insert into `auth.users` then add the role-specific link row.

```sql
DO $$
DECLARE
  v_school_id uuid := 'bed99290-1b7c-4e90-ac55-0ec7f496491b';
  v_auth_id   uuid := gen_random_uuid();
  v_user_id   uuid;
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (
    v_auth_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'NEW_EMAIL@tutoglobal.com',
    crypt('password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"NAME","role":"ROLE"}'::jsonb,  -- role: school_admin / teacher / parent
    now(), now(), '', '', '', ''
  );
  SELECT id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;
  -- Then add the role-specific link row:
  --   teacher      -> public.school_teachers (school_id, user_id, name, email, status='active')
  --   parent       -> public.school_parents  (school_id, parent_user_id, joined_via_pin=true)
  --   school_admin -> public.school_users    (school_id, user_id, role='admin')
  --                 + public.school_teachers (so get_user_school_ids() resolves the school)
END $$;
```

### NurseEd test learner (different project — for reference only)

`test@test.com` / `password` on `med.tuto.asia`. **Do not use for main-project flows.**

### Real customer schools currently on production

- `Empower English` (Vietnamese ESL school, Bien Hoa) — admin: `nhule@empowerenglish.edu.vn`. Onboarded April 2026.
  - `school_id`: `65498184-1615-40f4-b2b5-5267a458696c`
  - Mobile app cannot self-register school admins yet (only parent/teacher) — admins are seeded directly in Supabase by the orchestrator at onboarding time.

---

## 9. Customer-Facing Issues — Recently Fixed

> Each entry: what the customer reported → root cause → fix commit → file touched. Use these as templates for your own bug write-ups.

### April 19, 2026 — Build failing with `supabaseUrl is required`

- **Symptom**: All `main` deploys failed at "Collecting page data" for `/api/activities/bulk`.
- **Cause**: `apps/dashboard/lib/supabase.ts` used `export const supabase = createClient(...)` at module top level. Next.js 16 / Turbopack evaluates API route modules during build with no env vars → crash. The lazy-proxy fix existed on `nursemed` but was never merged to `main`.
- **Fix**: commit `4b897f2` — port lazy proxy pattern + getter for `db.storage`.
- **Lesson**: When `nursemed` deploys are working but `main` isn't, diff `apps/dashboard/lib/` between the two.

### April 19, 2026 — `school_admin` users see all schools

- **Symptom**: `nhule@empowerenglish.edu.vn` (school admin for Empower English) saw every test school in the dropdown and the dashboard rendered the wrong school's data.
- **Cause**: `apps/dashboard/app/api/school/user-schools/route.ts` ignored the `uid`/`role` query params and returned all active schools.
- **Fix**: commit `1bb84a6` — query `public.users` for the caller's role, return only `school_admins`-linked schools for `school_admin`, all schools for `admin`, empty otherwise.
- **Lesson**: A "loading code…" or wrong-data screen for a real customer is a P0 — drop everything and trace.

### April 19, 2026 — Sign-in / sign-out hangs ("dark screen")

- **Symptom**: User clicks Sign Out → screen goes dark for 20+ seconds; sometimes Sign In never completes.
- **Cause**: Multiple issues stacked: blocking `await supabase.auth.signOut()` → race between `signIn()` and the `onAuthStateChange` listener double-fetching the profile → `TOKEN_REFRESHED` triggering redundant DB calls → stale browser cache.
- **Fix**: commit `8f0d2a7` — `clearLocalAuthState()` synchronously, `signOut()` becomes fire-and-forget + hard `window.location.replace('/login')`, `signingInRef`/`signingOutRef`/`lastFetchedUserIdRef` dedupe profile fetches.
- **Lesson**: Auth flows must never block the UI. The user-perceived flow is "click → instant visible change → background cleanup".

### April 20, 2026 — `/tutoadmin` redirect loop

- **Symptom**: `tarun@tutoglobal.com` could access `/home` fine but `/tutoadmin` immediately bounced back to `/login`. Console showed "Profile fetch timed out twice. Signing out." then 406s on `users?auth_user_id=eq.9c107921…`.
- **Cause**: `AuthContext.fetchUserProfile` had a 6s+4s race-on-timeout. When Supabase was cold, the timeout fired, called `signOut()` which nuked the JWT mid-flight. Other queries on the same page returned 406 (RLS denies — no `auth.uid()`). `/tutoadmin`'s own listener saw `SIGNED_OUT` and redirected. Plus over-broad keyword matching (`'auth'`, `'unauthorized'`) on error messages was treating 406 bodies as session-expired.
- **Fix**: commit `2869869` — single 15s timeout, no sign-out on timeout (keep `supabaseUser` + `accessToken`), only sign out on actual JWT codes (`PGRST301`, `PGRST302`, `401`).
- **Lesson**: 406 from PostgREST is almost always a JWT/RLS mismatch, not a database row issue. Verify the row exists *and* the JWT is valid before "fixing" downstream.

### April 23, 2026 — School admin sidebar redirects everyone to "Sunrise International School"

- **Symptom**: Logged in as `schooladmin@tutoglobal.com` (linked to Tuto Demo School). Dashboard landing page correctly showed "Tuto Demo School", but the moment the user clicked Settings / Help / Feedback / Classes / any sidebar link, the URL switched to `/school/Sunrise International School/admin/...` — a school they don't belong to.
- **Causes** (two stacked bugs):
  1. `apps/dashboard/components/school/AdminSidebar.tsx` had a literal hardcoded fallback string `'Sunrise International School'` for `schoolId` whenever neither `schoolIdFromUrl` nor `selectedSchool` resolved (which was every fresh login with empty `localStorage` on `/school/admin`).
  2. `apps/dashboard/app/api/school/user-schools/route.ts` queried the **legacy `public.school_admins` table** for `school_admin` users — that table has only 1 row in production, while `public.school_users` (with `role='admin'`) has 3. So `availableSchools` came back as `[]` and the hardcoded fallback fired.
- **Fix**: commits `28e799e` + `28fcfea` —
  - Replace fallback in `AdminSidebar.tsx` with `schoolIdFromUrl → selectedSchool → availableSchools[0] → ''`.
  - Switch both `apiAuth.ts::assertSchoolAdminCanAccessSchool` and `app/api/school/user-schools/route.ts` to query `public.school_users` with `role='admin'` (the canonical table — the one `get_user_school_ids()` RLS helper also keys off via `school_teachers`).
- **Lesson**: When you find a legacy-table-vs-canonical-table bug in one file, **grep the whole repo for the wrong table name** before closing the ticket. We almost shipped the same bug twice (caught the second occurrence only during local QA).

### April 23, 2026 — Tuto-admin feedback inbox returns empty / 401

- **Symptom**: `tarun@tutoglobal.com` opened `/tutoadmin/feedback` after a school admin submitted feedback — inbox showed empty + 401 in the network tab.
- **Cause**: The two new pages `app/tutoadmin/feedback/page.tsx` and `app/tutoadmin/feedback/[id]/page.tsx` were calling `/api/platform-feedback/admin` with `credentials: 'include'` (cookie auth), but `requireBearerAuth` middleware on those routes only accepts `Authorization: Bearer <token>` headers. Cookie path always returned 401.
- **Fix**: commit `28fcfea` — explicitly read the Supabase access token via `supabase.auth.getSession()` and send it as `Authorization: Bearer <token>` (matches the working pattern already in use on the school-admin Help & Support page).
- **Lesson**: When adding new authed routes, copy the auth pattern from a known-working sibling, don't invent a new one. The dashboard has both cookie- and bearer-style auth in different places — pick the one matching the API route's middleware.

### April 20, 2026 — School CSV import fails for Vietnamese schools

- **Symptom**: Empower English uploaded student CSV; every row with DD/MM/YYYY date rejected as "Invalid date format". Vietnamese names rendered as `Nguy?n`, `M? H??ng`.
- **Causes**:
  1. `parseDate()` did `new Date("21/01/2018")` → JS interprets as MM/DD/YYYY → invalid.
  2. CSV parser passed raw buffer to `xlsx` which assumed UTF-8. The file was actually CP1258 (Vietnamese Windows codepage — Excel's default for VN locale unless "CSV UTF-8" is chosen). Multi-byte sequences became `?`.
- **Fix**: commit `b87ad97` — explicit DD/MM/YYYY parsing with smart fallback, plus encoding auto-detection in `apps/dashboard/lib/school/import/parser.ts` (UTF-8 BOM → UTF-8 → score CP1258 vs CP1252 vs UTF-8 by Vietnamese-character count). Added `iconv-lite` dependency.
- **Lesson**: The customer base is Vietnamese — assume DD/MM/YYYY and CP1258 by default, not US conventions.

---

## 10. Lessons Learned (read before any change)

1. **The customer base is Vietnamese.** Default to DD/MM/YYYY dates, CP1258 fallback for CSVs, Vietnamese first-language UX, NFC-composed Unicode. Do not assume US/UK conventions.

2. **Mobile and web must call the same Functions endpoints.** If you write a Next.js API route that talks to Airtable directly, you've created drift. Move it to `functions/src/v1/`.

3. **`main` and `nursemed` drift silently.** The April 2026 build outage was caused by a fix existing on `nursemed` for weeks while `main` was broken. Diff `apps/dashboard/lib/` every time you switch branches.

4. **Auth flows must be instant, never blocking.** `signOut()` is fire-and-forget + hard redirect. `signIn()` deduplicates with refs. Never `await supabase.auth.signOut()` inside a render-blocking path.

5. **Vercel production branch must be `main`.** If a `nursemed` commit shows up on `tutoglobal.com`, fix Vercel project settings before doing anything else.

6. **Supabase env vars are not present at build time.** Always lazy-init Supabase clients via a proxy or factory. Eager `createClient(...)` at module top level will crash the build.

7. **PostgREST 406 = JWT/RLS mismatch in 90% of cases.** Before "fixing" the data:
   - Confirm the row exists (SELECT in the Supabase MCP).
   - Confirm RLS policy uses `auth.uid()` correctly.
   - Confirm the request actually carried a valid Authorization header.
   - Check whether `signOut()` was called concurrently and nuked the JWT.

8. **Verify dev agents' claims personally.** When an agent says "build passes, zero TS errors", run `npm run build` and `npx tsc --noEmit` yourself. Use the line-offset trick: a pre-existing error at line 50 in the old version that now appears at line 53 is the same error, not a regression.

9. **`apps/dashboard/lib/supabase.ts` is load-bearing.** Both the eager-init bug and downstream RLS issues live here. Treat it like production-critical infra — small changes, careful review, integration tests.

10. **Two separate `Supabase` listener subscriptions can race.** `AuthContext` and `tutoadmin/layout.tsx` both subscribe to `onAuthStateChange`. If you add a third listener anywhere, document why and ensure they don't conflict.

11. **The `/api/school/user-schools` endpoint is the single source of "which schools can this user see".** Any role-scoping bug starts here. Never bypass it; never duplicate it.

12. **School admins cannot register themselves through the mobile app.** Current `RegisterScreen.tsx` only supports `parent` and `teacher`. `AdminOnboardingScreen` requires being already logged in. Until the mobile sign-up flow is extended, school admins are seeded by the orchestrator directly in Supabase at onboarding.

13. **Don't spam the `docs/` folder.** There are already ~80 markdown files at the root of `docs/`. Don't add summary/status documents unless asked. Update existing ones in brief.

14. **Don't waste tokens on long markdown reads.** Read what you need, in slices. The handover docs themselves are the exception (you must read them fully on session start).

15. **Split big work into agents.** If a task touches >3 files OR introduces a new step type / route group / DB table, write a `HANDOVER_<LETTER>_<NAME>.md` and ask Tarun for approval before kicking it off. Single-file, <100 LOC bug fixes you can do yourself.

---

## 11. How to Delegate to Dev Agents

When a task is too big for you to do directly, write a handover document in `docs/dev-agent-reviews/` and ask Tarun to spawn a dev agent. Format:

```
# Handover — Agent <LETTER> — <Title>

## Mission
<1-paragraph description of the user value being delivered>

## Scope (do this)
- Bullet list of files to change, endpoints to add, tables to migrate
- Be specific: paths, function signatures, contract shapes

## Out of scope (do NOT do this)
- Bullet list of adjacent work the agent might be tempted to take on
- Especially: mobile app changes, NurseEd touches, Firebase Function rewrites unless required

## Files & contracts
- File-by-file table of what changes and why

## DB migrations needed
- Migration filename + summary of CHECK constraints / new columns

## Translation keys to add
- All new EN + VI keys with their values

## Definition of Done
- [ ] Build passes (`npm run build` in `apps/dashboard`)
- [ ] `npx tsc --noEmit` shows no NEW errors **in your touched files** (the dashboard has ~500 pre-existing errors as of 2026-04-23 — see Note 6 below; do not let raw error count fool you)
- [ ] All new copy in EN + VI
- [ ] Tested manually on Vercel preview URL
- [ ] No direct Airtable calls (must go through Functions if Airtable involved)

## Dependencies on other agents
- E.g. "Agent Y must complete migration 054 before this agent starts"
```

Pick a single uppercase letter (A, B, C…) for each agent. Avoid reusing letters across active agents. Letters used so far for the main project (track this list as you spawn):

| Letter | Title | Status |
|---|---|---|
| MP-A | Platform Feedback (school admin → Tuto) — see `HANDOVER_MP-A_PLATFORM_FEEDBACK.md` | **Live in production (2026-04-28)** — `main` fast-forwarded to commit `28fcfea`, Vercel production deploy `dpl_DRaLuWBKT2oyegK4MHe1LEd1EFWC` READY on `tutoglobal.com` / `tuto.asia`. Migration `054_platform_feedback` applied. PR #4 auto-closed by GitHub on FF. Resend sender domain `tutoglobal.com` verified, `tarun@tutoglobal.com` receives notification on every new submission. |

(Note: NurseEd has used letters E–X. Their list is in `apps/med/docs/dev-agent-reviews/HANDOVER_ORCHESTRATOR_AGENT.md`. To avoid confusion if Tarun ever cross-references, prefix main-project agents with `MP-` if you wish, e.g. `MP-A`, `MP-B`. Optional — your call.)

---

## 12. Active Open Questions / Tech Debt

> Update this list as you learn more.

1. **Mobile admin self-registration**: `RegisterScreen.tsx` doesn't support school-admin sign-up via code. Currently a manual Supabase insert by the orchestrator. Needs proper UX (likely a new flow that accepts admin invitation tokens at registration).

2. **`school_users` vs `school_admins` vs `school_teachers`**: three overlapping tables for similar relationships. **Canonical: `public.school_users` with `role='admin'`** (3 rows in prod, used by `get_user_school_ids()` RLS helper indirectly via `school_teachers`). **Legacy: `public.school_admins`** (only 1 row in prod, do not write to it, do not read from it). The platform-feedback shipping in April 2026 was bitten twice by code that read from `school_admins` instead of `school_users` (`apiAuth.ts::assertSchoolAdminCanAccessSchool` AND `app/api/school/user-schools/route.ts`) — both fixed in commits `28e799e` + `28fcfea`. **Action**: a future cleanup task should drop `school_admins`, plus consolidate `school_users`+`school_teachers` into one, or at minimum add a lint rule that flags any reference to `school_admins`.

3. **Two parallel admin URL trees**: `app/school/admin/*` (legacy demo) vs `app/school/[schoolId]/admin/*` (canonical). Keep both for now but note: bug fixes for one often need to be applied to both.

4. **`apps/dashboard/contexts/AuthContext.tsx` is ~840 lines**. Refactor target: split into `useAuthSession`, `useUserProfile`, `useAuthActions` hooks. Not urgent but it's complex.

5. **`docs/` root is overgrown** (~80 unstructured `.md` files). Most are stale chat summaries. Periodic cleanup is welcome but only when explicitly approved.

6. **TypeScript errors**: `apps/dashboard` has **~500 pre-existing `tsc --noEmit` errors** as of 2026-04-23 (re-baselined during MP-A verification — earlier "~15" figure was stale). Most live in `lib/api/`, `lib/school/`, `lib/airtable/`, plus the auto-generated `.next-web/types/` (Next.js 16 async-params). Build still passes because `next.config.js` has `typescript.ignoreBuildErrors: true`. **Do not** try to "clean these up" wholesale — they're load-bearing. When verifying a dev agent, grep tsc output for the agent's touched paths only; raw count alone is meaningless. Cleaning up the TS baseline is a future dedicated task.

7. **Airtable PAT rotation policy** (`docs/AIRTABLE_PAT_POLICY.md`) calls for quarterly rotation. Track the next rotation date in a calendar — not in this file.

---

## 13. Standard Operating Procedure — Customer Bug Triage

When Tarun pings you with "X is broken in production":

1. **Acknowledge urgency**: customer-blocking issues are P0. Don't gather endless context first; gather enough to act.
2. **Reproduce or trace**:
   - Read the actual error from console / screenshot the user provides.
   - Use Supabase MCP (`execute_sql`) to confirm DB state.
   - Use Vercel MCP (`get_runtime_logs`, `list_deployments`, `get_deployment_build_logs`) for production-side traces.
3. **Identify root cause to the file + function level** before writing any fix. Surface-level "added a try/catch" fixes ship bugs.
4. **Fix on `main` branch directly** for customer-impacting bugs. Stash any in-progress work, `git checkout main`, fix, commit, push. Restore your stash after.
5. **Wait for the Vercel deploy to go `READY`** before telling the user to retry. Use the `project-0-tuto-vercel` MCP to poll status.
6. **Tell the user concretely**: what was wrong, what you changed, and the exact next action they should take (clear cache, re-upload file, hard refresh, etc.).
7. **Add the bug to Section 9** of this file with root cause + fix commit + lesson learned.

---

## 14. Standard Operating Procedure — New Feature Request

1. **Restate the request back to Tarun in plain language** to confirm intent.
2. **Check what already exists**: search `app/`, `components/`, `lib/` before designing anything new. The mobile app likely has an equivalent — mirror its data model.
3. **Decide scope**: small (≤3 files, no DB) you do; larger → write a HANDOVER doc.
4. **For DB changes**: write the migration first, get Tarun to apply via Supabase SQL editor or `apply_migration` MCP, *then* the dev agent ships application code.
5. **Always check if the feature needs to also exist on mobile**. Web-first features that diverge from mobile are tech debt.
6. **All user-facing text must be in `lib/i18n/` (mobile) or `apps/dashboard/lib/i18n/` / `packages/i18n/` (web)** in both EN and VI.

---

## 15. Quick Reference — Common Commands

```bash
# Build the dashboard locally
cd apps/dashboard && npm run build

# Type-check (expect ~500 pre-existing errors as of 2026-04-23 — see Note 6.
# Filter to your agent's touched paths to evaluate whether they introduced new errors.)
cd apps/dashboard && npx tsc --noEmit

# Dev server
cd apps/dashboard && npm run dev    # → http://localhost:3000

# Mobile dev
npm start                            # → Expo dev server (root)

# Apply Supabase migration via MCP (preferred)
# — use user-supabase-tuto MCP server's apply_migration tool

# Deploy Firebase Functions
npm run deploy:firebase              # from repo root

# Check Vercel deployment status
# — use project-0-tuto-vercel MCP server's list_deployments / get_deployment tools
```

---

## 16. Handover History (append every session)

> Each session: 1-2 lines summarising what was done, by whom, and any state the next orchestrator must know.

| Date | Orchestrator | Summary |
|---|---|---|
| 2026-04-19/20 | (Cursor agent) | Diagnosed + fixed: tarun role reset to admin, school_admin scoping bug (commit `1bb84a6`), Vercel build failure from eager Supabase init (commit `4b897f2`), sign-in/sign-out hang (commit `8f0d2a7`), `/tutoadmin` redirect loop (commit `2869869`), VN CSV import (commit `b87ad97`). Manually seeded Empower English admin account in Supabase. Created this orchestrator handover document. |
| 2026-04-23 | (Cursor agent) | Scoped agent **MP-A** (Platform Feedback: school admin → Tuto) — handover doc at `HANDOVER_MP-A_PLATFORM_FEEDBACK.md`. New table `platform_feedback` (migration `054`), new `is_tuto_admin()` SQL helper, new sidebar entries on `AdminSidebar` ("Help & Support") and `TutoAdminSidebar` ("Feedback"), email via **Resend SDK** (Tarun setting up Resend account + verifying `tutoglobal.com` domain — replaces initial nodemailer/Supabase-SMTP plan because Supabase warned that Gmail SMTP is for personal not transactional email). Awaiting `RESEND_API_KEY` env var before agent kickoff. Confirmed parent↔school feedback (`feedbacks` table, migration `025`) is a distinct domain and must not be conflated. |
| 2026-04-23 | (Cursor agent) | **MP-A shipped + branch rescue.** Dev agent MP-A built the platform-feedback feature on the `nursemed` branch by mistake (Lesson #5 violation). Recovered non-destructively by creating worktree `../tuto-mp-a` on new branch `feat/mp-a-platform-feedback` (off `origin/main`), porting only MP-A files (untracked dirs + `AdminSidebar.tsx`, `TutoAdminSidebar.tsx`, `I18nContext.tsx`, `lib/supabase.ts`, `package.json` mods), discarding nursemed-only WIP. Verified locally: `npm run build` ✅ (all 6 MP-A routes built), `npx tsc --noEmit` shows 0 new errors in MP-A paths (re-baselined total to ~500 pre-existing, see Note 6), Supabase migration confirmed applied (`platform_feedback` table + 3 RLS policies + `is_tuto_admin()` fn live), Resend send confirmed end-to-end. Also: deleted leaky `apps/dashboard/.evn.local.backup` (typo dodged `.gitignore`); added `!.env*.example` negation to root `.gitignore` so the new `apps/dashboard/.env.local.example` template can be committed; corrected Vercel project name `tuto`→`tutomain`. Lesson logged: **always confirm dev agents start from a branch off `origin/main` before kickoff** — make it a checklist item in every future handover. |
| 2026-04-28 | (Cursor agent) | **MP-A QA fixes + production promotion.** Local QA on `feat/mp-a-platform-feedback` surfaced 3 bugs, all fixed (commits `28e799e` + `28fcfea`): (1) `apiAuth.ts` queried legacy `public.school_admins` instead of `public.school_users` → 403 "Forbidden" on every school-admin feedback POST; (2) `AdminSidebar.tsx` had hardcoded `'Sunrise International School'` fallback + `app/api/school/user-schools/route.ts` had the same legacy-table bug → real school admins routed to wrong school on every sidebar click; (3) tutoadmin feedback pages used cookie auth where the API route requires bearer auth → 401 empty inbox. See Section 9 entries for full root-cause writeups. Created 3 Tuto Demo School test accounts (`schooladmin@`/`schoolteacher@`/`schoolparent@tutoglobal.com`, all password `password`) — see updated Section 8. **Promoted to production**: fast-forwarded `origin/main` from `b87ad97` → `28fcfea` (no merge commit, since the 3 commits branched cleanly off `origin/main`); PR #4 auto-closed; Vercel deploy `dpl_DRaLuWBKT2oyegK4MHe1LEd1EFWC` READY on `tutoglobal.com` after ~7min queue + 3min build. Logged Section 12 #2 with explicit canonical-vs-legacy table guidance to prevent this same bug repeating a third time. |
| | | |

---

**End of handover. Read sections 1–10 fully before your first action. Sections 11–16 are reference material.**
