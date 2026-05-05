# HANDOVER V — Feedback Submission UX (Floating Button + Bottom-Sheet Form)

## Agent Role & Identity

You are a **Senior Front-End Engineer** specialising in Next.js 16 App Router, Tailwind CSS with CSS variables, framer-motion micro-interactions, and accessible mobile-first UX. You think like a designer who codes — every pixel earns its place, every animation has a reason, every form field is friction the learner has to overcome.

**Working directory:** `apps/med/`. **Migrations folder:** `supabase/migrations/` (you will NOT touch it on this task — see Out of Scope).

**Test account:** `test@test.com` / `password` (role: learner). Use this for all manual verification.

---

## Feature Overview

A **floating "Send feedback" button** appears in the bottom-right corner of every learner page (`/learn/*`). Clicking it opens a **bottom-sheet modal** (slides up from the bottom on mobile; centred modal on desktop) containing a minimal form:

1. **Category picker** — 4 large icon-buttons in a 2×2 grid: Bug, Suggestion, Content issue, Other (with `lucide-react` icons matching the existing `CATEGORY_META` map in `app/learn/feedback/page.tsx` and `app/admin/feedback/page.tsx`)
2. **Message textarea** — required, placeholder hints what to write, character counter (10 min, 500 max — already enforced by API; the UI must mirror these limits and disable submit when out of range)
3. **Submit button** — POSTs to existing `POST /api/feedback`, includes auto-captured `pageContext` (current pathname via `usePathname()`)
4. **Success state** — replace the form contents with a thank-you panel + a link "View your feedback" → `/learn/feedback`. Auto-close after 3 seconds OR on user click.

**System behaviour:** the button is rendered once in `app/learn/layout.tsx` so it persists across all learner pages including the lesson player. The new feedback row is immediately visible in the existing learner history page (`/learn/feedback`) and in admin (`/admin/feedback`) — both are already wired to read from `/api/feedback` GET, so no API changes are needed.

**Goal:** lowest possible friction. A learner should be able to send feedback in **<15 seconds** from any page in the app, including the lesson player mid-step.

---

## Current State

### What already exists (do NOT recreate)

| File | Purpose | Status |
|---|---|---|
| `supabase/migrations/047_nursed_feedback.sql` | Table `nursed_feedback` with categories, statuses, RLS | ✅ Live |
| `app/api/feedback/route.ts` | POST (insert with auth + 10-500 char validation) and GET (learner-self or admin-all) | ✅ Live |
| `app/api/feedback/[id]/route.ts` | PATCH for admin status updates | ✅ Live |
| `lib/db/feedback.ts` | DB helpers `insertFeedback`, `getUserFeedback`, `getAllFeedback` | ✅ Live |
| `app/learn/feedback/page.tsx` | Learner-facing **history view** (read-only, no submission form) | ✅ Live |
| `app/admin/feedback/page.tsx` | Admin dashboard with filters + status workflow | ✅ Live |
| `lib/i18n/translations.ts` | Existing keys: `feedbackCategoryBug`, `feedbackCategorySuggestion`, `feedbackCategoryContent`, `feedbackCategoryOther`, `feedbackStatusPending`, `feedbackStatusInProgress`, `feedbackStatusFixed`, `feedbackStatusRejected`, `feedbackHistoryTitle`, `feedbackHistoryEmpty`, `feedbackAdminPageContext`, `feedbackAdminResponse` | ✅ Live |

### What is missing (this agent's job)

1. **No submission form anywhere** — `app/learn/feedback/page.tsx` is read-only. Learners cannot file feedback at all today.
2. **No entry point** — no button, tab, link, or menu item exposes the feedback flow in the learner UI shell.
3. **No client-side rate-limit hint** — the API enforces auth and 10-500 chars, but the UI should disable submit + show character count to make this clear.

### Mount point

The floating button must be rendered in **`app/learn/layout.tsx`** (existing file at lines 1-60). Add it INSIDE the `<main>` element, AFTER the `{children}` slot, so it overlays the page content. Existing top bar already contains a global VI translation toggle — DO NOT touch that.

### Type contract (from `lib/supabase.ts`)

```ts
export type FeedbackCategory = 'bug' | 'suggestion' | 'content' | 'other'
export type FeedbackStatus = 'pending' | 'in_progress' | 'fixed' | 'rejected'
```

You'll use `FeedbackCategory` in your form state.

---

## Out of Scope

