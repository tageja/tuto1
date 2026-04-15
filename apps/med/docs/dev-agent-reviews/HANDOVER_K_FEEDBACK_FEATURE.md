# Dev Agent Handover — Feature K: Learner Feedback System (MVP)

## Your role

You are a **Senior Product Engineer** building a lightweight, motivating feedback system that lets learners report bugs, suggest improvements, and share thoughts — and lets admins triage that feedback. Keep it simple. This is an MVP feature, not a full-blown support ticket system.

**Skills you must apply:**

- **TypeScript + React** (forms, state, optimistic UI)
- **Next.js App Router** (route handlers, client components)
- **Supabase / Postgres** (schema design, RLS, queries, indexes)
- **UX for learning products** (low-friction input, motivation, positive reinforcement)
- **Responsive design** (mobile sidebar, modals/drawers)
- **i18n** (bilingual EN + VI)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. It uses **Supabase** (Auth + Postgres) for data. The app has a **learner** experience (`/learn/*`) and an **admin** dashboard (`/admin/*`).

There is already a **per-lesson feedback survey** (`nursed_lesson_feedback`) that asks 5 Likert-scale questions after each lesson. That is a **different feature** — do not modify or confuse it with this general feedback system.

This new feature is a **general-purpose feedback channel** — learners can submit feedback at any time from the sidebar, about anything (bugs, suggestions, course content, UX issues).

---

## What to build

### 1. Learner side — Submit feedback

**Entry point**: A feedback button in the **learner sidebar** (`LearnerSidebar.tsx`), placed in the bottom area between the streak badge and the partner logo section (see screenshot reference below).

**Screenshot**: The circled area in the sidebar is where the button should go: `assets/image-874746ac-65ca-4c0e-89d4-349688fe894f.png` (in `C:\Users\Admin\.cursor\projects\c-Users-Admin-tuto/assets/`).

**Feedback form** (modal, drawer, or inline — your design choice):
- **Category** (required): Pick one of:
  - `bug` — "Something isn't working" / "Có lỗi"
  - `suggestion` — "I have an idea" / "Đề xuất ý tưởng"
  - `content` — "Course content feedback" / "Góp ý nội dung"
  - `other` — "Something else" / "Khác"
- **Message** (required): Free-text textarea, min 10 chars, max 500 chars
- **Page context** (auto-captured): Current URL path (e.g., `/learn/courses/abc/lessons/xyz`) — so admins know where the feedback was given
- **Submit button**: Shows success state with a motivating message

**Motivation**: After submitting, show a warm thank-you message. Something like:
- EN: "Thank you for helping us improve! Your feedback matters."
- VI: "Cảm ơn bạn đã giúp chúng tôi cải thiện! Ý kiến của bạn rất quan trọng."

Consider adding a small emoji or animation to make the learner feel heard.

**My feedback history**: Learners should be able to see all their previous feedback submissions. This could be:
- A page at `/learn/feedback` (simple list)
- Or a section in the feedback modal/drawer
- Each item shows: category, message (truncated), date, status (pending/in-progress/fixed/rejected), and admin response if rejected

### 2. Admin side — Triage feedback

**New route**: `/admin/feedback`

**Add to admin sidebar** (`AdminSidebar.tsx`): Add a nav item with a `MessageSquare` or similar icon.

**Admin feedback dashboard** showing:
- **Stats bar**: Total feedback count, pending, in progress, fixed, rejected
- **Filterable list**: Filter by status, category, date range
- **Each feedback card** shows:
  - Learner name (from `nursed_profiles.full_name`) or "Anonymous"
  - Category badge (color-coded: bug=red, suggestion=blue, content=yellow, other=gray)
  - Message text
  - Page context (which URL they were on)
  - Submitted date
  - Current status
  - **Action buttons**:
    - "Mark as In Progress" → sets status to `in_progress`
    - "Mark as Fixed" → sets status to `fixed`
    - "Reject" → opens a small inline input for a one-liner explanation, then sets status to `rejected` with `admin_response`

### 3. Database

**New migration** (`supabase/migrations/046_nursed_feedback.sql`):

```sql
CREATE TABLE IF NOT EXISTS nursed_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        text NOT NULL CHECK (category IN ('bug', 'suggestion', 'content', 'other')),
  message         text NOT NULL,
  page_context    text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'fixed', 'rejected')),
  admin_response  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_nursed_feedback_user ON nursed_feedback(user_id);
CREATE INDEX idx_nursed_feedback_status ON nursed_feedback(status);

ALTER TABLE nursed_feedback ENABLE ROW LEVEL SECURITY;

-- Learners can insert their own feedback
CREATE POLICY "feedback_self_insert" ON nursed_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learners can read their own feedback
CREATE POLICY "feedback_self_select" ON nursed_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (admin operations go through service client)
CREATE POLICY "feedback_service_all" ON nursed_feedback
  FOR ALL USING (true);
```

**Important**: This is `nursed_feedback` — NOT `nursed_lesson_feedback` (which already exists for per-lesson surveys). Completely separate table.

### 4. API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/feedback` | POST | Learner submits feedback (auth required) |
| `/api/feedback` | GET | Learner gets their own feedback history, or admin gets all feedback |
| `/api/feedback/[id]` | PATCH | Admin updates status / adds admin_response |

### 5. TypeScript types

Add to `lib/supabase.ts`:

```typescript
export type NursedFeedback = {
  id: string
  user_id: string
  category: 'bug' | 'suggestion' | 'content' | 'other'
  message: string
  page_context: string | null
  status: 'pending' | 'in_progress' | 'fixed' | 'rejected'
  admin_response: string | null
  created_at: string
  updated_at: string
}
```

---

## Sidebar placement (learner)

The feedback button goes in `LearnerSidebar.tsx` between the streak badge (line 82) and the partner logo section (line 93). Here's the exact insertion point:

```typescript
// After streak badge (line 91: closing </div>)
// INSERT FEEDBACK BUTTON HERE
// Before partner logo (line 93: {/* Partner logo + language toggle + logout */})
```

Design the button to stand out slightly but not be intrusive. Suggested style:
- Subtle card with a speech bubble icon
- Text like "Give Feedback" / "Góp ý"
- Maybe a small pulse animation on first visit (localStorage flag to show once)

---

## Admin sidebar placement

Add to `NAV_ITEMS` in `AdminSidebar.tsx` (line 19–27):

```typescript
{ label: t.navFeedback ?? 'Feedback', href: '/admin/feedback', icon: MessageSquare },
```

Place it after Analytics and before Audio Generation.

---

## Motivation strategy

To encourage learners to give feedback:

1. **Positive framing**: Use language like "Help us build a better course for you" rather than "Report a problem"
2. **Immediate gratification**: After submit, show a warm thank-you with a small animation or emoji burst
3. **Visibility**: Learners can see their feedback history and track status — they feel heard when they see "Fixed" status
4. **Low friction**: 2 fields only (category + message). No login wall (they're already logged in). No multi-step form.
5. **Context-aware**: Auto-capture the current page so learners don't have to explain where they were

---

## Critical constraints and guardrails

### DO

- Keep it **simple** — 2 fields for learners (category + message), auto-capture page context
- Use **existing patterns**: API routes in `app/api/`, DB helpers in `lib/db/`, types in `lib/supabase.ts`
- Add all text to `lib/i18n/translations.ts` in both EN and VI
- Use Supabase Auth (`useAuth()`) for user identification — never trust client-sent userId
- Use `getServiceClient()` for admin operations (bypasses RLS)
- Use `createSupabaseServerClient()` for learner operations (respects RLS)
- Make the admin dashboard sortable/filterable by status and category
- Auto-set `updated_at` on status changes
- Validate message length (min 10, max 500 chars)
- Follow existing design system: `card`, `btn-primary`, `btn-secondary`, `badge`, `input`, `label` CSS classes
- Check the migration number — look at existing migrations in `supabase/migrations/` and use the next sequential number

### DO NOT

- Do NOT modify `nursed_lesson_feedback` or `LessonFeedbackScreen` — that's a separate feature
- Do NOT over-engineer — no comments/threads, no attachments, no priority levels, no assignees. Just category, message, status, and admin response.
- Do NOT install new libraries — use existing React + Lucide icons + existing CSS classes
- Do NOT create a separate page for the feedback form — use a modal/drawer triggered from the sidebar button
- Do NOT hardcode strings in JSX — use the translation system
- Do NOT modify Firebase Functions or mobile app code
- Do NOT create documentation files unless asked

---

## Files you must read

| File | Why | Priority |
|------|-----|----------|
| `apps/med/components/learn/LearnerSidebar.tsx` | Sidebar — add feedback button here | HIGH |
| `apps/med/components/admin/AdminSidebar.tsx` | Admin nav — add feedback link | HIGH |
| `apps/med/lib/supabase.ts` | Types — add NursedFeedback | HIGH |
| `apps/med/lib/i18n/translations.ts` | Translations — add EN + VI keys | HIGH |
| `apps/med/app/admin/page.tsx` | Admin dashboard — reference pattern for the feedback dashboard | MEDIUM |
| `apps/med/lib/db/progress.ts` | DB helper patterns — follow for feedback CRUD | MEDIUM |
| `apps/med/app/api/lesson-feedback/route.ts` | API route pattern — follow for feedback API | MEDIUM |
| `apps/med/contexts/AuthContext.tsx` | Auth context — use `useAuth()` for user info | MEDIUM |
| `supabase/migrations/044_nursed_lesson_feedback.sql` | Existing lesson feedback — do NOT confuse with this feature | LOW |
| `supabase/migrations/045_nursed_peer_reviews.sql` | Latest migration — check number for your new migration | LOW |

---

## Recommended implementation order

1. **Migration**: Create `nursed_feedback` table with RLS
2. **Types**: Add `NursedFeedback` type to `lib/supabase.ts`
3. **DB helpers**: Create `lib/db/feedback.ts` with CRUD functions
4. **API routes**: `/api/feedback` (GET/POST) + `/api/feedback/[id]` (PATCH)
5. **Feedback form component**: Modal/drawer with category + message
6. **Sidebar button**: Add to `LearnerSidebar.tsx` in the bottom area
7. **Feedback history**: Learner can view their submissions + status
8. **Admin dashboard**: `/admin/feedback` with filters, status actions, rejection response
9. **Admin sidebar**: Add nav item
10. **Translations**: All EN + VI strings

---

## Deliverable

A working feedback system where:
- Learners can submit feedback from a sidebar button (category + message)
- Page context is auto-captured
- Learners see their feedback history with status updates
- Admins see all feedback at `/admin/feedback` with filters
- Admins can mark feedback as in-progress, fixed, or rejected (with explanation)
- All text in EN + VI
- Mobile-responsive
- Separate from the existing per-lesson survey
