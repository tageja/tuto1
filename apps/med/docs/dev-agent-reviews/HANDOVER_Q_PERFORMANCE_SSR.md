# Handover Q — Performance: Server-Side Rendering + Cache + Hover Prefetch

## Your Role

You are a **Performance Engineer** specialising in Next.js App Router. Your job is to make the NurseEd learner-facing course and module pages feel significantly faster without breaking any existing functionality. You work carefully, test locally before anything else, and **do not commit** — the product owner will review the result locally first.

---

## The Project

**NurseEd** (`apps/med/`) — Vietnamese nursing English platform at `med.tuto.asia`. Next.js 16 App Router, Supabase (Postgres + RLS), Tailwind CSS, `lucide-react`, `framer-motion`.

Run locally: `cd apps/med && npm run dev` → `http://localhost:3001`  
Test account: `test@test.com` / `password` (role: learner)  
Admin/preview account: `tarun.tageja@gmail.com` (role: super_admin)

**DO NOT commit. DO NOT push. Local validation only.**

---

## The Problem

Navigating between learner pages takes ~1 second. The root cause is a **client-side data waterfall**:

```
Browser navigates to /learn/courses/[courseId]
  → render empty skeleton (instant)
  → useEffect fires → fetch('/api/courses/[courseId]') → Vercel → Supabase → back  (~300ms)
  → state updates → another useEffect fires (depends on course being loaded)
  → fetch('/api/progress/course?courseId=...') → Supabase → back  (~300ms)
  → fetch('/api/module-progress?moduleId=...') × N modules → Supabase → back  (~300ms)
Total: ~900ms–1200ms before the page is useful
```

This happens on **every navigation** because the pages are `'use client'` with `useEffect` fetching.

---

## What To Build — 3 Optimisations

### Optimisation 1 — Server Components for Course & Module Pages (biggest win)

Convert the **static, non-user-personalised** part of each page to run server-side so the browser receives fully-rendered HTML on first paint.

The architecture split is:
- **Course structure** (title, modules, lessons, order) → **never changes per user** → fetch on server, cache aggressively
- **User progress** (completed lessons, gate status) → **user-specific** → must stay client-side or fetched in parallel on server with user auth

**Target pages:**

| Page | File |
|---|---|
| Course overview | `app/learn/courses/[courseId]/page.tsx` |
| Module detail | `app/learn/courses/[courseId]/modules/[moduleId]/page.tsx` |

**Pattern to use:**

Split each page into two files:
1. `page.tsx` — an `async` Server Component that fetches course data server-side, passes it as props
2. `[Name]Client.tsx` — a `'use client'` component that receives course data as props and handles user-specific state (progress, auth, language)

Example sketch for the course overview:

```
app/learn/courses/[courseId]/
├── page.tsx              ← async Server Component (no 'use client')
└── CourseOverviewClient.tsx  ← 'use client', receives course as prop
```

**`page.tsx` (server):**
```typescript
import { resolveCourse } from '@/lib/db/courses'
import CourseOverviewClient from './CourseOverviewClient'
import { notFound } from 'next/navigation'

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await resolveCourse(courseId)
  if (!course) notFound()
  return <CourseOverviewClient course={course} courseId={courseId} />
}
```

**`CourseOverviewClient.tsx` (client):**
```typescript
'use client'
// Move ALL the existing JSX and useEffect logic here
// Remove the fetch('/api/courses/...') useEffect — course arrives as prop
// Keep: useEffect for progress, module gates, auth checks
// Keep: all UI rendering, toggles, etc.
```

Apply the same pattern to the module detail page.

**Key rules:**
- `resolveCourse()` and `resolveCourse` already exist in `lib/db/courses.ts` — use them directly in the server component, no API round-trip needed
- The server component uses `getServiceClient()` (service role, no user auth) — this is fine because course structure is public data
- For user progress, the client component continues to call `/api/progress/course` as before — but now this runs **in parallel** with the page render rather than after it
- The slug redirect logic (`if (c?.slug && isUuid(courseId)) router.replace(...)`) stays in the client component — keep it as-is

**What this saves:** The biggest single waterfall fetch (`/api/courses/[courseId]`) is eliminated from the browser entirely. The module+lesson structure arrives in the initial HTML.

---

### Optimisation 2 — `revalidate` Cache on Course Structure (free win)

In the new server component `page.tsx`, add Next.js route segment cache config:

```typescript
// At the top of page.tsx (outside the component)
export const revalidate = 300 // re-fetch from Supabase at most every 5 minutes
```

This means after the first user loads a course page, Vercel caches the rendered HTML for 5 minutes. Subsequent visitors get the page in ~50ms from Vercel's CDN instead of hitting Supabase.

Course structure (module list, lesson list) changes very infrequently (only when an admin publishes/edits), so 5 minutes is a safe window.

**Important:** Do NOT cache the user-progress parts — those must remain dynamic per user. The split architecture from Opt 1 handles this naturally: the server component (cached) renders course structure; the client component (not cached, runs in browser) fetches user-specific progress.

---

### Optimisation 3 — Hover Prefetch for Lesson & Module Links

When a user hovers over a lesson card link or module link, start fetching that page's data immediately — by the time they click (~200ms later), the data is already arriving.

**Where to implement:** In the learner sidebar and lesson/module link cards.

**Pattern:** Create a small custom hook `usePrefetchCourse` that fires on `onMouseEnter`:

