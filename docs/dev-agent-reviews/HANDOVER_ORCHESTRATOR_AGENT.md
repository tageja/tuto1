# Orchestrator Agent Handover

_Last updated: 2026-04-28 by agent session [Mobile OTA + Splash Fixes](56e589a4-07fa-4dea-a2ac-6d43c3adec8e)_

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
- **Storage buckets:** `school-logos` (legacy), `school-branding` (active — logo + header)
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
