# Admin pages batch 4 — exploration findings

**Date:** 2026-05-22  
**Branch:** `agent-x-integration`  
**Base URL:** `http://localhost:3001`  
**Admin account:** `admin@test.com` / `password` (`super_admin`, seeded via service role when missing)  
**Course fixtures:** `emergency-nursing-communication` · M1 L1 `whats-happening-first-words-in-an-emergency`

---

## Summary

| Route | Status | Notes |
|-------|--------|-------|
| AD1 `/admin` | OK | KPI cards + recent courses; layout gates non-admins to `/auth/login?next=/admin` |
| AD2 `/admin/courses` | OK | Search + course table/cards; at least one published course visible |
| AD3 `/admin/courses/[courseId]` | OK | Module/lesson tree for Emergency Nursing Communication |
| AD4 `…/lessons/[lessonId]` | OK | Step list with native drag handles; reorder fix present in source |
| AD5 `/admin/analytics` | OK | Charts/tables or loading skeleton; no blank screen |
| AD6 `/admin/animations` | OK | Conversation animator preview UI loads |
| AD7 `/admin/audio` | OK | Batch Audio Generation header + Preview / Generate buttons (not fired in tests) |
| AD8 `/admin/coupons` | OK | Coupon list or empty state |
| AD9 `/admin/feedback` | OK | Feedback inbox table or empty state |
| AD10 `/admin/hospitals` | OK | Hospital list |
| AD11 `/admin/hospital` | OK | Empty state until hospital selected; tabs: Overview / Learners / Courses / Speaking |
| AD12–AD14 hospital sub-pages | OK | Same layout; empty selection message when no hospital picked |
| AD15 `/admin/metrics` | OK | `super_admin` only — platform metrics cards (admin@test.com qualifies) |
| AD16 `/admin/site` | OK | Site settings form (homepage video, etc.) |
| AD17 `/admin/students` | OK | Learner table or empty state |
| AD18 `/admin/surveys` | OK | `super_admin` only — HCMUTE + nurses survey panels |

---

## Auth gate (unauthenticated)

- `/admin`, `/admin/courses`, `/admin/students` without cookies → redirect to `/auth/login` with `next=` param (not 404/500).
- Learner session (`test@test.com`) hitting `/admin/*` → redirected to `/learn/courses` per `app/admin/layout.tsx`.

---

## AD4 — Lesson editor drag-and-drop

### Code verification
`app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` `handleDragEnd` uses:

```ts
const insertAt = dragIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex
```

### Interaction
- M1 L1 loads multiple draggable step rows (`div.card[draggable="true"]`).
- Dragging step 1 onto step 3 drop target reorders so the former index-1 step moves to index 0 (upward fix regression guard in `bug-193`).

---

## AD7 — Audio batch generator

- Page title: **Batch Audio Generation**
- **Preview** and **Generate All Audio** buttons render; tests do not POST to `/api/audio/batch`.

---

## Mobile (390×844)

- `/admin` and `/admin/courses` show mobile top bar + hamburger; no white-screen crash.
- Desktop-first layout remains usable; sidebar off-canvas until menu opened.

---

## Console / network

- Occasional Turbopack `Failed to load chunk` / `failed to fetch` in dev — filtered in test hygiene (same as learner batch).
- No persistent `pageerror` on happy-path admin navigation with `admin@test.com`.

---

## Gaps / product notes (not blocking specs)

- `/admin/animations` not linked from `AdminSidebar` — reachable by direct URL only.
- Hospital dashboard sub-pages require manual hospital selection (empty state is expected).
- Production super_admin `tarun.tageja@gmail.com` password not in repo; QA uses dedicated `admin@test.com`.

---

## Spec coverage map

| Bug | Guard |
|-----|-------|
| 190 | Unauthenticated admin gate |
| 191–193 | Courses list, course detail, lesson editor + DnD |
| 194–200 | Analytics, students, hospitals, metrics, coupons, surveys, site |
| 201 | Parametrised load: animations, audio, feedback, hospital/* |
| 205–206 | Mobile no white-screen; audio Preview button |