- ❌ **Don't touch the database schema.** Migration 047 is final. No `054_*.sql` for this task.
- ❌ **Don't change `app/admin/feedback/page.tsx`** — it's working, ship-tested, and serves a different audience.
- ❌ **Don't restructure `app/learn/feedback/page.tsx`** beyond optionally adding a "Send new feedback" button at the top of the empty state. The history view itself stays as-is.
- ❌ **Don't add new npm packages.** `framer-motion` is already installed for animations; `lucide-react` for icons. Plain controlled `useState` is fine for this small form (`react-hook-form` is NOT currently installed — verify with `grep "react-hook-form" package.json` before assuming otherwise).
- ❌ **Don't change the status taxonomy** (`pending/in_progress/fixed/rejected`). The product owner intentionally chose to keep the schema. Tweak the *labels* in `lib/i18n/translations.ts` only if a label feels off — see "Translation Keys" below.
- ❌ **Don't auto-attach screenshots, browser fingerprints, user-agent, or any PII** beyond `pageContext` (the pathname). MVP scope.

---

## Database Changes

**None.** Migration 047 already covers everything needed.

---

## API Routes

**None new.** Use the existing `POST /api/feedback`:

```ts
// Request body shape (already validated server-side)
{
  category: 'bug' | 'suggestion' | 'content' | 'other',
  message: string, // 10..500 chars after trim
  pageContext?: string | null
}

// Success response: 201 with { data: NursedFeedback }
// Errors: 400 (validation), 401 (unauthorised), 500
```

**Auto-capture `pageContext`:** call `usePathname()` (from `next/navigation`) inside the modal component, so the current path (e.g. `/learn/courses/emergency-nursing-comm/lessons/1-1`) is sent automatically. Learners shouldn't have to type "I'm on lesson 1.1" — we capture it.

---

## UI Components

### 1. `components/learn/FeedbackButton.tsx` (NEW)

A floating action button (FAB) fixed at `bottom-6 right-6` (mobile) / `bottom-8 right-8` (desktop). Round, primary color, with a `MessageSquare` icon from `lucide-react`. Subtle elevation shadow.

```tsx
interface FeedbackButtonProps {
  onClick: () => void
}
```

States:
- Default: visible, primary color, slight `scale-100`
- Hover: `scale-105`, shadow grows
- Active (pressed): `scale-95`
- Disabled: never (the button is always interactive — auth check happens server-side on submit)

Hide the button on the auth pages even though those aren't `/learn/*`. (Not strictly necessary since this is mounted in `learn/layout.tsx`, but be defensive — wrap in a check that the user is authed via the existing auth context if there's any chance of false-positive renders.)

**Accessibility:** `aria-label="{t.feedbackOpenButton}"`, focus ring visible, keyboard-activatable (Enter/Space).

### 2. `components/learn/FeedbackModal.tsx` (NEW)

A controlled modal component. Two layout modes:

