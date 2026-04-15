# Dev Agent Handover — Feature J: Authentication Flow Investigation & Fix

## Your role

You are a **Senior Full-Stack Security Engineer** specializing in authentication flows, OAuth, and Supabase Auth. Your job is to audit the entire auth pipeline end-to-end, identify why users are being redirected to the wrong domain after login, and fix it.

**Skills you must apply:**

- **Supabase Auth** (magic link / OTP, OAuth providers, PKCE flow, Site URL, redirect allowlist, email templates)
- **Next.js App Router** (route handlers, middleware, cookies, `NextResponse.redirect`)
- **OAuth 2.0** (Google OAuth, redirect URIs, consent screen, callback flow)
- **DNS / Domains** (understanding of `tutoglobal.com` vs `med.tuto.asia`, Vercel deployment domains)
- **Email deliverability** (magic link email templates, link construction by Supabase)
- **TypeScript** (strict typing, async patterns, error handling)
- **Browser security** (cookies, CORS, origin validation, `window.location.origin`)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app deployed to **`med.tuto.asia`** via Vercel. It uses **Supabase Auth** for authentication with three methods:
1. **Email + password** (register page)
2. **Magic link** (login page — passwordless email OTP)
3. **Google OAuth** (login page — "Continue with Google")

The app is part of a monorepo that also includes a parent platform at `tutoglobal.com`. The NurseEd app should be completely independent auth-wise — users log in at `med.tuto.asia` and stay on `med.tuto.asia`.

---

## The bug (with screenshots)

### What the user experiences:

1. User goes to `localhost:3001/auth/login` (or `med.tuto.asia/auth/login`)
2. Enters email, clicks "Send magic link" (Gửi magic link)
3. Confirmation screen shows: "Check your email" (Kiểm tra email của bạn)
4. User receives email from `support@tutoglobal.com` with subject "Your Magic Link"
5. User clicks "Log In" link in the email
6. **BUG**: Instead of being redirected to `med.tuto.asia/auth/callback`, user lands on **`tutoglobal.com`** — the parent platform homepage

The same issue happens with Google OAuth — after Google consent, the user is redirected to `tutoglobal.com` instead of `med.tuto.asia`.

### Screenshots (saved in workspace):

| Screenshot | Description | File |
|------------|-------------|------|
| Login page | Magic link tab with email input | `assets/image-d5eeb7ca-4175-4bb8-8e31-571840c1ef9a.png` |
| Email sent | Confirmation "Check your email" | `assets/image-3f72c5aa-c5cd-4f5a-8633-07a45e45e65a.png` |
| Magic link email | Email from `support@tutoglobal.com` with "Log In" button | `assets/image-613541f0-a0cb-479b-9257-4ad84658605a.png` |
| Wrong redirect | Lands on `tutoglobal.com` instead of `med.tuto.asia` | `assets/image-b12c1969-74c9-4d5a-8eba-fa72432b81aa.png` |

**To view these screenshots**: Read the image files at these paths inside `C:\Users\Admin\.cursor\projects\c-Users-Admin-tuto/assets/`.

---

## Root cause analysis (hypotheses to investigate)

### Hypothesis 1: Supabase Site URL set to `tutoglobal.com` (MOST LIKELY)

In the **Supabase Dashboard → Authentication → URL Configuration**, the **Site URL** is likely set to `https://tutoglobal.com` instead of `https://med.tuto.asia`.

When Supabase sends a magic link email, it constructs the link URL using:
- The project's **Site URL** as the default base
- The `emailRedirectTo` passed in the API call (if it's in the redirect allowlist)

If `med.tuto.asia` is **not** in the redirect allowlist, Supabase falls back to the Site URL — which would be `tutoglobal.com`.

**Evidence from email screenshot**: The email sender is `support@tutoglobal.com`, confirming this Supabase project is configured for `tutoglobal.com`.

### Hypothesis 2: Redirect allowlist missing `med.tuto.asia`

Even if the code passes `emailRedirectTo: 'https://med.tuto.asia/auth/callback'`, Supabase will **silently ignore** it if `med.tuto.asia` is not in the **Redirect URLs** allowlist in the Supabase Dashboard.

The test instructions mention this should be configured:
```
http://localhost:3001/auth/callback
https://med.tuto.asia/auth/callback
```

But it may not have been done, or may have been overwritten.

### Hypothesis 3: Google OAuth redirect URI misconfigured

In the **Google Cloud Console → Credentials → OAuth 2.0 Client**, the authorized redirect URIs may only include `tutoglobal.com` URLs. For Supabase OAuth, the redirect URI should be the **Supabase project URL** (e.g., `https://xxx.supabase.co/auth/v1/callback`), not the app URL directly. But if the Supabase project's Site URL is wrong, the final hop back to the app will go to the wrong domain.

### Hypothesis 4: Shared Supabase project between `tutoglobal.com` and `med.tuto.asia`

The NurseEd app may be sharing a Supabase project with the parent `tutoglobal.com` platform. If so, the Site URL in the shared project is set to `tutoglobal.com`, and the magic link/OAuth flows default to that domain.

**Fix options**:
- A) Add `med.tuto.asia` to the redirect allowlist and ensure the code passes the correct `emailRedirectTo`
- B) Create a separate Supabase project for `med.tuto.asia` (cleaner but more work)

