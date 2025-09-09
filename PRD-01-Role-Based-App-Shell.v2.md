# PRD 01 (v2) — Role‑Based App Shell (Single Build, Multi‑Experience)
**Project:** Tuto (React Native + Expo Router)  
**Owner:** You (with Cursor GPT‑5)  
**Date:** 2025-08-16  
**Status:** Ready for implementation

---

## 0) Scope & Goals
**Goal:** Ship one mobile build that conditionally loads **Teacher** or **Parent/Student** experiences after login, based on role from Airtable (optionally mirrored into Firebase custom claims).  
**Success looks like:**
- Returning user lands on the correct shell in **< 2.0s** on mid‑range devices.
- **0** cross‑role navigation leaks; users can’t access other shell’s routes.
- Role switching works for multi‑role users without app reinstall.

**Out of scope:**
- Deep teacher/parent features beyond shell and tabs.
- Full SSO provider matrix; start with **Google** + **Email/Password** (Phone/Apple later).
- Payments, classes data, or messaging internals.

---

## 1) User Stories & Flows
**US‑1:** As a teacher, after I sign in I should land on the **Teacher** app (tabs: Classes, Students, Inbox, Profile).  
**US‑2:** As a parent or student, after I sign in I should land on the **Parent/Student** app (tabs: Home, Messages, Profile).  
**US‑3:** As a first‑time user, if my role is unknown, I’m prompted to set it once.  
**US‑4:** As a multi‑role user (e.g., teacher & parent), I can switch roles in Profile and the app shell updates instantly.

**Entry points & guards:**
- Unauthenticated → `/(auth)/signin`  
- Authenticated & role missing → `/(onboarding)/role-setup`  
- Authenticated & role=teacher → `/(teacher)`  
- Authenticated & role in {parent, student} → `/(parent)`

**Flow: Sign‑in → Role Resolution → Shell**
1) Firebase sign‑in success → fetch `Users` by `firebaseUid`.  
2) If none/role empty → `role-setup` to persist role.  
3) Cache `activeRole` in AsyncStorage; route to the shell.  
4) On cold start, use cached `activeRole` for instant route; revalidate in background (no flicker).

---

## 2) Data Model (Airtable)
**Users**
- `id` (pk), `firebaseUid` (unique), `role` (single select: parent|student|teacher)
- optional: `roles` (multi-select), `activeRole` (text), `name`, `email`, `phone`, `language`

> Constraint: `firebaseUid` must be unique. If user exists but `role` empty, force role setup.

---

## 3) APIs (Firebase Functions) — New Endpoints
> Reason: avoid exposing Airtable API key from client. All Airtable reads/writes go through Functions.  
> Auth: **Require Firebase ID token** in `Authorization: Bearer <idToken>` header for all endpoints.

### 3.1 `POST /api/users/getByUid`
- **Body:** `{ "uid": "firebase-uid" }`
- **Response 200:** `{ "ok": true, "user": { "id": "usr_...", "firebaseUid": "…", "role": "teacher", "name":"...", "language":"vi" } }`
- **404:** `{ "ok": false, "code": "NOT_FOUND" }`

### 3.2 `POST /api/users/upsertRole`
- **Body:** `{ "uid": "firebase-uid", "role": "teacher" | "parent" | "student" }`
- **Response 200:** `{ "ok": true }`
- **400:** `{ "ok": false, "code": "INVALID_ROLE" }`

### 3.3 (Optional) `POST /api/users/setActiveRole`
- **Body:** `{ "uid": "firebase-uid", "activeRole": "teacher" | "parent" | "student" }`
- **Response 200:** `{ "ok": true }`

**Shared error payload:** `{ "ok": false, "code": "ERROR_CODE", "message": "human readable" }`

> Rate limiting: 60 req/min/IP.  
> Logging: log uid, route, latency, and result code.

---

## 4) UI (Wireframe notes + i18n keys)
**Design system:** Keep using existing theme (`theme.ts`), MaterialIcons, current spacing/radius. No colour/style changes unless specified. Use NativeWind classes if already present; otherwise inline styles as in current code.

