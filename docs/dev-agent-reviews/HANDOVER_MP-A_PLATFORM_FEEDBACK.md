# Handover — Agent MP-A — Platform Feedback (School Admin → Tuto)

> **Owning orchestrator**: Main-project orchestrator (this is `tuto/docs/dev-agent-reviews/`, not `apps/med/docs/`).
> **Scope project**: Tuto main (`apps/dashboard/` + `supabase/migrations/`). **Does not touch `apps/med/`, `src/`, or `functions/`.**

---

## 1. Mission

Give school admins a way to send product feedback (bugs, feature requests, questions, etc.) directly to Tuto's internal team from inside the school-admin dashboard. Tarun (and any future `@tutoglobal.com` admin) sees an inbox of all submissions in `/tutoadmin`, can change status (open / in progress / closed / rejected) and write a response. Both sides receive an email when something happens (Tarun on new submission; school admin on Tarun's response). The school admin sees a read-only list of their school's submissions with current status and Tarun's response.

This is **not** the existing parent ↔ school feedback feature (migration `025_feedback.sql`, table `feedbacks`). Do not modify that.

---

## 2. Scope (do this)

1. New migration `supabase/migrations/054_platform_feedback.sql` creating:
   - Table `public.platform_feedback`
   - SQL helper `public.is_tuto_admin()` returning `true` when `auth.uid()`'s row in `public.users` has `role = 'admin'`
   - RLS policies (see §6)
   - `updated_at` trigger reusing existing `public.update_updated_at_column()`
