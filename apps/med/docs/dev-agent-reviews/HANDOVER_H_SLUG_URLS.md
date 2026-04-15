# Dev Agent Handover — Feature H: Human-Readable Slug URLs

## Your role

You are a **Senior Full-Stack Engineer** specializing in routing, URL architecture, and SEO-friendly web applications. Your job is to replace all UUID-based URLs in the learner experience with clean, human-readable slugs.

**Skills you must apply:**

- **Next.js App Router** (dynamic route segments, `generateStaticParams`, `useParams`, `Link`, `redirect`)
- **PostgreSQL / Supabase** (schema migrations, unique indexes, column additions, query optimization)
- **URL design** (slug generation, uniqueness constraints, special character handling, i18n slug considerations)
- **TypeScript** (type safety across routes, params, and data models)
- **Data migration** (backfilling slugs for existing records)
- **Backward compatibility** (redirects from old UUID URLs so bookmarks don't break)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. The data hierarchy is:

```
Course → Module → Lesson → Step (inline, no route)
```

All three entities (course, module, lesson) currently use **UUIDs as URL slugs**, making URLs like:

```
/learn/courses/9113d5cb-cedb-4bea-9678-7321020230e8/lessons/22cb2740-3080-4723-9661-013b80e02220
```

The product owner wants:

```
/learn/courses/emergency-nursing-communication/lessons/first-contact-in-an-emergency
```

---

## The problem in detail

UUIDs in URLs are:
- **Ugly** — random hexadecimal strings are confusing for users
- **Meaningless** — users can't tell what page they're on from the URL
- **Unshareable** — learners can't share a clean link with classmates
- **Bad for SEO** — search engines prefer descriptive slugs
- **Hard to debug** — admin/dev can't identify a course by looking at the URL

### Scope

**Learner routes** (priority — user-facing):
- `/learn/courses/[courseId]` → `/learn/courses/[courseSlug]`
- `/learn/courses/[courseId]/modules/[moduleId]` → `/learn/courses/[courseSlug]/modules/[moduleSlug]`
- `/learn/courses/[courseId]/lessons/[lessonId]` → `/learn/courses/[courseSlug]/lessons/[lessonSlug]`

**Admin routes** (secondary — internal tooling, but still ugly):
- `/admin/courses/[courseId]` → `/admin/courses/[courseSlug]`
- `/admin/courses/[courseId]/lessons/[lessonId]` → `/admin/courses/[courseSlug]/lessons/[lessonSlug]`

**API routes** should continue accepting UUIDs internally (API consumers don't see URLs in browser). The slug-to-ID resolution happens in the page components or a shared utility.

---

## Current state — complete inventory

### Database schema (NO slug columns exist)

```sql
-- nursed_courses: id (uuid PK), title, title_vi, ...
-- nursed_modules: id (uuid PK), course_id (FK), title, title_vi, ...
-- nursed_lessons: id (uuid PK), module_id (FK), title, title_vi, ...
```

**No `slug` column** on any table. You will add them.

### TypeScript types (`apps/med/lib/supabase.ts`)

```typescript
NursedCourse  = { id: string, title: string, title_vi: string | null, ... }
NursedModule  = { id: string, course_id: string, title: string, title_vi: string | null, ... }
NursedLesson  = { id: string, module_id: string, title: string, title_vi: string | null, ... }
```

No `slug` field in any type.

### Route folders

| Current folder | Dynamic param |
|----------------|--------------|
| `app/learn/courses/[courseId]/` | `courseId` |
| `app/learn/courses/[courseId]/lessons/[lessonId]/` | `lessonId` |
| `app/learn/courses/[courseId]/modules/[moduleId]/` | `moduleId` |
| `app/admin/courses/[courseId]/` | `courseId` |
| `app/admin/courses/[courseId]/lessons/[lessonId]/` | `lessonId` |

### DB query functions (`apps/med/lib/db/courses.ts`)

All queries use `.eq('id', ...)`:

```typescript
getCourseById(id)  → .from('nursed_courses').eq('id', id).single()
getModuleById(id)  → .from('nursed_modules').eq('id', id).single()
getLessonById(id)  → .from('nursed_lessons').eq('id', id).single()
```

### Every place that constructs a URL with an ID (38+ locations)

**Learner pages:**

| File | Line(s) | Pattern |
|------|---------|---------|
| `app/learn/page.tsx` | 318, 402 | `` `/learn/courses/${course.id}` ``, `` `/learn/courses/${lesson.courseId}/lessons/${lesson.lessonId}` `` |
| `app/learn/courses/page.tsx` | 218 | `` `/learn/courses/${course.id}` `` |
| `app/learn/courses/[courseId]/page.tsx` | 342, 407, 415 | `` `/learn/courses/${courseId}/modules/${mod.id}` ``, `` `/learn/courses/${courseId}/lessons/${lesson.id}` `` |
| `app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx` | 122–128, 151, 164 | Breadcrumbs + back links using `courseId`, `moduleForLesson.id` |
| `app/learn/courses/[courseId]/modules/[moduleId]/page.tsx` | 142–143, 234–241 | Breadcrumbs + lesson links using `courseId`, `lesson.id` |
| `components/learn/LessonPlayer.tsx` | 163, 219, 230–241, 281 | `resolvedCourseId`, `nextLesson.id`, `lesson.module_id` |
| `components/landing/LandingCourseCard.tsx` | 112 | `` `/learn/courses/${course.id}` `` |

**Admin pages:**

| File | Line(s) | Pattern |
|------|---------|---------|
| `app/admin/page.tsx` | 118 | `` `/admin/courses/${course.id}` `` |
| `app/admin/courses/page.tsx` | 72, 89, 195 | Course list links |
| `app/admin/courses/[courseId]/page.tsx` | 38, 67, 83, 140, 149, 420 | API fetches + lesson links |
| `app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | 219 | Back link to course |

**`useParams` readers (7 files):**

| File | Params read |
|------|------------|
| `app/learn/courses/[courseId]/page.tsx` | `courseId` |
| `app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx` | `courseId`, `lessonId` |
| `app/learn/courses/[courseId]/modules/[moduleId]/page.tsx` | `courseId`, `moduleId` |
| `app/admin/courses/[courseId]/page.tsx` | `courseId` |
| `app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | `courseId`, `lessonId` |
| `components/learn/LessonPlayer.tsx` | `courseId` |
| `components/learn/steps/RecordingStep.tsx` | `lessonId` |

**localStorage (`nursed_last_lesson`):**

```typescript
// Written: app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx line 97
localStorage.setItem('nursed_last_lesson', JSON.stringify({ lessonId, courseId, title }))

// Read: app/learn/page.tsx line 80
const stored = localStorage.getItem('nursed_last_lesson')
// Used to build: `/learn/courses/${lesson.courseId}/lessons/${lesson.lessonId}`
```

---

## Implementation plan

### Phase 1: Database — add slug columns + backfill

**New migration** (`supabase/migrations/045_add_slugs.sql`):

```sql
ALTER TABLE nursed_courses ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE nursed_modules ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE nursed_lessons ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS nursed_courses_slug_idx ON nursed_courses (slug) WHERE slug IS NOT NULL;
-- Module slugs must be unique within a course
CREATE UNIQUE INDEX IF NOT EXISTS nursed_modules_slug_idx ON nursed_modules (course_id, slug) WHERE slug IS NOT NULL;
-- Lesson slugs must be unique within a module
CREATE UNIQUE INDEX IF NOT EXISTS nursed_lessons_slug_idx ON nursed_lessons (module_id, slug) WHERE slug IS NOT NULL;
```

**Backfill script** — generate slugs from existing `title` values:
- `"Emergency Nursing Communication"` → `"emergency-nursing-communication"`
- Handle duplicates by appending `-2`, `-3`, etc.
- Handle Vietnamese titles: use English `title` for slugs (not `title_vi`)
- Handle special characters: strip non-alphanumeric, replace spaces with hyphens, lowercase

### Phase 2: TypeScript types + DB helpers

Update `NursedCourse`, `NursedModule`, `NursedLesson` types to include `slug: string | null`.

Add resolution functions:

```typescript
// lib/db/courses.ts
getCourseBySlug(slug: string)      → .from('nursed_courses').eq('slug', slug).single()
getModuleBySlug(courseId, slug)     → .from('nursed_modules').eq('course_id', courseId).eq('slug', slug).single()
getLessonBySlug(moduleId, slug)     → .from('nursed_lessons').eq('module_id', moduleId).eq('slug', slug).single()
```

Or a **universal resolver** that accepts either UUID or slug:

```typescript
async function resolveCourse(slugOrId: string) {
  const isUuid = /^[0-9a-f]{8}-/.test(slugOrId)
  return isUuid ? getCourseById(slugOrId) : getCourseBySlug(slugOrId)
}
```

### Phase 3: Rename route folders

Rename dynamic segment folders to use `Slug` naming:

```
[courseId] → [courseSlug]   (or keep [courseId] and resolve both — your choice)
[lessonId] → [lessonSlug]
[moduleId] → [moduleSlug]
```

Update all `useParams` calls to match the new segment name.

### Phase 4: Update all URL construction (38+ locations)

Every place that builds a URL with `.id` must now use `.slug ?? .id` (fallback to UUID if slug is null):

```typescript
// Before:
href={`/learn/courses/${course.id}`}
// After:
href={`/learn/courses/${course.slug ?? course.id}`}
```

This is the largest phase. Use the inventory table above as your checklist.

### Phase 5: Update localStorage

```typescript
// Store slug alongside ID
localStorage.setItem('nursed_last_lesson', JSON.stringify({
  lessonId, courseId, title,
  courseSlug: course.slug,
  lessonSlug: lesson.slug,
}))

// Read and construct URL with slug
href={`/learn/courses/${stored.courseSlug ?? stored.courseId}/lessons/${stored.lessonSlug ?? stored.lessonId}`}
```

### Phase 6: Auto-generate slugs on create/update

When admin creates or renames a course/module/lesson:
- Auto-generate slug from English title
- Check uniqueness within scope (course slugs globally, module slugs within course, lesson slugs within module)
- Allow manual override in admin editor (optional for MVP)

### Phase 7: Backward compatibility (UUID redirects)

Users may have bookmarked UUID-based URLs. Add a redirect:

```typescript
// In the page component or middleware:
// If param looks like a UUID and a record with that ID exists, redirect to slug URL
if (/^[0-9a-f]{8}-/.test(courseSlug)) {
  const course = await getCourseById(courseSlug)
  if (course?.slug) redirect(`/learn/courses/${course.slug}`, 301)
}
```

### Phase 8: Admin slug editing (optional)

Add a slug field to the admin course/lesson editors so admins can customize slugs. Pre-populate from title, allow manual edit.

---

## Slug generation rules

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip diacritics (Vietnamese)
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')             // Vietnamese đ
    .replace(/[^a-z0-9]+/g, '-')                        // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')                             // trim leading/trailing hyphens
    .substring(0, 80)                                    // max length
}
```

Examples:

| Title | Slug |
|-------|------|
| Emergency Nursing Communication | `emergency-nursing-communication` |
| First Contact in an Emergency | `first-contact-in-an-emergency` |
| Vital Signs in Crisis — What the Numbers Mean | `vital-signs-in-crisis-what-the-numbers-mean` |
| Module 1: First Contact | `module-1-first-contact` |
| Bệnh nhân khó thở (Vietnamese) | Uses English `title`, not `title_vi` |

---

## Critical constraints and guardrails

### DO

- Add `slug` columns to ALL three tables (courses, modules, lessons)
- Backfill ALL existing records with generated slugs
- Support BOTH UUID and slug resolution during the transition (universal resolver)
- Add 301 redirects from UUID URLs to slug URLs for backward compatibility
- Add unique indexes scoped appropriately (global for courses, per-course for modules, per-module for lessons)
- Update ALL 38+ URL construction points (use the inventory above as a checklist)
- Update `localStorage` storage/retrieval to include slugs
- Update TypeScript types in `lib/supabase.ts`
- Auto-generate slugs when creating new courses/modules/lessons
- Use English `title` (not Vietnamese `title_vi`) for slug generation
- Add all new UI text to `lib/i18n/translations.ts`
- Test that ALL existing links still work (with UUID redirect)

### DO NOT

- Do NOT remove UUID support from API routes — APIs continue to use UUIDs internally
- Do NOT break the admin panel — admin can continue using UUIDs internally if needed
- Do NOT change the database primary keys — `id` stays as UUID PK
- Do NOT create slugs from Vietnamese titles (diacritics cause issues in URLs)
- Do NOT allow empty or duplicate slugs — enforce with DB constraints
- Do NOT modify step-level routes (steps don't have their own URLs)
- Do NOT break progress tracking — `nursed_progress` and `nursed_submissions` reference lesson UUIDs, not slugs
- Do NOT create documentation files unless asked
- Do NOT modify Firebase Functions or mobile app code

### Edge cases to handle

- **Duplicate titles**: Two lessons named "Quiz" in the same module → `quiz` and `quiz-2`
- **Empty titles**: Fallback to `untitled-{uuid-prefix}` (e.g., `untitled-9113d5`)
- **Title changes**: When admin renames a course, regenerate slug (or keep old slug + redirect)
- **Very long titles**: Truncate at 80 chars
- **Special characters**: Em dashes, quotes, colons → stripped or replaced with hyphens
- **`RecordingStep` uses `lessonId` from params for uploads**: This is sent to the API which needs a UUID. Resolve slug → UUID before API calls in `RecordingStep`

---

## Files you must read first

| File | Why | Priority |
|------|-----|----------|
| `supabase/migrations/041_nursed_schema.sql` | Current schema — no slug columns | HIGH |
| `apps/med/lib/supabase.ts` | TypeScript types to update | HIGH |
| `apps/med/lib/db/courses.ts` | DB query functions — add slug resolvers | HIGH |
| `apps/med/app/learn/courses/[courseId]/page.tsx` | Course page — URL construction | HIGH |
| `apps/med/app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx` | Lesson page — params + breadcrumbs | HIGH |
| `apps/med/app/learn/courses/[courseId]/modules/[moduleId]/page.tsx` | Module page — params + links | HIGH |
| `apps/med/components/learn/LessonPlayer.tsx` | Step navigation + completion links | HIGH |
| `apps/med/app/learn/page.tsx` | Dashboard — continue learning + course cards | HIGH |
| `apps/med/app/learn/courses/page.tsx` | Course catalog links | MEDIUM |
| `apps/med/components/landing/LandingCourseCard.tsx` | Landing page course links | MEDIUM |
| `apps/med/app/admin/courses/[courseId]/page.tsx` | Admin course page | MEDIUM |
| `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | Admin lesson page | MEDIUM |
| `apps/med/app/admin/page.tsx` | Admin dashboard course links | MEDIUM |
| `apps/med/app/admin/courses/page.tsx` | Admin course list | MEDIUM |
| `apps/med/components/learn/steps/RecordingStep.tsx` | Uses `lessonId` param for API calls | LOW |
| `apps/med/app/api/courses/[courseId]/route.ts` | API route — may need slug support | LOW |

---

## Recommended implementation order

1. **Migration**: Add `slug` columns + unique indexes
2. **Backfill**: Generate slugs for all existing courses, modules, lessons
3. **Types**: Update TypeScript types in `lib/supabase.ts`
4. **DB helpers**: Add `getCourseBySlug`, `getModuleBySlug`, `getLessonBySlug` + universal resolver
5. **Slug utility**: `generateSlug(title)` function in `lib/utils/slug.ts`
6. **Route folders**: Rename `[courseId]` → `[courseSlug]` etc. (or keep names and resolve both)
7. **Page components**: Update all `useParams` + data fetching to resolve slug → entity
8. **URL construction**: Update all 38+ `href` / `Link` / `router.push` to use `.slug`
9. **localStorage**: Update `nursed_last_lesson` read/write
10. **Redirects**: Add UUID → slug 301 redirects
11. **Auto-slug on create**: Hook into `createCourse`/`createModule`/`createLesson`
12. **Admin**: Update admin URL construction
13. **Test**: Verify all routes, breadcrumbs, back links, and continue-learning work with slugs

---

## Deliverable

A complete URL system where:
- All learner-facing URLs use descriptive slugs (e.g., `/learn/courses/emergency-nursing-communication/lessons/first-contact-in-an-emergency`)
- Old UUID URLs redirect with 301 to slug URLs
- Slugs are auto-generated from English titles on creation
- Database has proper unique constraints
- All breadcrumbs, links, and navigation use slugs
- Admin URLs also use slugs
- Progress tracking and API routes continue working with UUIDs internally
