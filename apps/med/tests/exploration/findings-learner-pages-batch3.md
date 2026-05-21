# Learner pages batch 3 — exploration findings

**Date:** 2026-05-22  
**Branch:** `agent-x-integration`  
**Base URL:** `http://localhost:3001`  
**Account:** `test@test.com` / `password` (learner)

---

## Summary

| Route | Status | Notes |
|-------|--------|-------|
| L1 `/learn` | OK | Dashboard with stats, continue-learning card, learning-path course row |
| L2 `/learn/courses` | OK | Catalogue with level filters (All/A1/A2/B1/B2), published + coming-soon cards |
| L3 `/learn/courses/emergency-nursing-communication` | OK | Course title, module accordion, lesson links |
| L4 `…/modules/first-contact-in-an-emergency` | OK | Module overview, 8 lessons listed |
| L5 `…/lessons/whats-happening-first-words-in-an-emergency` | OK | Lesson player; scenario intro → step progression works |
| L6 `/learn/profile` | OK (was 404) | **Root cause:** route did not exist before `app/learn/profile/page.tsx` was added; page now loads profile aggregate |
| L7 `/learn/pairs` | OK | Pair groups UI or join/create empty flows; `join-code-input` present |
| L8 `/learn/rewards` | OK | Star balance, streak, badge grid, coupon redemption |
| L9 `/learn/feedback` | OK | Feedback history list or empty state |

---

## L6 — `/learn/profile` (known 404)

### Root cause
`HANDOVER_N_USER_PROFILE_PAGE.md` documents that `app/learn/profile/` **did not exist**. Next.js returned the global **404** for `/learn/profile` even though `LearnerSidebar` linked to it.

### Fix (in tree)
- `app/learn/profile/page.tsx` — server component loads `getFullProfile` inside `Suspense`
- `lib/db/profile.ts` — `getFullProfile` + aggregates
- `components/learn/ProfilePageClient.tsx` — UI with `data-testid="profile-completed-count"`
- **Guard added:** `PGRST116` (no `nursed_profiles` row) returns an empty aggregate instead of throwing (prevents error overlay for edge-case signups)

### Verification
- Direct navigation returns 200 with stats row and editable header
- Sidebar Profile link resolves without 404 text
- Existing specs: `bug-155`, `bug-016-017` pass

---

## L1 — Dashboard `/learn`

- Sidebar visible (desktop); mobile hamburger opens drawer
- Course progress via horizontal learning-path cards or continue-learning CTA
- EN/VI toggle in sidebar changes `learnNav*` labels
- No unhandled `pageerror` on load (Turbopack chunk retries ignored)

---

## L2 — Course catalogue

- `data-testid="course-card"` on published courses
- CTA links to `/learn/courses/<slug>`
- Level filter pills clickable; filters client-side list
- EN mode: course card chrome should not leak VI diacritics (see `bug-007`)

---

## L3–L5 — Emergency course path

- **Course:** `emergency-nursing-communication`
- **Module 1 slug:** `first-contact-in-an-emergency`
- **Lesson 1 slug:** `whats-happening-first-words-in-an-emergency`
- Lesson player: dismiss Joyride tour if present; scenario intro CTA advances to first content step
- Steps 1–3: no blank screen; console clean after chunk-load retries

---

## L7 — Pairs

- Join code input (`data-testid="join-code-input"`)
- Create/join group flows; API `/api/pairs/membership`

---

## L8 — Rewards

- `/api/rewards/balance` populates balance + streak
- Star counts are non-negative integers in UI

---

## L9 — Feedback

- `/api/feedback` list or empty state with bilingual chrome
- Floating feedback button in layout opens modal (separate from history page)

---

## Sidebar navigation

| Link | Target | Result |
|------|--------|--------|
| Dashboard | `/learn` | OK |
| My Courses | `/learn/courses` | OK |
| Practice Groups | `/learn/pairs` | OK |
| Rewards | `/learn/rewards` | OK |
| Profile | `/learn/profile` | OK (post-fix) |
| My Feedback | `/learn/feedback` | OK |

---

## Logout

- Sidebar **Đăng xuất / Sign out** → `window.location.href = '/api/auth/signout'` → `/auth/login`
- `/learn` after logout redirects to login with `next=` param

---

## Mobile (390×844)

- Sidebar off-canvas; hamburger opens menu
- Main content scrolls; no persistent horizontal overflow on catalogue/profile
- Lesson player usable; tour overlay may need dismiss on small viewport

---

## Console / network

- Occasional Turbopack `Failed to load chunk` on first paint — retry/reload recovers (dev-only)
- Profile/rewards depend on Supabase-backed APIs; 500s would show empty sections, not 404

---

## Specs added (batch 3)

`bug-177` … `bug-187` mandatory; `bug-188` lesson step smoke; `bug-189` rewards balance guard.