2. Three Next.js Route Handlers under `apps/dashboard/app/api/platform-feedback/`:
   - `POST  /api/platform-feedback`           — school admin creates
   - `GET   /api/platform-feedback`           — school admin lists their school's submissions
   - `GET   /api/platform-feedback/admin`     — tuto admin lists everything (paginated, filterable by status + category)
   - `GET   /api/platform-feedback/[id]`      — fetch one (school admin: only their school's; tuto admin: any)
   - `PATCH /api/platform-feedback/[id]`      — tuto admin only: update `status` and/or `admin_response`
3. Email helper at `apps/dashboard/lib/email/`:
   - `client.ts` — lazy-init Resend client reading `RESEND_API_KEY` env var (lazy init pattern is **mandatory** — Lesson #6 of orchestrator doc; never call `new Resend(...)` at module top level)
   - `send.ts` — `sendMail({ to, subject, html, text })` thin wrapper around `resend.emails.send()` that returns `{ ok: true; id } | { ok: false; error }`
   - `templates/platformFeedbackCreated.ts` — HTML + plain-text body for "New feedback from {schoolName}"
   - `templates/platformFeedbackResponded.ts` — HTML + plain-text body for "Tuto responded to your feedback"
4. School-admin UI: `apps/dashboard/app/school/[schoolId]/admin/help/page.tsx` (single page with submit form on top, "My school's submissions" list below)
5. Tuto-admin UI:
   - `apps/dashboard/app/tutoadmin/feedback/page.tsx` (inbox table with filters)
   - `apps/dashboard/app/tutoadmin/feedback/[id]/page.tsx` (detail view with status dropdown + response textarea + save button)
6. Sidebar edits:
   - `apps/dashboard/components/school/AdminSidebar.tsx` — add `{ icon: HelpCircle, label: t('helpAndSupport'), href: '/school/${encodedSchoolId}/admin/help' }` immediately above the existing `Settings` entry. **Do not rename the existing "Feedback" entry** (that's parent feedback).
   - `apps/dashboard/components/tutoadmin/TutoAdminSidebar.tsx` — add `{ icon: MessageSquare, label: 'Feedback', href: '/tutoadmin/feedback' }` between "Analytics" and "Community Moderation".
7. i18n keys (EN + VI) added to `apps/dashboard/contexts/I18nContext.tsx`. Full key list in §8.
8. Add `resend` to `apps/dashboard/package.json`:
   ```
   npm install resend -w apps/dashboard
   ```
   (Use the latest version on npm at the time of install — do not pin to a specific version unless required.)
9. Document required env vars in `apps/dashboard/.env.local.example` (create if absent) and in the PR description so Tarun can add them to Vercel:
   ```
   RESEND_API_KEY=re_xxx
   PLATFORM_FEEDBACK_FROM=Tuto Support <support@tutoglobal.com>
   PLATFORM_FEEDBACK_NOTIFY_EMAIL=tarun@tutoglobal.com
   ```
   The `RESEND_API_KEY` is created in the Resend dashboard. `PLATFORM_FEEDBACK_FROM` must use a sender on a domain that is verified in Resend (Tarun is verifying `tutoglobal.com`). Until verification completes, fall back to `onboarding@resend.dev` for local testing — flag this clearly in the PR description.

---

## 3. Out of scope (do NOT do this)

- ❌ Modifying `feedbacks`, `feedback_messages`, or migration `025_feedback.sql`. They belong to the parent↔school feature.
- ❌ Any change in `apps/med/`. That's NurseEd, different orchestrator.
- ❌ Any change in `src/` (mobile app). School admins don't currently use mobile (orchestrator §12 item #1).
- ❌ Any change in `functions/`. This feature is Supabase-only data; per orchestrator §4 practical exception, Next.js routes calling Supabase directly is acceptable here.
- ❌ Renaming the existing "Feedback" sidebar entry. Add a new one called "Help & Support".
- ❌ Database webhooks / Edge Functions. We're sending mail synchronously from the Next.js route — simpler, deterministic, easier to debug. (Tarun explicitly approved reusing the existing SMTP via `nodemailer`.)
- ❌ Threaded conversations. v1 is single response field. We can add threading in a follow-up if Tarun asks.
- ❌ File attachments.
- ❌ Touching `AuthContext.tsx` (it's load-bearing — orchestrator Lesson #9).
- ❌ Adding any new entry to the **Parent** sidebar (this is admin-only).

---

## 4. Architecture decisions (don't second-guess)

| Decision | Why |
|---|---|
| New table `platform_feedback`, not extending `feedbacks` | Different domain (school↔tuto, not parent↔school). RLS leakage between domains would be catastrophic. |
| Singular table name | Breaks visually from `feedbacks` to make grep / mental model unambiguous. |
| URL `/help` (school) and `/tutoadmin/feedback` | Avoids collision with `/admin/feedback` (parent feedback) and `/parent/feedback`. |
| Sidebar icon `HelpCircle` (school) | Distinguishes from `MessageSquare` already in use for parent feedback. |
| Resend SDK synchronous from Next.js route | Transactional-email-grade deliverability, simple SDK, single env var (`RESEND_API_KEY`), great error messages. Email is best-effort: wrap in try/catch and log on failure but don't fail the user's submit. |
| Lazy Resend client | Same Lesson #6 pattern as `lib/supabase.ts` — never call `new Resend(key)` at module top level. Use a getter that builds on first call so missing env at build time doesn't crash the bundle. |
| `is_tuto_admin()` SQL function | Tuto platform admin = `public.users.role = 'admin'`. Confirmed by orchestrator §7 + §8 (Tarun's prod row). Don't conflate with `is_admin()` (school admin). |
| `category` enum check at DB level | `('bug','feature','improvement','question','other')` — locked. UI surfaces these as a radio/select. |
| `status` enum check at DB level | `('open','in_progress','closed','rejected')` — locked. New submissions default `'open'`. |
| Best-effort email | If SMTP fails, write the row and return 201 anyway. Log the error. The school admin should never see a failed submit just because email is broken. |

---

## 5. Files & contracts

| File | Type | Purpose |
|---|---|---|
| `supabase/migrations/054_platform_feedback.sql` | new | Table, helper fn, RLS, indexes, trigger |
| `apps/dashboard/app/api/platform-feedback/route.ts` | new | `POST` create, `GET` list-mine |
| `apps/dashboard/app/api/platform-feedback/admin/route.ts` | new | `GET` tuto-admin inbox (paginated) |
| `apps/dashboard/app/api/platform-feedback/[id]/route.ts` | new | `GET` one, `PATCH` status/response |
| `apps/dashboard/lib/email/client.ts` | new | Lazy Resend client |
| `apps/dashboard/lib/email/send.ts` | new | `sendMail({ to, subject, html, text })` thin wrapper around `resend.emails.send()` |
| `apps/dashboard/lib/email/templates/platformFeedbackCreated.ts` | new | Built from feedback row + school name + submitter name |
| `apps/dashboard/lib/email/templates/platformFeedbackResponded.ts` | new | Built from feedback row + new status + admin response |
| `apps/dashboard/app/school/[schoolId]/admin/help/page.tsx` | new | Form + own-school list |
| `apps/dashboard/app/tutoadmin/feedback/page.tsx` | new | Inbox table |
| `apps/dashboard/app/tutoadmin/feedback/[id]/page.tsx` | new | Detail + respond |
| `apps/dashboard/components/school/AdminSidebar.tsx` | edit | Add "Help & Support" entry |
| `apps/dashboard/components/tutoadmin/TutoAdminSidebar.tsx` | edit | Add "Feedback" entry |
| `apps/dashboard/contexts/I18nContext.tsx` | edit | Add EN + VI keys (§8) |
| `apps/dashboard/.env.local.example` | new or edit | Document Resend + notify email env vars |
| `apps/dashboard/package.json` | edit | Add `resend` dep |

### API request/response contracts

```ts
// POST /api/platform-feedback   (auth: school_admin)
type CreateRequest = {
  schoolId: string;
  category: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
  body: string;   // 1..5000 chars, trimmed
};
type CreateResponse = { success: true; id: string } | { success: false; error: string };

// GET /api/platform-feedback?schoolId=...  (auth: school_admin)
type ListMineResponse = {
  success: true;
  data: PlatformFeedback[];
} | { success: false; error: string };

// GET /api/platform-feedback/admin?status=&category=&limit=&offset=  (auth: tuto_admin)
type AdminInboxResponse = {
  success: true;
  data: (PlatformFeedback & { school_name: string; submitter_name: string; submitter_email: string })[];
  total: number;
} | { success: false; error: string };

// GET /api/platform-feedback/[id]
type GetOneResponse = {
  success: true;
  data: PlatformFeedback & { school_name: string; submitter_name: string; submitter_email: string };
} | { success: false; error: string };

// PATCH /api/platform-feedback/[id]   (auth: tuto_admin only)
type PatchRequest = {
  status?: 'open' | 'in_progress' | 'closed' | 'rejected';
  admin_response?: string;   // 0..5000 chars
};
type PatchResponse = { success: true } | { success: false; error: string };

// Shared row shape
type PlatformFeedback = {
  id: string;
  school_id: string;
  submitted_by_user_id: string;
  category: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
  body: string;
  status: 'open' | 'in_progress' | 'closed' | 'rejected';
  admin_response: string | null;
  responded_by_user_id: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 6. DB migration — `054_platform_feedback.sql`

```sql
-- ============================================================================
-- Migration 054: Platform Feedback (School Admin → Tuto)
-- Distinct from migration 025 (Parent ↔ School feedback). Do not conflate.
-- ============================================================================

-- Helper: is the current auth.uid() a Tuto platform admin?
-- Tuto platform admin = public.users.role = 'admin'. School admin = 'school_admin'.
CREATE OR REPLACE FUNCTION public.is_tuto_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Table
CREATE TABLE IF NOT EXISTS public.platform_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  submitted_by_user_id  UUID NOT NULL REFERENCES public.users(id)   ON DELETE SET NULL,
  category              TEXT NOT NULL CHECK (category IN ('bug','feature','improvement','question','other')),
  body                  TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 5000),
  status                TEXT NOT NULL CHECK (status IN ('open','in_progress','closed','rejected')) DEFAULT 'open',
  admin_response        TEXT,
  responded_by_user_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responded_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_feedback_school_created
  ON public.platform_feedback(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status_created
  ON public.platform_feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_submitter
  ON public.platform_feedback(submitted_by_user_id, created_at DESC);

CREATE TRIGGER trg_platform_feedback_updated_at
  BEFORE UPDATE ON public.platform_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_feedback_school_admin_select ON public.platform_feedback;
DROP POLICY IF EXISTS platform_feedback_school_admin_insert ON public.platform_feedback;
DROP POLICY IF EXISTS platform_feedback_tuto_admin_all     ON public.platform_feedback;

-- School admins: SELECT any feedback for any of their schools (per Tarun: scope_of_view = all_school_admins)
CREATE POLICY platform_feedback_school_admin_select ON public.platform_feedback
  FOR SELECT
  USING ( school_id = ANY(public.get_user_school_ids()) );

-- School admins: INSERT for their school, must set submitted_by_user_id to themselves
CREATE POLICY platform_feedback_school_admin_insert ON public.platform_feedback
  FOR INSERT
  WITH CHECK (
    school_id = ANY(public.get_user_school_ids())
    AND submitted_by_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- School admins are explicitly NOT granted UPDATE/DELETE.
-- Tuto admins: full access
CREATE POLICY platform_feedback_tuto_admin_all ON public.platform_feedback
  FOR ALL
  USING (public.is_tuto_admin())
  WITH CHECK (public.is_tuto_admin());

COMMENT ON TABLE public.platform_feedback IS
  'Feedback from school admins to the Tuto platform team (bugs, feature requests, etc.). Distinct from public.feedbacks which is parent↔school.';
COMMENT ON FUNCTION public.is_tuto_admin() IS
  'TRUE when current auth.uid() is a Tuto platform admin (public.users.role = admin).';
```

**Apply via the `user-supabase-tuto` MCP server's `apply_migration` tool.** Verify with:
```sql
SELECT public.is_tuto_admin();   -- should return true when you (Tarun) are signed in
INSERT INTO public.platform_feedback (school_id, submitted_by_user_id, category, body)
  VALUES ('65498184-1615-40f4-b2b5-5267a458696c',
          (SELECT id FROM public.users WHERE auth_user_id = '<a school admin auth_user_id>'),
          'bug', 'test');   -- should fail under a school_admin's JWT unless they belong to that school
```

---

## 7. Email behaviour

### On `POST /api/platform-feedback` success
- To: `process.env.PLATFORM_FEEDBACK_NOTIFY_EMAIL` (default `tarun@tutoglobal.com`)
- Subject: `[Tuto Feedback] {category} from {schoolName}`
- Body (HTML + plain-text):
  - Submitter name + email
  - School name
  - Category (human-readable EN)
  - Full body
  - Direct link: `https://tutoglobal.com/tutoadmin/feedback/{id}`
- Failure mode: log `console.error('[platform-feedback] notify email failed', err)` and continue. Do NOT 5xx the user.

### On `PATCH /api/platform-feedback/[id]` success when status changed OR admin_response added
- To: submitter's `auth.users.email` (look up via `submitted_by_user_id` → `public.users.auth_user_id` → `auth.users.email`)
- Subject: `[Tuto] Update on your feedback`
- Body (HTML + plain-text):
  - "Hi {submitterName}, Tuto has responded to your feedback."
  - Original body excerpt (first 200 chars)
  - New status (human-readable EN + VI hint)
  - Admin response if present
  - Direct link: `https://tutoglobal.com/school/{schoolId}/admin/help`
- Failure mode: same — log and continue.

### Client (`lib/email/client.ts`)
```ts
import { Resend } from 'resend';

let _client: Resend | null = null;

export function getResend(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  _client = new Resend(key);
  return _client;
}
```
- **Never** call `getResend()` at module top level. Only inside route handlers / send functions (Lesson #6).
- Reads `process.env.PLATFORM_FEEDBACK_FROM` for the `from:` field; throws clear error if absent.

### Send wrapper (`lib/email/send.ts`)
```ts
export async function sendMail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from = process.env.PLATFORM_FEEDBACK_FROM;
  if (!from) return { ok: false, error: 'PLATFORM_FEEDBACK_FROM not set' };
  try {
    const resp = await getResend().emails.send({ from, ...args });
    if (resp.error) return { ok: false, error: resp.error.message };
    return { ok: true, id: resp.data?.id ?? '' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
```

---

## 8. i18n keys (add EN + VI to `apps/dashboard/contexts/I18nContext.tsx`)

| Key | EN | VI |
|---|---|---|
| `helpAndSupport` | Help & Support | Trợ giúp & Hỗ trợ |
| `helpSupport.title` | Help & Support | Trợ giúp & Hỗ trợ |
| `helpSupport.subtitle` | Send feedback, report bugs, or request features. | Gửi phản hồi, báo lỗi hoặc đề xuất tính năng. |
| `helpSupport.form.category` | Category | Danh mục |
| `helpSupport.form.body` | Your message | Nội dung |
| `helpSupport.form.bodyPlaceholder` | Describe what's happening, what you'd like to see, or any question you have… | Mô tả vấn đề, đề xuất hoặc câu hỏi của bạn… |
| `helpSupport.form.submit` | Send to Tuto | Gửi cho Tuto |
| `helpSupport.form.submitting` | Sending… | Đang gửi… |
| `helpSupport.form.success` | Thanks — we got it. We'll reply by email. | Cảm ơn — chúng tôi đã nhận được. Sẽ phản hồi qua email. |
| `helpSupport.form.error` | Couldn't send. Please try again. | Không gửi được. Vui lòng thử lại. |
| `helpSupport.list.title` | Your school's submissions | Phản hồi đã gửi |
| `helpSupport.list.empty` | No submissions yet. | Chưa có phản hồi nào. |
| `helpSupport.list.submittedBy` | Submitted by {name} | Gửi bởi {name} |
| `helpSupport.list.tutoResponse` | Tuto's response | Phản hồi từ Tuto |
| `helpSupport.category.bug` | Bug / Something broken | Lỗi / Sự cố |
| `helpSupport.category.feature` | Feature request | Đề xuất tính năng |
| `helpSupport.category.improvement` | Improvement | Cải tiến |
| `helpSupport.category.question` | Question | Câu hỏi |
| `helpSupport.category.other` | Other | Khác |
| `helpSupport.status.open` | Open | Mới |
| `helpSupport.status.in_progress` | In progress | Đang xử lý |
| `helpSupport.status.closed` | Closed | Đã đóng |
| `helpSupport.status.rejected` | Rejected | Từ chối |

(Tutoadmin pages can use plain English strings directly — no need for VI translations on internal-only routes per existing precedent in `TutoAdminSidebar.tsx`.)

---

## 9. UI specifics

### School-admin page `/school/[schoolId]/admin/help`
- Page wrapper: same `p-6 space-y-6` pattern + `Card` components used by `app/school/[schoolId]/admin/feedback/page.tsx`
- Top section: form (`<Card>`):
  - Heading `t('helpSupport.title')` + subtitle
  - Category select (5 options)
  - Body textarea (min 1 / max 5000 chars; show counter)
  - Submit button (uses existing `Button` component, `bg-primary`)
  - On success: clear form, show inline success message for 4s, refetch list
- Bottom section: list (`<Card>` per item):
  - Each row: created_at (relative), category badge (color-coded similar to existing FeedbackItem), status badge, body excerpt (first 200 chars), submitter name (non-self submissions, since other school admins of this school can also see)
  - Click expands to show full body + Tuto's response (if any) + responded_at
  - Empty state mirroring existing pattern

### Tutoadmin inbox `/tutoadmin/feedback`
- Page wrapper similar to `/tutoadmin/schools/page.tsx`
- Filters: status (5 options incl "All"), category (6 options incl "All"), school (typeahead — optional, can defer)
- Table columns: Created, School, Submitter, Category, Status, Body excerpt → row click → detail page
- Sort: newest first, server-side via `created_at DESC`

### Tutoadmin detail `/tutoadmin/feedback/[id]`
- Top: meta block (school, submitter name + email, created_at, current category)
- Middle: full body (read-only)
- Bottom: response form
  - Status select (4 options)
  - Response textarea (max 5000)
  - "Save & notify submitter" button → `PATCH` → on success show toast and redirect to inbox
- "Back to inbox" link top-left

---

## 10. Translation keys gotchas

`apps/dashboard/contexts/I18nContext.tsx` already manages translations. Open the file, locate the EN object and VI object, and add the keys from §8 in alphabetical position. **Both languages must be present** — no `?? key` fallbacks (orchestrator §10 — VN customer base).

---

## 11. Definition of Done

- [ ] Migration `054_platform_feedback.sql` applied on production Supabase via the `user-supabase-tuto` MCP server's `apply_migration` tool. Verify table + helper exist.
- [ ] `cd apps/dashboard && npm run build` passes locally with no new errors.
- [ ] `cd apps/dashboard && npx tsc --noEmit` shows **the same ~15 pre-existing errors** in `.next-web/types/`, no new ones (orchestrator §12 item #6).
- [ ] All EN + VI keys present in `I18nContext.tsx`.
- [ ] Sidebar entries appear in correct order on both `AdminSidebar` and `TutoAdminSidebar`.
- [ ] Existing parent-feedback page at `/school/[schoolId]/admin/feedback` continues to work (regression check).
- [ ] Tuto admin can see new feedback in `/tutoadmin/feedback` and update it.
- [ ] School admin from a different school **cannot** see another school's feedback (RLS check — verify by signing in as `nhule@empowerenglish.edu.vn` after creating a row under another school via SQL).
- [ ] School admin **cannot** PATCH (RLS check — try `UPDATE platform_feedback SET status = 'closed'` from school-admin JWT in SQL editor → expect 0 rows updated).
- [ ] Email notification received at `tarun@tutoglobal.com` on test submission (Tarun must add `RESEND_API_KEY` + `PLATFORM_FEEDBACK_FROM` + `PLATFORM_FEEDBACK_NOTIFY_EMAIL` to Vercel + local before this works — flag clearly in PR).
- [ ] Email notification received at submitter's address on test PATCH.
- [ ] Verify `tutoglobal.com` is in `verified` state in the Resend dashboard before testing on prod sender; otherwise temporarily set `PLATFORM_FEEDBACK_FROM=onboarding@resend.dev` for the build/test cycle.
- [ ] No direct Airtable calls anywhere in the diff (orchestrator §4).
- [ ] Sidebar additions look correct on Vercel preview URL on both 1280px and 360px widths.
- [ ] PR description lists the 3 env vars Tarun needs to add to Vercel (`RESEND_API_KEY`, `PLATFORM_FEEDBACK_FROM`, `PLATFORM_FEEDBACK_NOTIFY_EMAIL`).

---

## 12. Dependencies on other agents

None. This agent ships standalone.

---

## 13. Pre-start checklist for Tarun

Before kicking off the agent, you (Tarun) must:

1. Sign up at https://resend.com and add `tutoglobal.com` as a verified domain (3 DNS records, ~10 min). Generate an API key in Resend → API Keys.
2. Add to Vercel project `tuto` env vars (Production + Preview + Development) and to `apps/dashboard/.env.local`:
   - `RESEND_API_KEY=re_...`
   - `PLATFORM_FEEDBACK_FROM=Tuto Support <support@tutoglobal.com>` (must be on the verified domain)
   - `PLATFORM_FEEDBACK_NOTIFY_EMAIL=tarun@tutoglobal.com`
3. Approve the URL choice `/school/[schoolId]/admin/help` and the sidebar label "Help & Support". If you'd prefer something else (e.g. "Send Feedback to Tuto", "Contact Tuto", "Support"), say so before agent starts.

---

## 14. Notes for the orchestrator (post-merge)

- Add a row to orchestrator §9 ("Customer-Facing Issues — Recently Fixed" / new feature ledger if separate).
- Add MP-A row to the agent letter table in orchestrator §11.
- Append handover-history entry in orchestrator §16.
- Add `platform_feedback` and `is_tuto_admin()` to `docs/DATA_DICTIONARY.md` under a new "Platform Support" section.