```typescript
// lib/hooks/usePrefetchCourse.ts
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function usePrefetchRoute() {
  const router = useRouter()
  const prefetch = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])
  return prefetch
}
```

Then in lesson card components and the module list, attach it:
```tsx
const prefetch = usePrefetchRoute()
// on the <Link> or wrapping div:
onMouseEnter={() => prefetch(`/learn/courses/${courseSlug}/modules/${moduleSlug}`)}
```

Next.js `router.prefetch()` fetches the server component's payload in the background (including the cached course structure from Opt 2). When the user clicks, Next.js serves it from the in-memory prefetch cache — instant navigation.

**Apply prefetching on:**
- Module cards in `app/learn/courses/[courseId]/page.tsx` (CourseOverviewClient)
- Lesson cards in `app/learn/courses/[courseId]/modules/[moduleId]/page.tsx`
- The "Start" / "Continue" button in the LearnerSidebar (`components/learn/LearnerSidebar.tsx`)

---

## Files To Touch

| File | Action |
|---|---|
| `app/learn/courses/[courseId]/page.tsx` | Convert to async Server Component; extract client logic to `CourseOverviewClient.tsx` |
| `app/learn/courses/[courseId]/CourseOverviewClient.tsx` | NEW — all existing client logic, receives `course` as prop |
| `app/learn/courses/[courseId]/modules/[moduleId]/page.tsx` | Convert to async Server Component; extract client logic to `ModuleDetailClient.tsx` |
| `app/learn/courses/[courseId]/modules/[moduleId]/ModuleDetailClient.tsx` | NEW — all existing client logic, receives `course` and initial `moduleId` as props |
| `lib/hooks/usePrefetchRoute.ts` | NEW — thin wrapper around `router.prefetch()` |
| `components/learn/LearnerSidebar.tsx` | Add `onMouseEnter` prefetch to "Continue" button link |

**Do NOT touch:**
- `app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx` — the lesson player is already a complex client component; leave it for a future agent
- `app/api/*` — no API route changes needed for Opt 1 and 2
- Any admin pages
- `lib/db/courses.ts` — use existing functions as-is

---

## Constraints & Guardrails

1. **No commits, no push** — local dev only. The product owner will review at `http://localhost:3001`
2. **Preserve all existing functionality** — lesson lock logic, module gate banners, completed lesson indicators, super_admin bypass, language switching (vi/en), breadcrumbs — all must work identically
3. **The slug redirect still works** — if someone navigates to a UUID-based URL, the redirect to slug-based URL must still happen. Keep this in the client component.
4. **Auth stays in client** — `useAuth()` is a client-side hook. The server component does NOT need auth for course structure (it's public data). User-specific data (progress, role) stays client-side.
5. **Supabase server client** — the server component should call `resolveCourse()` from `lib/db/courses.ts` directly. `resolveCourse` already uses `getServiceClient()` which uses the service role key. This is available on the server (env var `SUPABASE_SERVICE_ROLE_KEY`).
6. **TypeScript** — maintain all existing types (`CourseWithModules`, etc.). Pass them correctly as props.
7. **i18n** — `useLang()` is client-side only. All translation calls stay in the client component.

---

## No DB Migration Needed

This is purely a frontend/rendering change. No Supabase schema changes, no new tables, no migrations.

---

## Testing Checklist (Local Only)

After implementing, verify each of these manually at `http://localhost:3001`:

- [ ] **Course overview loads without visible spinner** — navigate to `/learn/courses/emergency-nursing-communication` and confirm content is visible immediately (no loading skeleton flash)
- [ ] **Module detail loads without visible spinner** — click any module and confirm it opens instantly
- [ ] **Lesson locks still work** — log in as `test@test.com`, confirm locked lessons show the lock icon and prevent access
- [ ] **super_admin sees all lessons unlocked** — log in as `tarun.tageja@gmail.com`, confirm no locks
- [ ] **Completed lessons show correct state** — complete a lesson as test@test.com, navigate back, confirm it shows as completed
- [ ] **Language switch works** — toggle VI/EN, confirm module and lesson titles update correctly
- [ ] **Module gate banner appears** when applicable
- [ ] **Hover prefetch fires** — open browser DevTools → Network tab, hover over a module link, confirm a fetch appears before you click
- [ ] **Breadcrumbs render correctly** on course and module pages
- [ ] **Slug redirect works** — navigate to `/learn/courses/[uuid]` and confirm it redirects to the slug URL

---

## Definition of Done

- Course overview page renders full content without a loading skeleton visible to the user
- Module detail page renders full content without a loading skeleton visible to the user  
- Both pages load in under 300ms on a local network (visible in browser DevTools Performance tab)
- Hover prefetch fires on module/lesson link mouse enter
- All checklist items above pass
- No TypeScript errors (`npx tsc --noEmit` in `apps/med/`)
- No linter errors

---

## Notes on What NOT to Do

- Do not use `fetch('/api/courses/...')` in the server component — call the DB helper directly
- Do not add `'use server'` directives — you don't need Server Actions here, just async Server Components
- Do not wrap the entire page in `Suspense` unless you also provide a meaningful `fallback` — an empty fallback is worse than what exists today
- Do not add `cache()` from React unless you understand the implications — `revalidate = 300` on the route segment is sufficient
- Do not touch `AuthContext` or `LanguageContext` internals
