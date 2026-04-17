# HANDOVER O — Animation Builder: Lesson & Step Numbering

---

## Agent Role & Identity

You are a **Senior Frontend Engineer** with deep Next.js App Router and React experience. This is a small, precise, admin-only UI improvement. You do not need to touch the database, create migrations, or build new pages. You make clean, targeted changes to two existing files.

Working directory: `apps/med/`
No new npm packages. No migrations. No translation keys (this is an admin tool, not learner-facing).

---

## The Problem — What Is Broken Today

The Animation Builder page at `/admin/animations` has a 3-step selector: Course → Lesson → Step.

**Current behaviour of the Lesson dropdown:**
A flat alphabetical-ish list of all lessons in the course, with no indication of which module each belongs to or what order they are in. For a course with 12 modules × 8 lessons = 96 lessons, this is unusable. The user has to guess which "Pair practice — round 1" belongs to module 2 or module 7.

**Current behaviour of the Step dropdown:**
Shows `{title} ({type})` with no step number. If there are 8 steps, you can't tell at a glance which step is step 3 vs step 6.

**What the learner sees (reference — match this):**
The learner-facing course page (screenshot provided by product owner) shows:
- Module 1, Module 2, Module 3... (numbered sequentially)
- Inside each module: lessons numbered 1, 2, 3, 4...
- Combined notation the product owner wants: **`2.1`** = Module 2, Lesson 1. **`4.3`** = Module 4, Lesson 3.

**Goal:**
1. Group lessons in the dropdown by module using `<optgroup>` HTML elements, labelled "Module 1: [Module Title]", "Module 2: [Module Title]", etc.
2. Prefix each lesson option with its `M.L` number: e.g. `2.1 — Chuyện gì vậy?`
3. Prefix each step option with its step number: e.g. `Step 3 — Script reading (script_read)`
4. Add a visible breadcrumb below the 3 dropdowns showing the currently selected path so the user never loses context.

---

## Current State — Exact Files to Change

### File 1: `apps/med/app/api/lessons/route.ts`

**Current code (lines 12–28):**
```typescript
const { data: modules, error } = await db
  .from('nursed_modules')
  .select('id, order_index, nursed_lessons(id, title, title_vi, order_index, module_id)')
  .eq('course_id', courseId)
  .order('order_index')

const lessons = (modules ?? []).flatMap((mod) =>
  ((mod.nursed_lessons ?? []) as { id: string; title: string; title_vi: string | null; order_index: number; module_id: string }[])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map(l => ({ ...l, _module_order: mod.order_index }))
)
```

**Problem:** The module `title` is not fetched — only `id` and `order_index`. The lesson response cannot tell the admin what module it belongs to by name.

**Fix:** Add `title` to the module select, and pass `_module_title` in the flattened lesson objects.

**Exact change — the select string:**
```typescript
// Before:
.select('id, order_index, nursed_lessons(id, title, title_vi, order_index, module_id)')

// After:
.select('id, title, order_index, nursed_lessons(id, title, title_vi, order_index, module_id)')
```

**And in the `.map()`:**
```typescript
// Before:
.map(l => ({ ...l, _module_order: mod.order_index }))

// After:
.map(l => ({ ...l, _module_order: mod.order_index, _module_title: mod.title as string }))
```

**Also update the TypeScript cast** on the `mod.nursed_lessons` array — add `| null` where appropriate and ensure TypeScript is happy.

### File 2: `apps/med/app/admin/animations/page.tsx`

**Current `Lesson` interface (line 14):**
```typescript
interface Lesson { id: string; title: string; order_index: number; _module_order?: number }
```

**Updated interface — add `_module_title`:**
```typescript
interface Lesson {
  id: string
  title: string
  order_index: number
  _module_order: number   // remove the `?` — the API always returns it
  _module_title: string   // add this
}
```

---

## Exactly What to Build

### Change 1 — Lesson dropdown: `<optgroup>` grouping + `M.L` numbering

**Current dropdown (lines 307–309):**
```tsx
<option value="">— Select lesson —</option>
{lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
```

**Replace with `<optgroup>` rendering:**

Group the flat `lessons` array by `_module_order`. For each module group, render an `<optgroup>`. Within each group, render options with the `M.L` prefix.

**Important — determine if `order_index` is 0-based or 1-based:**
Before writing the numbering logic, check the learner-facing course page at `apps/med/app/learn/courses/[courseSlug]/page.tsx` or inspect a real DB row. If `order_index` starts at 0, add 1 when displaying. If it starts at 1, use it as-is. The learner page shows modules numbered 1, 2, 3 — match that exactly.

**Algorithm:**
```typescript
// Build module groups from the flat lessons array (already sorted by module then lesson)
const moduleGroups = lessons.reduce<Map<number, { title: string; lessons: Lesson[] }>>(
  (acc, l) => {
    if (!acc.has(l._module_order)) {
      acc.set(l._module_order, { title: l._module_title, lessons: [] })
    }
    acc.get(l._module_order)!.lessons.push(l)
    return acc
  },
  new Map()
)

// Sort module groups by module order
const sortedModules = [...moduleGroups.entries()].sort(([a], [b]) => a - b)
```

