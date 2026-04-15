# Dev Agent Handover — Feature G: Learner Navigation Audit & Implementation

## Your role

You are a **Senior UX Engineer** conducting a thorough navigation audit of the learner-facing NurseEd web app, then implementing all missing navigation flows. You combine frontend engineering with UX design thinking — every navigation action should be predictable, recoverable, and fast.

**Skills you must apply:**

- **Next.js App Router** (file-based routing, dynamic segments, layouts, `Link`, `useRouter`, `usePathname`, `useParams`)
- **React** (state management, context, refs, keyboard events)
- **UX design** (information architecture, breadcrumbs, back navigation, wayfinding, learner mental models)
- **Accessibility** (keyboard navigation, `aria-label`, focus management, screen reader announcements)
- **TypeScript** (strict typing, URL construction, route type safety)
- **Responsive design** (mobile sidebar, touch targets, breadcrumb truncation)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. The learner experience follows this hierarchy:

```
Dashboard (/learn)
  └── Course Catalog (/learn/courses)
        └── Course Detail (/learn/courses/[courseId])
              └── [Module — NO ROUTE EXISTS]
                    └── Lesson (/learn/courses/[courseId]/lessons/[lessonId])
                          └── Steps (rendered inline by LessonPlayer, no separate routes)
```

Each course has ~8 modules. Each module has ~8 lessons. Each lesson has 3–8 steps. The pedagogical framework uses four stages per module: `heads_up` (exposure), `heads_down` (practice), `heads_together` (pair work), `assessment`.

---

## Current navigation state (AUDIT RESULTS)

### Routes that exist

| Route | Page | Purpose |
|-------|------|---------|
| `/learn` | Dashboard | Hero, continue learning, course cards |
| `/learn/courses` | Catalog | All courses with level filters |
| `/learn/courses/[courseId]` | Course detail | Module accordion with lessons |
| `/learn/courses/[courseId]/lessons/[lessonId]` | Lesson page | Breadcrumb + `LessonPlayer` |
| `/learn/pairs` | Practice groups | Create/join groups, upload |

### Routes that are MISSING

| Route | What should exist |
|-------|------------------|
| `/learn/courses/[courseId]/modules/[moduleId]` | Module detail page — learning objectives, lesson list, progress summary, pair practice status |

### Sidebar navigation (`LearnerSidebar.tsx`)

Three links: Dashboard (`/learn`), My Courses (`/learn/courses`), Practice Groups (`/learn/pairs`).

No contextual sidebar — the sidebar shows the same 3 links regardless of whether you're on the dashboard, inside a course, or mid-lesson.

### Breadcrumbs (inline, not a shared component)

| Page | Current breadcrumb | Issue |
|------|-------------------|-------|
| Course detail | `Courses > {Course title}` | Links to `/learn/courses`. OK. |
| Lesson page | `Courses > {Course title} > {Lesson title}` | Links to `/learn/courses` and `/learn/courses/{courseId}`. OK but **no module level**. |
| Inside LessonPlayer | **No breadcrumb at all** | Once steps start, there's no way to exit or see where you are in the course |

### Step navigation inside LessonPlayer

| Direction | Status |
|-----------|--------|
| Forward (next step) | Works — `handleStepComplete` increments `currentIdx` |
| **Backward (previous step)** | **DOES NOT EXIST** — no way to go back to a previous step |
| Exit/abandon lesson | **DOES NOT EXIST** — no "X" or back button once lesson starts |
| Jump to specific step | **DOES NOT EXIST** — progress bar segments are not clickable |

### Step progress bar (`LessonPlayer.tsx` lines 211–236)

- Shows "Step {n} of {total}" text and colored segments
- Segments are **non-interactive `<div>`s** — no `onClick`, no keyboard support
- Completed segments are green, current is blue, future is gray
- No step type labels or icons on segments

### Post-lesson navigation

