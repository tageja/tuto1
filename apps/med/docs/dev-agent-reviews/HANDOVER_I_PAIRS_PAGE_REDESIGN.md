# Dev Agent Handover — Feature I: Practice Groups Page Audit & Redesign

## Your role

You are a **Senior Product Engineer & UX Designer** responsible for auditing the existing `/learn/pairs` page, brainstorming the ideal experience within the project's scope, and implementing the redesigned page. You think in terms of user journeys, learning workflows, and motivation loops — not just UI components.

**Skills you must apply:**

- **Product thinking** (user flows, information architecture, progressive disclosure, empty states, success states)
- **UX design for learning products** (collaborative practice patterns, motivation loops, social proof, progress visibility)
- **TypeScript + React** (state management, data fetching, optimistic updates)
- **Next.js App Router** (client components, route handlers, data loading patterns)
- **Supabase** (Postgres queries, RLS, real-time subscriptions via polling)
- **Responsive design** (mobile-first, touch-friendly interactions)
- **Accessibility** (screen readers, keyboard navigation, ARIA attributes)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. The pedagogical framework uses four stages per module:

| Lessons | Stage | What happens |
|---------|-------|-------------|
| 1–2 | `heads_up` | Language exposure (listen, read) |
| 3–5 | `heads_down` | Controlled practice (record, cloze, quiz) |
| 6–7 | `heads_together` | **Pair/group practice** — record, review peers |
| 8 | `assessment` | Exam + self-reflection |

**The pairs page is the hub for `heads_together` — collaborative practice.** It's currently a bare-bones prototype with 3 disconnected features. Your job is to turn it into a cohesive, purposeful experience.

---

## Current state audit — what exists today

### The page (`apps/med/app/learn/pairs/page.tsx`)

The current page has 4 sections stacked vertically:

1. **Explanation banner** — one-liner about practicing with colleagues
2. **Create group** — name input + submit → gets a join code
3. **Join group** — enter code + submit → joins existing group
4. **Upload recording** — file picker + submit → uploads to Supabase Storage (but NOT linked to any group or lesson)
5. **Active groups list** — shows all active groups with join codes and member count

### What's wrong with it

| Problem | Details |
|---------|---------|
| **Disconnected upload** | The recording upload (section 4) is not linked to any group, lesson, or step. It just uploads a file to storage and shows "success." The file has no context. |
| **No group detail** | Clicking on a group does nothing — it's a static card. No way to see who's in the group, their recordings, or activity. |
| **No connection to lessons** | The page doesn't show which lessons require group practice, which recordings are pending, or any module progress. |
| **`userId: 'guest'` on join** | The join API call hardcodes `userId: 'guest'` instead of using the authenticated user (line 78). |
| **No peer review** | The page has no way to listen to group members' recordings or rate them — even though `PeerRecordingsPanel` and `PeerRatingWidget` components already exist. |
| **No visual connection to learning** | No mention of which module/lesson the learner is in, what they need to practice, or how this fits into their learning path. |
| **No member list** | Groups show `max_size` but not current member count or member names. |
| **No progress indicators** | No way to see: "You've recorded 2/5 steps, reviewed 1/5 peers." |

---

## Backend infrastructure that ALREADY EXISTS

This is the key insight: **most of the backend is already built.** The page just doesn't use it.

### Database tables

| Table | Purpose | Status |
|-------|---------|--------|
| `nursed_pair_groups` | Groups with join codes, max size | Working |
| `nursed_pair_members` | User ↔ group membership | Working |
| `nursed_pair_sessions` | Session records per group + lesson (recording_path, status) | Exists but **not wired** |
| `nursed_submissions` | Per-step recording submissions with `storage_path` and `pair_session_id` | Working |
| `nursed_peer_reviews` | 1–5 star ratings on peer submissions | Working (migration 045) |

### API routes

| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/pairs` | GET | List active groups (with members) | Working |
| `/api/pairs` | POST | Create group / join group | Working (but join uses `userId: 'guest'`) |
| `/api/peer-recordings` | GET | Get group members' recordings for a step | **Working** — unused by pairs page |
| `/api/peer-reviews` | GET | Get reviews by reviewer for a step | **Working** — unused by pairs page |
| `/api/peer-reviews` | POST | Submit 1–5 rating for a peer's recording | **Working** — unused by pairs page |
| `/api/module-progress` | GET | Check recording + review completion per module | **Working** — used by `ModuleGateBanner` |
| `/api/assets/upload` | POST | Upload audio file to Supabase Storage | Working |
| `/api/submissions` | POST | Save recording submission | Working |

### UI components already built

| Component | File | What it does | Used by pairs page? |
|-----------|------|-------------|-------------------|
| `PeerRecordingsPanel` | `components/learn/steps/PeerRecordingsPanel.tsx` | Lists group members' recordings with playback + rating widget | **NO** |
| `PeerRatingWidget` | `components/learn/steps/PeerRatingWidget.tsx` | 1–5 star rating with submit | **NO** |
| `ModuleGateBanner` | `components/learn/ModuleGateBanner.tsx` | Shows recording/review progress per module | **NO** |
| `RecordingStep` | `components/learn/steps/RecordingStep.tsx` | Browser-based audio recording with rubric | **NO** |

### DB helper functions (`lib/db/peer-reviews.ts`)

| Function | Purpose |
|----------|---------|
| `getUserPairGroupId(userId)` | Get user's active group |
| `getGroupMemberIds(pairGroupId)` | Get all member user IDs |
| `getGroupRecordingsForStep(pairGroupId, stepId, currentUserId)` | Get peer recordings with review status |
| `createPeerReview(reviewerId, submissionId, rating)` | Submit a rating (validates same group, not self) |
| `getPeerReviewsByReviewer(reviewerId, stepId)` | Get reviews the user has given |
| `getModulePeerReviewStatus(userId, moduleId)` | Check all recording_submit steps: has recording? has review? → gate open/closed |

---

## Your task: brainstorm, design, and implement

### Phase 1: Brainstorm (do this FIRST, document your thinking)

Before writing code, answer these questions in a brief analysis section at the top of any implementation PR or notes:

1. **Who is the learner on this page?** A Vietnamese nurse who may be practicing alone or with 1–2 colleagues from the same hospital. They've been assigned a course by their hospital admin.

2. **What are they trying to do?**
   - Find or create their practice group
   - See what recordings they need to submit (which lessons/steps)
   - Listen to their groupmates' recordings
   - Rate those recordings
   - Track their progress toward completing the module

3. **What's the ideal user journey?**
   - First visit: onboarding → create or join group → see "what's next"
   - Returning visit: see group activity, pending tasks, listen & review
   - After completing all tasks: see celebration, ready for next module

4. **What information density is right?** The page should show:
   - Group status (members, join code for sharing)
   - Module-level progress (which modules need group practice)
   - Per-step status (recorded? reviewed?)
   - Recent activity (who uploaded what, when)

5. **What should NOT be on this page?** Don't duplicate what's already in the lesson player. The recording and reviewing of individual steps happens inside lessons via `RecordingStep` + `PeerRecordingsPanel`. This page is the **dashboard/hub** — it shows status, progress, and gets you to the right lesson.

### Phase 2: Design the ideal page layout

Based on your brainstorming, design a page with these sections (adjust as you see fit):

**Section A — Group Status (top)**
- If no group: onboarding flow (create or join)
- If in a group: group card with name, member avatars/names, join code (shareable), "Leave group" option
- Member online/activity indicators (optional for MVP)

**Section B — Module Practice Progress (main content)**
- For each module that has `recording_submit` steps:
  - Module title
  - Per-step checklist: step title | your recording (done/pending) | peer review (done/pending)
  - Link to the lesson that contains each step
  - Module gate status (open/locked)

**Section C — Group Activity Feed (secondary)**
- Recent recordings from group members
- "Listen & Rate" CTA for recordings you haven't reviewed
- Shows who uploaded what, when

**Section D — Quick Actions**
- "Go to current lesson" — deep link to the first incomplete recording step
- "Invite classmate" — copy join code

### Phase 3: Implement

Build the redesigned page using existing backend infrastructure. You should NOT need to create new API routes for MVP — the existing ones (`/api/pairs`, `/api/peer-recordings`, `/api/peer-reviews`, `/api/module-progress`) provide everything you need.

---

## Critical constraints and guardrails

### DO

- **Brainstorm first** — document your thinking before coding
- **Reuse existing components**: `PeerRecordingsPanel`, `PeerRatingWidget`, `ModuleGateBanner`
- **Reuse existing API routes** — don't create new ones unless the existing ones don't cover a specific need
- **Reuse existing DB helpers** in `lib/db/peer-reviews.ts` and `lib/db/hospitals.ts`
- **Fix the `userId: 'guest'` bug** — use `useAuth()` for the join action
- **Add all UI text** to `lib/i18n/translations.ts` in both EN and VI
- **Show progress** — learners need to see "3 of 5 recordings done, 2 of 5 reviews done"
- **Link to lessons** — each incomplete task should link to the specific lesson
- **Handle empty states** — no group, no members, no recordings, no modules with practice
- **Handle auth states** — logged in vs guest (when `AUTH_DISABLED=true`)
- **Make it responsive** — mobile is a primary use case for nurses on breaks
- Follow existing design patterns: `card`, `btn-primary`, `btn-secondary`, `badge`, `section-title` CSS classes

### DO NOT

- Do NOT rebuild the recording UI — that's `RecordingStep` in the lesson player
- Do NOT rebuild the peer review UI — that's `PeerRecordingsPanel` + `PeerRatingWidget`
- Do NOT modify the lesson player or step components
- Do NOT change the database schema (tables already exist and work)
- Do NOT modify API routes (they work correctly)
- Do NOT install new libraries
- Do NOT hardcode strings in JSX — use the translation system
- Do NOT create documentation files unless asked
- Do NOT modify Firebase Functions or mobile app code
- Do NOT over-engineer — this is MVP. Simple polling is fine; no WebSocket/realtime needed

### Information architecture principle

The pairs page is a **dashboard/hub**, NOT a place where recording or reviewing happens. It answers:
- "What group am I in?"
- "What do I still need to do?"
- "How are my groupmates doing?"
- "Where do I go next?"

It links OUT to lessons where the actual work happens.

---

## Files you must read first

| File | Why | Priority |
|------|-----|----------|
| `apps/med/app/learn/pairs/page.tsx` | Current page — your starting point | HIGH |
| `apps/med/components/learn/steps/PeerRecordingsPanel.tsx` | Existing peer recording list + rating — reuse or embed | HIGH |
| `apps/med/components/learn/steps/PeerRatingWidget.tsx` | Star rating widget — reuse | HIGH |
| `apps/med/components/learn/ModuleGateBanner.tsx` | Module gate progress — reuse or adapt | HIGH |
| `apps/med/lib/db/peer-reviews.ts` | All peer review DB helpers — your data layer | HIGH |
| `apps/med/lib/db/hospitals.ts` | Group CRUD helpers | HIGH |
| `apps/med/app/api/pairs/route.ts` | Groups API | MEDIUM |
| `apps/med/app/api/peer-recordings/route.ts` | Peer recordings API | MEDIUM |
| `apps/med/app/api/peer-reviews/route.ts` | Peer reviews API | MEDIUM |
| `apps/med/app/api/module-progress/route.ts` | Module gate API | MEDIUM |
| `apps/med/lib/supabase.ts` | TypeScript types (NursedPairGroup, NursedPeerReview, NursedSubmission) | MEDIUM |
| `apps/med/components/learn/steps/RecordingStep.tsx` | Recording component — understand how recordings are created | LOW |
| `apps/med/docs/COURSE_ARCHITECTURE.md` | Which lessons have recording_submit steps | LOW |
| `supabase/migrations/041_nursed_schema.sql` | Pair tables schema | LOW |
| `supabase/migrations/045_nursed_peer_reviews.sql` | Peer reviews schema + RLS | LOW |
| `apps/med/lib/i18n/translations.ts` | Translation keys — add new ones here | LOW |

---

## Existing translation keys you can reuse

```
pairsTitle, pairsSubtitle, pairsBannerTitle, pairsBannerDesc
createGroupTitle, joinGroupTitle, joinCodeLabel, shareCodeHint
groupsSectionTitle, emptyGroups, groupMaxMembers, groupNameUnnamed
groupStatusActive, groupStatusInactive
uploadSessionTitle, uploadSessionDesc
peerRecordingsTitle, peerRecordingsSubtitle, peerRecordingsEmpty
peerRecordingsNotInGroup, peerRecordingsGoToGroups, peerRecordingsRefresh
peerRecordingBy, peerRecordingAnonymous, peerRatingLabel
peerRatingSubmitted, peerRatingUpdated, peerRatingError
moduleGateTitle, moduleGateDesc, moduleGateComplete
moduleGateRecordingDone, moduleGateReviewDone
moduleGateRecordingNeeded, moduleGateReviewNeeded
```

---

## Example ideal user journey (for reference)

### First-time learner (no group)

1. Opens `/learn/pairs`
2. Sees onboarding: "Practice with your classmates" explainer
3. Two options: Create group (gets a code) or Join group (enter code)
4. After creating: sees group card with name, code to share, "0 members"
5. Below: "No practice tasks yet — complete more lessons to unlock group practice"

### Active learner (in a group, mid-module)

1. Opens `/learn/pairs`
2. **Group card** at top: "Team Nguyen" — 3 members — code `ABC123`
3. **Module 1 progress**:
   - Lesson 5: Recording ✅ | Peer review ❌ → "Listen & rate" link
   - Lesson 6: Recording ❌ | Peer review ❌ → "Go to lesson" link
   - Lesson 7: Recording ❌ | Peer review ❌ → locked (complete L6 first)
   - Lesson 8: Recording ❌ | Peer review ❌ → locked
4. **Recent activity**: "Linh uploaded a recording for Lesson 5 · 2h ago"
5. **Quick action**: "Next: Record for Lesson 6" → links to lesson

### Completed learner (all done for module)

1. Opens `/learn/pairs`
2. **Module 1**: All green checkmarks, gate open banner
3. **Module 2**: Not started yet → "Start Module 2"

---

## Deliverable

A redesigned `/learn/pairs` page that:
- Shows the learner's group with members and shareable code
- Displays module-level practice progress (recordings + reviews)
- Links directly to lessons where practice is needed
- Handles all states (no group, no tasks, in progress, complete)
- Uses existing backend APIs and UI components
- All text in EN + VI translations
- Mobile-responsive and accessible
- Fixes the `userId: 'guest'` join bug
