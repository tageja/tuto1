# 🚨 BUG-039 Critical Issue — PM Escalation

**Date:** March 20, 2026  
**Severity:** 🔴 CRITICAL  
**Impact:** Group chat creation completely blocked on mobile  
**Status:** Escalated for immediate action

---

## What's Broken

**Group chat creation fails on mobile with RLS policy violation:**

```
Error Code: 42501
Message: "new row violates row-level security policy for table \"social_conversations\""
```

When user tries to create a group chat (Tap pencil → "Tạo nhóm" → select 2+ participants → submit), the mobile app throws this error and the group is never created.

---

## Why It's Happening

This is a **Supabase Row-Level Security (RLS) policy issue** — the exact same root cause as **BUG-009** (Create post failure).

**The Problem:**
- Mobile app calls: `supabase.from('social_conversations').insert({...})` directly
- Supabase RLS policy for `social_conversations` table blocks **browser/mobile clients** from direct `INSERT`
- The policy requires **server-side authentication context** where `auth.uid()` is correctly populated by Supabase backend

**Why RLS exists:** To prevent unauthorized data modifications at the database level — a security best practice.

---

## The Solution

**Use the same pattern as BUG-009 fix** (Create Post):

### Step 1: Create Server-Side API Route
Create a new Next.js API route at: `apps/social/app/api/conversations/create-group/route.ts`

**Purpose:**
- Accept group creation request from mobile client
- Use `createSupabaseServerClient()` (server-side Supabase instance with full auth context)
- Insert into `social_conversations` with correct `auth.uid()`
- RLS will pass because the request is now server-authenticated

### Step 2: Update Mobile App
Change the group creation handler to call the new API route instead of direct Supabase insert:

```typescript
// BEFORE (fails with RLS 42501):
await supabase.from('social_conversations').insert({...})

// AFTER (succeeds with server-side auth):
await fetch('/api/conversations/create-group', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ groupName, participantIds })
})
```

---

## Reference: BUG-009 Fix Pattern

This is **identical to how BUG-009 was fixed**. For reference:

- **BUG-009:** Post creation failed with RLS 403
- **Fix:** Created `/api/posts/route.ts` to handle server-side insertion
- **Mobile:** Updated to call `fetch('/api/posts', ...)` instead of direct Supabase
- **Result:** Posts now create successfully ✅

Same approach will fix BUG-039.

---

## Immediate Next Steps

1. **Dev Agent:** Implement the server-side API route (`/api/conversations/create-group`)
2. **Dev Agent:** Update mobile group creation handler to use the new endpoint
3. **QA:** Re-test TC-071 (Group Chat Creation) after fix is deployed
4. **Verify:** Group chat appears in both users' conversation lists and messages sync

---

## Blocking Status

🔴 **TC-071 (Group Chat Creation) is BLOCKED** — cannot test until this is fixed  
🔴 **TC-072, TC-073, TC-074 (Group chat features) are BLOCKED** — depend on TC-071

---

## Questions for PM

1. Should dev agent prioritize this as P1 (before other fixes)?
2. Is the group creation logic already in mobile code, just calling Supabase incorrectly? (i.e., minimal code change needed?)
3. Should we add a similar server-side endpoint for 1:1 message sending as a preventative measure?

---

**Status:** Awaiting PM decision on fix priority and timeline.