**Rendered dropdown:**
```tsx
<option value="">— Select lesson —</option>
{sortedModules.map(([moduleOrder, group]) => {
  const moduleNum = moduleOrder  // add +1 here if order_index is 0-based
  return (
    <optgroup key={moduleOrder} label={`Module ${moduleNum}: ${group.title}`}>
      {group.lessons.map((l, lessonIdx) => {
        const lessonNum = l.order_index  // add +1 here if order_index is 0-based
        return (
          <option key={l.id} value={l.id}>
            {moduleNum}.{lessonNum} — {l.title}
          </option>
        )
      })}
    </optgroup>
  )
})}
```

### Change 2 — Step dropdown: add step number

**Current step option (line 323):**
```tsx
{steps.map(s => <option key={s.id} value={s.id}>{s.title} ({s.type})</option>)}
```

**Replace with:**
```tsx
{steps.map((s, idx) => (
  <option key={s.id} value={s.id}>
    Step {s.order_index} — {s.title} ({s.type})
  </option>
))}
```

Again, if `order_index` is 0-based, use `s.order_index + 1`.

### Change 3 — Selected path breadcrumb

After the 3 dropdowns (inside the Step Selector card, below the grid), add a breadcrumb bar that appears only when at least a lesson is selected.

**Insert this block after the closing `</div>` of the `grid sm:grid-cols-3` div:**

```tsx
{selectedLesson && (() => {
  const lesson = lessons.find(l => l.id === selectedLesson)
  const step = steps.find(s => s.id === selectedStep)
  if (!lesson) return null
  const moduleNum = lesson._module_order   // +1 if 0-based
  const lessonNum = lesson.order_index     // +1 if 0-based
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 font-mono">
      <span className="font-semibold text-gray-700">
        Module {moduleNum}
      </span>
      <span className="text-gray-300">›</span>
      <span className="font-semibold text-primary">
        {moduleNum}.{lessonNum}
      </span>
      <span className="text-gray-400 font-sans truncate max-w-[180px]">{lesson.title}</span>
      {step && (
        <>
          <span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-700">Step {step.order_index}</span>
          <span className="text-gray-400 font-sans truncate max-w-[180px]">{step.title}</span>
        </>
      )}
    </div>
  )
})()}
```

---

## Out of Scope

- Do NOT change the learner-facing course pages
- Do NOT change the Step dropdown's 3-column grid layout
- Do NOT add animations or transitions
- Do NOT touch any other admin pages
- Do NOT touch the database schema or migrations
- Do NOT add i18n keys (admin UI only)
- Do NOT install any new npm packages

---

## Verifying `order_index` Is 0-Based or 1-Based

Before implementing the numbering, run this check. Either:

**Option A — Read the learner course page:**
Open `apps/med/app/learn/courses/[courseSlug]/page.tsx`. Find how it numbers modules and lessons. If it does `mod.order_index + 1` to display "1", then the DB is 0-based.

**Option B — Check the migration:**
Open `supabase/migrations/041_nursed_schema.sql`. Look at how `order_index` is defined and whether seed data starts at 0 or 1.

**Option C — Infer from the lessons API response structure:**
The lessons API sorts by `order_index`. If the first lesson in Module 1 has `order_index: 0`, it is 0-based.

Apply `+ 1` consistently everywhere if 0-based. If already 1-based, use as-is. **The displayed number must match what the learner sees on their course page.**

---

## Testing Checklist

Do ALL of the following before declaring done:

1. **Select "Emergency Nursing Communication" course** (or whichever course has 12 modules)
   - Lesson dropdown now shows optgroups labelled "Module 1: [title]", "Module 2: [title]" etc.
   - Lessons inside each group are labelled `1.1 — [title]`, `1.2 — [title]`, `2.1 — [title]` etc.
   - The numbering matches what the learner sees (compare screenshots)

2. **Select a lesson from Module 2**
   - Breadcrumb shows: `Module 2 › 2.3 [lesson title]`

3. **Select a step**
   - Step dropdown shows `Step 1 — [title] (type)`, `Step 2 — ...` etc.
   - Breadcrumb updates to show: `Module 2 › 2.3 [lesson title] › Step 4 [step title]`

4. **Select a different course**
   - Lesson dropdown resets and clears correctly
   - Breadcrumb disappears when lesson is deselected

5. **The existing animation workflow still works end to end:**
   - Select course → lesson → step → script auto-loads → Parse Script → Preview Animation (no regressions)

6. **Run `npm run build` in `apps/med/`** — zero TypeScript errors.

7. **Run `npx tsc --noEmit`** — no type errors.

---

## Definition of Done

- [ ] Lesson dropdown groups lessons by module with `<optgroup>` labels
- [ ] Each lesson option shows `M.L — Title` format matching learner-facing numbering
- [ ] Step dropdown shows `Step N — Title (type)` format
- [ ] Breadcrumb bar shows selected Module → Lesson → Step path
- [ ] Existing animation workflow has zero regressions
- [ ] `npm run build` passes with zero errors

---

## Files to Change (complete list)

| File | Change |
|------|--------|
| `apps/med/app/api/lessons/route.ts` | Add `title` to module select; add `_module_title` to lesson map |
| `apps/med/app/admin/animations/page.tsx` | Update `Lesson` interface; restructure lesson dropdown with `<optgroup>`; update step dropdown; add breadcrumb |

**That is all. Two files. No other changes.**