After lesson completion:
1. Feedback survey → Celebration screen
2. Two links: "Back to course" → `/learn/courses/{courseId}`, "Home" → `/learn`
3. No "Next lesson" link
4. No "Back to module" link (module page doesn't exist)

### Course detail page — module accordion

- Modules display as expandable accordion sections
- **Clicking module header** toggles expand/collapse — **not** a navigation link
- No separate module route, no module detail page
- Lesson links go directly to `/learn/courses/{courseId}/lessons/{lessonId}`
- Locked lessons show a lock icon (sequential gating)

---

## Navigation gaps to fix (COMPREHENSIVE LIST)

### GAP 1: No backward step navigation in LessonPlayer (HIGH PRIORITY)

**Problem:** Learner cannot go back to review a previous step. If they miss something in an `audio_shadow` step and want to re-listen, they're stuck.

**Expected behavior:**
- "Previous" button appears when `currentIdx > 0`
- Clicking it decrements `currentIdx` and re-renders the previous step
- Previous step state should be preserved (not reset)
- Progress is NOT lost — going back doesn't un-complete a step

### GAP 2: No exit/close button in LessonPlayer (HIGH PRIORITY)

**Problem:** Once a lesson starts, there's no way to leave without completing all steps or closing the browser tab.

**Expected behavior:**
- A persistent header/bar at the top of LessonPlayer with:
  - Course/lesson title (truncated)
  - An "X" or "Exit" button that returns to the lesson page or course page
  - Optional: confirmation modal ("Leave lesson? Progress is saved.")

### GAP 3: Step progress bar is not interactive (MEDIUM)

**Problem:** The colored segments are just visual indicators. Learners can't click a completed segment to jump back.

**Expected behavior:**
- Completed steps (green) are clickable — clicking jumps to that step
- Current step (blue) is not clickable
- Future steps (gray) are not clickable (can't skip ahead)
- Each segment should have `cursor-pointer` on completed, `title` attribute with step type, and keyboard accessibility

### GAP 4: No module-level page (MEDIUM)

**Problem:** There's no dedicated page for a module. The course page shows modules as accordions, but there's no route like `/learn/courses/[courseId]/modules/[moduleId]`. Clicking the module name just toggles the accordion.

**Expected behavior:**
- A module detail page at `/learn/courses/[courseId]/modules/[moduleId]` showing:
  - Module title and description/objectives
  - Stage breakdown (heads_up, heads_down, heads_together, assessment)
  - Lesson list with progress indicators
  - Pair practice status (if applicable)
  - Module completion percentage
- The accordion module title on the course page should link to this page (or: clicking it navigates instead of toggling, with expand/collapse as secondary)

### GAP 5: No "Next Lesson" link after completion (MEDIUM)

**Problem:** After finishing a lesson, the learner sees "Back to course" and "Home" but no "Start next lesson" CTA.

**Expected behavior:**
- If there's an unlocked next lesson in the module, show "Next Lesson: {title}" button
- If the module is complete, show "Module Complete" celebration
- If the next lesson is in a different module, mention the module transition

### GAP 6: Breadcrumb missing module level (LOW)

**Problem:** Lesson breadcrumb is `Courses > Course > Lesson`. There's no module in the breadcrumb chain, even though the learner entered via a module accordion.

**Expected behavior:**
- `Courses > {Course} > {Module} > {Lesson}`
- Module segment links to the module page (GAP 4)
- Or if no module page: at least link to the course page with the correct module accordion expanded (via hash or query param)

### GAP 7: No breadcrumb/header inside LessonPlayer (LOW)

**Problem:** The lesson page has a breadcrumb above `LessonPlayer`, but once steps render, the breadcrumb scrolls away. There's no sticky navigation context.

**Expected behavior:**
- A slim sticky header inside or above the LessonPlayer showing:
  - Module name (truncated)
  - Lesson name (truncated)  
  - Step progress ("3/8")
  - Exit button

### GAP 8: No shared Breadcrumb component (LOW — DX)

**Problem:** Each page builds its own breadcrumb `<nav>` with inline JSX. This leads to inconsistent styling and behavior.

**Expected behavior:**
- A reusable `<Breadcrumb items={[...]} />` component in `components/learn/`
- Accepts `{ label, href?, truncate? }[]`
- Handles responsive truncation, consistent chevrons, and aria attributes

---

## Existing files you MUST read and understand

| File | Why | Lines of interest |
|------|-----|------------------|
| `apps/med/components/learn/LessonPlayer.tsx` | Core step navigation — you'll add back/exit/clickable segments here | `handleStepComplete` (line 102), step progress bar (line 211–236), completion screen (line 140–173) |
| `apps/med/app/learn/courses/[courseId]/page.tsx` | Course detail with module accordion — you may add module links | Module accordion (line 342–442), breadcrumb (line 179–183) |
| `apps/med/app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx` | Lesson page with breadcrumb — update breadcrumb, add module level | Breadcrumb (line 134–144) |
| `apps/med/app/learn/layout.tsx` | Learn layout with sidebar — may add contextual sidebar | Layout structure (line 13–57) |
| `apps/med/components/learn/LearnerSidebar.tsx` | Sidebar nav — 3 static links | Nav items (line 14–18) |
| `apps/med/app/learn/page.tsx` | Dashboard — entry point | Continue learning (line 317–323) |
| `apps/med/app/learn/courses/page.tsx` | Course catalog | Course cards with links |
| `apps/med/components/learn/ModuleGateBanner.tsx` | Module gate check — shown on completion | Integration point for module transition |
| `apps/med/lib/supabase.ts` | Data types: `NursedCourse`, `NursedModule`, `NursedLesson`, `NursedLessonStep` | Type definitions (line 83–161) |
| `apps/med/lib/i18n/translations.ts` | All UI text — EN + VI | Add new translation keys here |
| `apps/med/docs/COURSE_ARCHITECTURE.md` | Course/module/lesson structure and stage framework | Understand the pedagogical intent |

---

## Current navigation flow diagram

```
/learn (Dashboard)
  ├── "View all" → /learn/courses (Catalog)
  ├── Course card → /learn/courses/{id} (Course Detail)
  │     ├── Breadcrumb "Courses" → /learn/courses
  │     ├── Module accordion (toggle only, no route)
  │     │     └── Lesson "Learn" → /learn/courses/{id}/lessons/{lessonId}
  │     │           ├── Breadcrumb "Courses" → /learn/courses
  │     │           ├── Breadcrumb "{Course}" → /learn/courses/{id}
  │     │           └── LessonPlayer (steps — FORWARD ONLY, NO EXIT)
  │     │                 ├── Step 1 → Step 2 → ... → Step N
  │     │                 └── Completion: "Back to course" or "Home"
  │     └── (no module route)
  └── "Continue" (localStorage) → /learn/courses/{id}/lessons/{lessonId}

Sidebar (always visible):
  /learn, /learn/courses, /learn/pairs
```

### Ideal navigation flow (what you should build toward)

```
/learn (Dashboard)
  ├── "View all" → /learn/courses
  ├── Course card → /learn/courses/{id}
  │     ├── Breadcrumb "Courses" → /learn/courses
  │     ├── Module title → /learn/courses/{id}/modules/{moduleId}  ← NEW
  │     │     ├── Breadcrumb: Courses > {Course} > {Module}
  │     │     ├── Objectives, stage breakdown, lesson list
  │     │     └── Lesson card → /learn/courses/{id}/lessons/{lessonId}
  │     │           ├── Breadcrumb: Courses > {Course} > {Module} > {Lesson}
  │     │           └── LessonPlayer (with sticky header + exit + back)
  │     │                 ├── ← Back | Step 3/8 [clickable completed] | ✕ Exit
  │     │                 ├── Step nav: ◀ Previous | Next ▶
  │     │                 └── Completion: "Next Lesson" / "Back to Module" / "Home"
  │     └── Quick-expand accordion still works on course page
  └── "Continue" → deep link to lesson

Sidebar (context-aware — optional enhancement):
  When inside a course, show module list in sidebar
```

---

## Critical constraints and guardrails

### DO

- Audit EVERY navigation path in the learner flow before making changes
- Build a reusable `<Breadcrumb>` component
- Add all new UI text to `lib/i18n/translations.ts` in both EN and VI
- Preserve existing step completion logic — backward navigation must NOT break progress tracking
- Keep the `POST /api/progress` calls intact when advancing
- Test that sequential lesson locking still works after your changes
- Make all clickable elements keyboard accessible (`tabIndex`, `role="button"`, `onKeyDown`)
- Ensure mobile responsiveness — breadcrumbs truncate, exit button is reachable
- Use existing patterns: `Link` from `next/link`, `useRouter` from `next/navigation`
- Follow the existing design system: `btn-primary`, `btn-secondary`, `card`, `badge` CSS classes
- The module page should fetch data from the existing `/api/courses/{courseId}` endpoint (which includes modules and lessons) — do NOT create a new API route unless necessary

### DO NOT

- Do NOT allow skipping ahead to uncompleted steps via the progress bar
- Do NOT break the forward-only lesson gating (locked lessons stay locked)
- Do NOT modify the step components themselves (QuizStep, MatchingStep, etc.)
- Do NOT change the admin routes or admin navigation
- Do NOT modify the submission/progress tracking logic
- Do NOT install new routing libraries — use Next.js App Router
- Do NOT create documentation files unless asked
- Do NOT hardcode strings in JSX — use the translation system
- Do NOT over-complicate the module page for MVP — it can be simple (title, objectives, lesson list with progress)

### UX principles for this task

- **Predictability**: Every button should do what the learner expects. "Back" goes back one level, not to a random page.
- **Recoverability**: The learner should never feel trapped. An exit is always visible.
- **Context**: The learner should always know where they are (breadcrumb, sticky header, progress bar).
- **Continuity**: Navigation should preserve progress. Going back to a step doesn't lose answers. Exiting saves progress.
- **Minimalism**: Don't add navigation elements that clutter the learning focus. During a step, the step content is primary; navigation is secondary but always accessible.

---

## Recommended implementation order

1. **Shared Breadcrumb component** (`components/learn/Breadcrumb.tsx`) — reusable, accessible, responsive
2. **LessonPlayer exit button** — sticky header with lesson title + "X" exit
3. **LessonPlayer backward navigation** — "Previous" button, step state preservation
4. **LessonPlayer clickable progress segments** — completed steps are tappable
5. **Module detail page** — new route `/learn/courses/[courseId]/modules/[moduleId]/page.tsx`
6. **Update course page** — module title links to module page (keep accordion as secondary)
7. **Update lesson breadcrumb** — add module level
8. **"Next Lesson" on completion** — fetch next lesson in module, show CTA
9. **Translations** — all new EN + VI strings
10. **Mobile testing** — breadcrumb truncation, sidebar, touch targets

---

## Deliverable

A complete learner navigation system where:
- Learners can go backward between steps
- Learners can exit a lesson at any time (with progress saved)
- Completed progress bar segments are clickable
- A module detail page exists with objectives and lesson list
- Breadcrumbs show the full hierarchy: Courses > Course > Module > Lesson
- Post-lesson screen offers "Next Lesson" navigation
- All text in EN + VI translations
- Keyboard accessible throughout