### Hypothesis 5: `window.location.origin` is wrong at time of call

If the user somehow initiates login from a different origin (e.g., they're on `tutoglobal.com` and click a link to NurseEd login), `window.location.origin` could be wrong. However, the screenshots show `localhost:3001` in the address bar, so this is unlikely for local dev — but could be an issue in production.

---

## Current auth code (what the codebase does)

### Login page (`app/auth/login/page.tsx`)

**Google OAuth** (line 63–67):
```typescript
const { error: authError } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
  },
})
```

**Magic link** (line 81–85):
```typescript
const { error: authError } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
  },
})
```

Both use `window.location.origin` — which is correct in principle. The bug is that Supabase's server-side email construction ignores this if the URL isn't in the allowlist.

### Register page (`app/auth/register/page.tsx`)

```typescript
const { error: authError } = await supabase.auth.signUp({
  email, password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: { full_name: fullName, role: 'learner', hospital_id: resolvedHospitalId },
  },
})
```

Same pattern — `window.location.origin` + `/auth/callback`.

### Callback route (`app/auth/callback/route.ts`)

```typescript
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/learn/courses'
  // ... exchange code for session ...
  return NextResponse.redirect(`${origin}${next}`)
}
```

Uses `origin` from the incoming request URL. If the user arrives at this callback on `med.tuto.asia`, the redirect will be correct. **The problem is they never reach this callback** — Supabase redirects them to `tutoglobal.com` first.

### Middleware (`middleware.ts`)

- Protects `/learn/**` and `/admin/**` routes
- Redirects unauthenticated users to `/auth/login`
- `AUTH_DISABLED=true` bypass exists for testing
- Matcher excludes `/auth/callback` and `/api/` routes

### Supabase client (`lib/supabase.ts`)

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

No hardcoded URLs. No auth redirect configuration in the client setup.

### Auth context (`contexts/AuthContext.tsx`)

- Loads user via `supabase.auth.getUser()` + `onAuthStateChange`
- `signOut` → `window.location.href = '/auth/login'`
- No redirect URL configuration

---

## What you need to investigate and fix

### Step 1: Check Supabase Dashboard configuration (CRITICAL)

You cannot do this via code — this requires access to the **Supabase Dashboard**. Check:

1. **Authentication → URL Configuration → Site URL**: Should be `https://med.tuto.asia` (not `https://tutoglobal.com`)
2. **Authentication → URL Configuration → Redirect URLs**: Must include:
   - `http://localhost:3001/auth/callback`
   - `https://med.tuto.asia/auth/callback`
   - `https://med.tuto.asia/**` (wildcard for all paths)
3. **Authentication → Email Templates → Magic Link**: Check the email template — does it use `{{ .SiteURL }}` or `{{ .RedirectTo }}`? The link in the email must point to `med.tuto.asia`, not `tutoglobal.com`.
4. **Authentication → Providers → Google**: Check the OAuth configuration — client ID, client secret, and that the callback URL is correct.

**IMPORTANT — The Supabase project is shared with `tutoglobal.com`.** The product owner does NOT want a separate Supabase project or separate auth system for NurseEd. The fix must keep the shared project and simply ensure that users who log in on `med.tuto.asia` stay on `med.tuto.asia` after auth completes. The correct approach is:
- Add `https://med.tuto.asia/auth/callback` and `http://localhost:3001/auth/callback` to the **Redirect URLs allowlist** in Supabase Dashboard
- Ensure the code always passes the correct `emailRedirectTo` / `redirectTo` so Supabase honors it
- Do NOT change the Site URL if it would break `tutoglobal.com`
- Do NOT create a separate Supabase project

### Step 2: Check Google Cloud Console

If Google OAuth also redirects to the wrong domain:

1. **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client**
2. Check **Authorized redirect URIs** — must include the Supabase callback:
   `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
3. Check **Authorized JavaScript origins** — should include `https://med.tuto.asia` and `http://localhost:3001`

### Step 3: Fix the email sender

The magic link email comes from `support@tutoglobal.com`. If NurseEd should have its own branding:
- **Supabase Dashboard → Authentication → Email Templates**: Customize sender name and email
- Or configure a custom SMTP server for NurseEd

### Step 4: Code hardening (optional but recommended)

Even after fixing the Supabase config, consider hardening the code:

```typescript
// Instead of relying solely on window.location.origin:
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin

// Use in OAuth/magic link calls:
redirectTo: `${SITE_URL}/auth/callback?next=...`
emailRedirectTo: `${SITE_URL}/auth/callback?next=...`
```

Add `NEXT_PUBLIC_SITE_URL=https://med.tuto.asia` to `.env.local` (and Vercel env vars).

This ensures the redirect URL is always correct regardless of how the user arrived at the login page.

### Step 5: Verify end-to-end

After fixing, test all three auth flows:
1. **Magic link**: Send link → receive email → click → land on `med.tuto.asia/auth/callback` → redirect to `/learn/courses`
2. **Google OAuth**: Click "Continue with Google" → Google consent → redirect to Supabase → redirect to `med.tuto.asia/auth/callback` → redirect to `/learn/courses`
3. **Email + password**: Register → confirm email → login → protected routes accessible

Test in both:
- Local dev (`http://localhost:3001`)
- Production (`https://med.tuto.asia`)

---

## Critical constraints and guardrails

### DO

- **Check the Supabase Dashboard FIRST** — this is almost certainly a configuration issue, not a code bug
- **Document all Supabase Dashboard changes** you make (before/after values)
- **Test all three auth methods** (magic link, Google, email+password) after any change
- **Add `NEXT_PUBLIC_SITE_URL`** to the codebase as a hardened fallback
- **Check email templates** — the magic link email should clearly identify NurseEd, not tutoglobal
- **Preserve the `AUTH_DISABLED` bypass** for testing
- **Update `.env.local` documentation** in `TEST_AGENT_INSTRUCTIONS.md` if you add new env vars
- **Add all new UI text** to `lib/i18n/translations.ts` (EN + VI) if you change any user-facing strings

### DO NOT

- Do NOT create a new Supabase project — the shared project is intentional
- Do NOT change the Supabase project Site URL — `tutoglobal.com` depends on it. Fix this by adding `med.tuto.asia` to the redirect allowlist instead
- Do NOT build separate login/signup logic — the existing auth pages and callback route are correct in design; the issue is Supabase Dashboard configuration
- Do NOT expose any API keys, service role keys, or OAuth secrets in client-side code
- Do NOT modify the database schema — this is an auth configuration issue
- Do NOT remove the `AUTH_DISABLED` bypass
- Do NOT modify Firebase Functions or mobile app code
- Do NOT create documentation files unless asked

### Security reminders

- `SUPABASE_SERVICE_ROLE_KEY` is used in the callback route for profile upsert — keep server-only
- OAuth client secrets must never be in client-side code (they're in Supabase Dashboard)
- The callback route is excluded from middleware matching (`auth/callback`) — this must stay excluded for PKCE to work
- Validate that the `next` query param in callbacks is a relative path (prevent open redirect)

---

## Files you must read

| File | Why | Priority |
|------|-----|----------|
| `apps/med/app/auth/login/page.tsx` | Magic link + Google OAuth trigger with redirect URLs | HIGH |
| `apps/med/app/auth/register/page.tsx` | Email signup with redirect URL | HIGH |
| `apps/med/app/auth/callback/route.ts` | PKCE callback — where code is exchanged and redirect happens | HIGH |
| `apps/med/middleware.ts` | Route protection and auth bypass | HIGH |
| `apps/med/lib/supabase.ts` | Client creation — check for redirect config | MEDIUM |
| `apps/med/lib/supabase-server.ts` | Server client creation | MEDIUM |
| `apps/med/contexts/AuthContext.tsx` | Client-side auth state | MEDIUM |
| `apps/med/app/layout.tsx` | `NEXT_PUBLIC_APP_URL` usage for `metadataBase` | LOW |
| `apps/med/next.config.ts` | Domain/URL config | LOW |
| `apps/med/tests/TEST_AGENT_INSTRUCTIONS.md` | Documents expected Supabase redirect URL config | LOW |

---

## Supabase MCP tools available

You have access to Supabase MCP tools in this workspace. Check the MCP tool descriptors at:
- `mcps/user-supabase-oioi/tools/`
- `mcps/user-supabase-tuto/tools/`

These may allow you to query or modify Supabase project settings programmatically. **Read the tool schemas before using them.**

---

## Deliverable

A fully working auth flow where:
- Magic link emails redirect to `med.tuto.asia/auth/callback` (or `localhost:3001` in dev)
- Google OAuth redirects to `med.tuto.asia/auth/callback` (or `localhost:3001` in dev)
- Email + password login works and redirects to `/learn/courses`
- The code uses `NEXT_PUBLIC_SITE_URL` as a hardened fallback for redirect URLs
- All Supabase Dashboard changes are documented
- Email sender/template reflects NurseEd branding (not tutoglobal)