**Screens**
- `(auth)/signin.tsx`
  - Elements: Logo, Title, `AuthButton.Google`, `AuthButton.Email`.  
  - i18n keys:  
    - `auth.title` = "Sign in to Tuto"  
    - `auth.google` = "Continue with Google"  
    - `auth.email` = "Use Email / Password"  
    - `auth.error.generic` = "Couldn’t sign you in. Please try again."

- `(onboarding)/role-setup.tsx`
  - Elements: Title, 3 cards (Parent/Student/Teacher), Continue button (disabled until pick).  
  - i18n keys:  
    - `role.title` = "Who are you?"  
    - `role.parent` = "Parent / Guardian"  
    - `role.student` = "Student"  
    - `role.teacher` = "Teacher"  
    - `role.saving` = "Saving…"

- `(parent)/_layout.tsx` (Tabs: home, messages, profile)  
  - Tab titles: `tabs.home`, `tabs.messages`, `tabs.profile`

- `(teacher)/_layout.tsx` (Tabs: classes, students, inbox, profile)  
  - Tab titles: `tabs.classes`, `tabs.students`, `tabs.inbox`, `tabs.profile`

> Avoid hardcoded strings. Add all keys to your `translations.ts` (vi default, en fallback).

---

## 5) Permissions (Roles/Visibility Rules)
- `teacher` → may access only routes within `/(teacher)/**` shell.  
- `parent`/`student` → may access only `/(parent)/**`.  
- Role is checked both in **router gate** and **API layer** (server filters by uid → user.role).  
- Never include links to the other shell in tab bars or menus.

---

## 6) Analytics (Events)
- `auth_login_success` {provider}  
- `auth_login_error` {code}  
- `role_resolved` {role, fromCache}  
- `auth_route_guard_redirect` {target}  
- `role_switch` {to}

Implement with your existing analytics wrapper; if none, create a light utility with `console.info` as fallback.

---

## 7) Performance & Offline
- Cache `activeRole` in AsyncStorage and use on cold start to route immediately.  
- Revalidate role via `/api/users/getByUid` in background; only replace route if changed.  
- If offline at startup and no cache → go to `(auth)/signin` and show offline banner.  
- Target time to shell < **2.0s** (cached).

---

## 8) Timeline & Milestones (Priority)
**M0 — Setup (0.5 day)**
- Create route groups `(auth)`, `(onboarding)`, `(parent)`, `(teacher)` with stub screens.

**M1 — Auth + Context (1 day)**
- Firebase Auth wiring (Google + Email), `AuthProvider` context.

**M2 — Airtable + Functions (1 day)**
- Create Functions: `getByUid`, `upsertRole`. Add server Airtable client.

**M3 — Role Gate & Shells (1 day)**
- Implement RoleGate in `app/_layout.tsx` + AsyncStorage cache + tab shells.

**M4 — QA & Telemetry (0.5 day)**
- Instrument analytics, add basic tests, fix navigation edge cases.

> Total: ~4 days of focused implementation time.

---

## 9) Deliverables (What Cursor should implement)
- Route groups & stub screens as above.  
- `AuthProvider` with `{ firebaseUser, role, loading, refreshProfile, setActiveRole }`.  
- RoleGate in `app/_layout.tsx`.  
- Firebase Functions (`/api/users/getByUid`, `/api/users/upsertRole`).  
- Airtable helpers in Functions layer (no API key on client).  
- AsyncStorage caching for `activeRole`.  
- i18n keys added to translations (vi/en).  
- Analytics events wired.  
- Update **FEATURE_BACKLOG.md** with tasks.

---

## 10) Risks & Edge Cases
- Role changes server-side while app offline → corrected on next revalidation.  
- Deleted Airtable user but valid Firebase user → create user on the fly then prompt role setup.  
- Deep links targeting the wrong shell → intercept and route to shell root.

---

## 11) QA Test Plan (Essentials)
- New user → Sign in → Role setup → Correct shell.  
- Returning user → Cold start routes instantly via cache; background revalidation OK.  
- Multi‑role (simulated) → Switch role from Profile; shell changes without crash.  
- Offline start → If cached role exists, open shell; else show signin + offline banner.  
- API failures → Fallback messaging; retry works.
