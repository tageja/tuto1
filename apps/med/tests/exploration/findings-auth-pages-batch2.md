# Auth pages batch 2 — exploration findings

**Date:** 2026-05-21  
**Branch:** `agent-x-integration`  
**Base URL:** `http://localhost:3001`  
**Pages:** `/auth/login`, `/auth/register`, `/auth/verify`

---

## Summary

| Page | Status | Notes |
|------|--------|-------|
| `/auth/login` | OK | Bilingual static UI; password + magic-link tabs; Google OAuth; no EN/VI toggle |
| `/auth/register` | OK | Full name, email, password (min 8), optional invite code; no confirm-password field |
| `/auth/verify` | OK (after fix) | No query params → post-signup instructions; `?token=*` → invalid-link error state |

---

## A1 — `/auth/login`

### Layout
- **Desktop (1440×900):** Centered card, tuto.Pro logo, gradient background — renders correctly.
- **Mobile (390×844):** Same stack; form remains usable; no horizontal overflow observed.

### Validation
- **Empty submit:** HTML5 `required` on email/password — browser validation message; stays on `/auth/login`; no Supabase POST.
- **Invalid email (`notanemail`):** `type="email"` blocks submit; no auth POST.
- **Wrong credentials:** Red alert `Email hoặc mật khẩu không đúng.` (maps `Invalid login credentials`).
- **Valid `test@test.com` / `password`:** Redirects to `/learn/courses` (middleware default `next`).

### Links & navigation
- **Đăng ký** → `/auth/register` — works.
- **No forgot-password link** on this page (not implemented).
- **Magic link tab:** Password field hidden; OTP flow available (not fully E2E-tested — inbox required).

### i18n
- **No EN/VI toggle** on auth routes — copy is **bilingual inline** (e.g. `Đăng nhập / Sign in`, `Mật khẩu / Password`).
- Error messages are Vietnamese-first for known auth errors.

### Console
- No unhandled `pageerror` on load in Playwright hygiene checks.
- Dev-only hydration warnings possible on other routes; login page clean in batch run.

### Cross-cutting
- Logged-out `/learn` → `/auth/login?next=%2Flearn` (middleware).
- Logged-in `/auth/login` → `/learn/courses` (middleware).
- Browser **Back** after login: history may include login URL; user remains authenticated on `/learn` (acceptable).

---

## A2 — `/auth/register`

### Layout
- Centered card; fields: full name, email, password, optional hospital invite code.

### Validation
- **Empty submit:** HTML5 required blocks; no signup POST.
- **Invalid email:** HTML5 email validation blocks.
- **No confirm-password field** — mismatch scenario N/A.
- **Duplicate email:** Supabase returns error; UI shows `authError.message` in red box (e.g. user already exists).

### Links
- **Đăng nhập** → `/auth/login` — works.

### i18n
- Bilingual static labels; no language toggle.

### Console
- `GET /api/hospitals` on mount — mock in tests to avoid env flakiness.

---

## A3 — `/auth/verify`

### No query params
- Renders informational “check your email” state — **not** HTTP 500; no white screen.

### `?token=invalid-token-xyz`
- **Before fix:** Ignored token; same static success copy (misleading).
- **After fix:** Shows **Invalid link / Liên kết không hợp lệ** with login + register links.

### i18n
- Bilingual headings and body copy; no toggle.

---

## Phase 2 — Exploratory notes

| ID | Finding | Regression guard |
|----|---------|------------------|
| A | Password **show/hide** toggle on login (and register) | `bug-173` |
| B | No CAPTCHA / rate-limit UI on auth forms | Document only |
| C | Logout → `/learn` requires login again | Covered by `bug-002` + `bug-171` |
| D | Document titles: Sign in / Sign up / Verify email | `bug-174` |
| E | Keyboard Enter submits login form | `bug-176` |
| F | Login ↔ register cross-links | `bug-175` |
| G | Password toggle (aria-label) | `bug-163` (+ `@bug-173`) |
| H | Keyboard Enter on submit | Manual / `bug-165` click path (Tab→Enter flaky in full suite) |

---

## Setup / session

- `npx playwright test --project=setup` — may **reuse** `tests/.auth/learner.json` if cookies still valid; fresh login can timeout under Turbopack load — re-run setup if `bug-172` skips.

---

## Specs codified

`bug-163` … `bug-175` under `tests/e2e/regression/` (14 spec files; `@bug-173` merged into `bug-163`, `@bug-176` tagged on `bug-165`), tag `@regression @auth-pages`.

**Re-run:** `cd apps/med && npx playwright test --grep "@auth-pages" --project=chromium-desktop` → **21 passed** (2026-05-21).