- **Mobile (≤640px):** bottom-sheet — slides up from the bottom; rounded top corners; takes ~70% of viewport height; backdrop dim 50% black; closeable by tapping backdrop or swipe-down handle (use `framer-motion`'s drag handlers OR a simple X close button — drag is bonus, X is required)
- **Desktop (>640px):** centred modal — `max-w-md`, rounded-xl, vertical center; backdrop dim 30% black; closeable by clicking backdrop or X

Both modes: animated entry/exit via framer-motion (`AnimatePresence` + `motion.div` with `initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}` for mobile; opacity + scale for desktop).

```tsx
interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}
```

Internal state:
```ts
const [category, setCategory] = useState<FeedbackCategory | null>(null)
const [message, setMessage] = useState('')
const [submitting, setSubmitting] = useState(false)
const [success, setSuccess] = useState(false)
const [error, setError] = useState<string | null>(null)
```

Layout (top → bottom, inside the sheet):

1. **Header**: title `t.feedbackModalTitle` + close X button (top-right)
2. **Category grid**: 2×2 grid of icon+label buttons. Each button shows the lucide-react icon + Vietnamese-and-English label. Selected state has primary border + light primary bg (mirror the existing `CATEGORY_META` styles in `app/admin/feedback/page.tsx` for consistency)
3. **Message textarea**: 4 rows visible, `resize-y`, placeholder = `t.feedbackModalMessagePlaceholder`. Character counter `{message.length} / 500` shown below right; turns red if `<10` (with hint `t.feedbackModalMessageMin`) or `>500`
4. **Submit button**: full-width, primary. Disabled when: `!category || message.trim().length < 10 || message.length > 500 || submitting`. Shows loading spinner when `submitting === true`
5. **Error message**: small red text below the submit button, only visible when `error !== null`
6. **Success state** (replaces 1-5 entirely): green checkmark icon + `t.feedbackModalSuccessTitle` + `t.feedbackModalSuccessSubtitle` + a link to `/learn/feedback` with text `t.feedbackModalViewHistory`. Auto-close after 3 seconds (use `setTimeout` in a `useEffect` triggered by `success`)

Submit handler pseudocode:
```ts
async function handleSubmit() {
  setSubmitting(true)
  setError(null)
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        message: message.trim(),
        pageContext: pathname, // from usePathname()
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      setError(error || t.feedbackModalErrorGeneric)
      return
    }
    setSuccess(true)
  } catch {
    setError(t.feedbackModalErrorNetwork)
  } finally {
    setSubmitting(false)
  }
}
```

After success, RESET the form when the modal closes (so the next open shows a fresh form): tie reset to `open === false` in a `useEffect`.

### 3. Modification to `app/learn/layout.tsx` (EDIT)

Mount the button + modal at the bottom of the `<main>` element so they overlay all `/learn/*` pages including the lesson player. Pseudocode:

```tsx
// existing imports
import FeedbackButton from '@/components/learn/FeedbackButton'
import FeedbackModal from '@/components/learn/FeedbackModal'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  // ... existing sidebar state, lang context ...

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ... existing sidebar + topbar + main ... */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto relative">
        {/* ... existing topbar ... */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
        <FeedbackButton onClick={() => setFeedbackOpen(true)} />
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </main>
    </div>
  )
}
```

**Important:** the button must NOT obstruct the lesson player's "Next" button on mobile. The lesson player CTAs typically sit at `bottom-4` to `bottom-8` on mobile. Use `bottom-20 right-4` (mobile) and `bottom-8 right-8` (desktop) to clear the lesson CTAs. Test with the test account on the lesson player at `/learn/courses/emergency-nursing-communication/lessons/1-1` — both buttons must be tappable without overlap.

### 4. Optional polish: badge on `/learn/feedback` empty state

Currently the empty history page just shows "No feedback yet". Add a "Send your first feedback" button that opens the same modal. **This is optional** — only do it if there's time. Wire it via lifting the modal state into a small context, or by passing a query param like `/learn/feedback?compose=1`.

---

## Wiring & Integration

### Translation Keys (NEW — add to `lib/i18n/translations.ts`)

Both `en` and `vi` objects need the following new keys:

| Key | EN | VI (Tarun will refine if needed) |
|---|---|---|
| `feedbackOpenButton` | `Send feedback` | `Gửi phản hồi` |
| `feedbackModalTitle` | `Send us feedback` | `Gửi phản hồi cho chúng tôi` |
| `feedbackModalSubtitle` | `Help us make tuto. Pro better. Takes 15 seconds.` | `Giúp chúng tôi cải thiện tuto. Pro. Mất 15 giây.` |
| `feedbackModalCategoryLabel` | `What's this about?` | `Vấn đề thuộc loại nào?` |
| `feedbackModalMessageLabel` | `Tell us more` | `Cho chúng tôi biết thêm` |
| `feedbackModalMessagePlaceholder` | `What happened, what you were doing, what you'd like to see…` | `Điều gì đã xảy ra, bạn đang làm gì, bạn muốn thấy gì…` |
| `feedbackModalMessageMin` | `At least 10 characters` | `Ít nhất 10 ký tự` |
| `feedbackModalSubmit` | `Send` | `Gửi` |
| `feedbackModalSubmitting` | `Sending…` | `Đang gửi…` |
| `feedbackModalSuccessTitle` | `Thanks!` | `Cảm ơn bạn!` |
| `feedbackModalSuccessSubtitle` | `We've received your feedback. You can track its status anytime.` | `Chúng tôi đã nhận được phản hồi của bạn. Bạn có thể theo dõi trạng thái bất kỳ lúc nào.` |
| `feedbackModalViewHistory` | `View my feedback` | `Xem phản hồi của tôi` |
| `feedbackModalClose` | `Close` | `Đóng` |
| `feedbackModalErrorGeneric` | `Something went wrong. Please try again.` | `Đã xảy ra lỗi. Vui lòng thử lại.` |
| `feedbackModalErrorNetwork` | `No connection. Check your network and try again.` | `Không có kết nối. Kiểm tra mạng và thử lại.` |

**Existing label tweaks (optional, only if Tarun approves):** the schema status `rejected` could be relabelled `feedbackStatusRejected: 'Considered (no action)'` / `'Đã xem xét (không hành động)'` — keeps schema, softens the word for learners. Discuss before changing.

### Auth context

The button is rendered inside `LearnLayout`, which is wrapped in the auth-protected route group. If the user is not signed in, they'll be redirected by middleware before this layout renders, so no extra auth check is needed in the button. The API endpoint enforces auth as the second line of defence.

---

## Testing Checklist

Verify each manually with `test@test.com` before declaring done.

1. **Visibility:** Floating button appears in the bottom-right corner on `/learn`, `/learn/courses`, `/learn/courses/emergency-nursing-communication`, `/learn/courses/emergency-nursing-communication/lessons/1-1`, `/learn/pairs`, `/learn/rewards`, `/learn/feedback`. Does NOT appear on `/auth/login`, `/admin/*`, or `/about`.
2. **Mobile non-overlap:** On a 360×640 viewport (iPhone SE), open the lesson player. The "Next" CTA at the bottom and the floating feedback button must both be fully tappable without one obscuring the other.
3. **Open + close:** Click button → modal slides up smoothly. Click X / backdrop / Escape key → modal closes. Reopening shows a fresh empty form (not the previous draft).
4. **Validation gate:** Type < 10 chars → submit disabled, character counter is red. Type 11 chars → submit enabled. Type > 500 chars → submit disabled, counter red.
5. **Category required:** With no category selected and a valid message, submit is disabled.
6. **Happy path submission:** Pick "Bug", type 20+ chars, click Send. Spinner appears briefly. Success panel appears. Auto-closes after 3s. Open `/learn/feedback` → the new entry appears at the top with status `pending` and `page_context` = the pathname where you submitted.
7. **Server error path:** Temporarily change the API route to return 500, retry submission. UI should show `feedbackModalErrorGeneric` message inline (not crash, not silent fail). Restore the route.
8. **i18n:** Toggle language to VI in the topbar. All modal text switches to VI versions. Switch back to EN.
9. **Build:** `npm run build` exits with 0 errors. `npx tsc --noEmit` shows no new errors vs. the pre-edit baseline (line-shift trick from Lesson 13).

---

## Guardrails

- **Don't touch** `app/admin/feedback/page.tsx`, `app/api/feedback/*`, `lib/db/feedback.ts`, `supabase/migrations/047_nursed_feedback.sql`. They're working.
- **Don't add new npm packages** without asking Tarun. Specifically: do NOT install `react-hook-form` or `yup` for this small form — `useState` + simple controlled inputs is the right tool here.
- **Don't hardcode strings** in JSX. Every user-facing string goes through `t.feedbackXxx` via `useLang()`.
- **Don't break the existing `LearnLayout` topbar** (sidebar toggle, VI translation toggle). Only add to the `<main>` content; don't restructure the flex layout.
- **Don't bake feedback-button visibility into individual pages.** It MUST live in the layout file so it persists across navigations.
- **Run `npm run build` and `npx tsc --noEmit` before declaring done.**
- **Don't auto-deploy.** Commit to `agent-x-integration`, push, then ping Tarun to promote (per Lesson 16 in the orchestrator handover). The shipping pattern is `vercel promote <id> --scope tarun-tagejas-projects --yes`.

---

## Definition of Done

The task is complete when ALL of the following are true:

1. A floating "Send feedback" button is visible in the bottom-right of every `/learn/*` page on the test account
2. Tapping it opens a bottom-sheet (mobile) or centred modal (desktop) with framer-motion animation
3. The form contains: category selector (4 options), message textarea (10-500 char), submit button — all with correct enabled/disabled states
4. Submitting POSTs to `/api/feedback` with auto-captured `pageContext` from `usePathname()`
5. On success, a thank-you panel appears and auto-closes after 3 seconds
6. The new feedback row is visible immediately at `/learn/feedback` with the correct category, message, and page context
7. The same feedback row is visible at `/admin/feedback` (sign in as a super_admin to verify) — proves backend wiring is intact
8. Modal closes cleanly via X, backdrop tap, or Escape key
9. All new strings are in `lib/i18n/translations.ts` for both `en` and `vi`
10. `npm run build` exits clean; `npx tsc --noEmit` shows no new errors
11. Lesson player CTAs on mobile are not obscured by the floating button (verified at 360×640)
12. A single commit on `agent-x-integration` with message `feat(nursed): add floating feedback button + bottom-sheet submission form (Agent V)` — push and notify Tarun to promote.

**Estimated effort:** 3-5 hours for a focused front-end agent. The DB and API are done; this is pure UI + integration.
