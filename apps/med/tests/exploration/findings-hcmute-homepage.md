# HCMUTE Pilot Homepage — Phase 0 Exploration Findings

**Date:** 2026-05-21  
**URL:** http://localhost:3001/  
**Branch:** agent-x-integration  
**Explorer:** QA Agent (browser + code review)

## Summary

The homepage ships the HCMUTE pilot funnel (hero CTA, scarcity badge, enrollment modal, course paths, footer anchors) with working API integration. Core flows are testable with mocked `/api/pilot-spots`. Several i18n gaps and a React hydration warning were observed; enrollment validation was missing before this QA pass (addressed in code).

---

## Page structure (top → bottom)

1. **LandingNav** — logo, courses/dashboard/about, EN|VI toggle, admin, Start Learning
2. **Hero** — badge, H1, subtitle, pilot CTA, live course link, nurse anchor `#nursing-course`, dark preview card with scarcity `<button>`
3. **Professional paths** — `#nursing-course` (live), `#hcmute-pilot` (featured pilot with progress bar)
4. **Future courses** — 3 interest cards (Workplace → Internship → Technical Reports)
5. **Learning loop** — dark gradient section
6. **LandingFooter** — Platform column with nested course links

---

## Language toggle (EN ↔ VI)

| Area | EN observed | VI observed | Notes |
|------|-------------|-------------|-------|
| Hero H1 | "Choose your English path by profession." | "Chọn lộ trình tiếng Anh theo nghề nghiệp của bạn." | ✅ |
| Hero badge | "English for real professional situations" | "Tiếng Anh cho tình huống nghề nghiệp thật" | ✅ |
| Hero pilot CTA | "Register for HCMUTE Pilot" | "Đăng ký pilot HCMUTE" | ✅ |
| Future section H2 | "Vote by registering your interest." | "Bình chọn bằng cách đăng ký quan tâm." | ✅ |
| Footer Platform | "Platform" | "Nền tảng" | ✅ |
| Footer Emergency link | "Emergency Nursing" | "Điều dưỡng Cấp cứu" | ✅ |
| Footer HCMUTE link | "HCMUTE Pilot" | "HCMUTE Pilot" (unchanged) | Acceptable proper noun |
| Scarcity badge (after API) | "🔥 N spots left — register now" | "🔥 N suất còn lại — đăng ký ngay" | ✅ |
| Modal heading label | "Register for pilot" | "Đăng ký pilot" | ✅ |
| **hpPathsEyebrow** | "Professional English Paths" | **Same English string in VI** | ⚠️ i18n gap |
| **hpLiveTitle** | "Emergency Nursing Communication" | **Same English in VI** | ⚠️ i18n gap |
| Learning loop (VI→EN) | Full EN after toggle | — | ✅ |

**Leakage heuristic:** After EN toggle, most body text is English; VI diacritics may remain in placeholders (e.g. name field "Nguyễn Văn A") — acceptable.

---

## Scarcity badge & `/api/pilot-spots`

- **Endpoint:** `GET /api/pilot-spots` → `{ success, data: { taken, total, spotsLeft, isFull } }`
- **Live DB (exploration):** `taken: 0`, `spotsLeft: 50` — hero badge updates from placeholder "🔥 Chỉ 50 suất" to "🔥 50 suất còn lại — đăng ký ngay"
- **Hero preview badge:** `<button>` (not `<span>`), opens enrollment modal when not full
- **Featured pilot card:** separate scarcity block + progress bar (`#34d399` / `#f97316` / `#ef4444` by `spotsLeft` thresholds 15 and 5)
- **Before API resolves:** shows `hpPreviewSlots` static copy — brief flash possible
- **500 response:** page still renders; badge stays on placeholder (no crash)

---

## Enrollment modal

- Opened via: hero pilot CTA, hero scarcity badge, featured pilot "Register for free pilot"
- Fields: name, email, phone (optional), major (optional)
- **Prior behavior:** submit disabled when name/email empty — no visible errors
- **Fixed:** client-side validation messages on submit (name required, email required, invalid email)
- **Happy path:** POST `/api/enrollments` → closes modal, pilot CTA shows "Registration noted" / "Đã ghi nhận đăng ký"
- **SPOTS_FULL:** 409 with `error: "SPOTS_FULL"` → inline error; hero CTA disabled with "Registration closed"
- Close: × button with `aria-label` from `t.hpModalClose`, "Later" cancel
- **No focus trap** observed (Tab can escape modal) — a11y gap for Phase 2
- **Language while modal open:** toggling EN/VI updates modal labels (same React tree)

---

## Footer & anchors

| Link | href | Behavior |
|------|------|----------|
| Emergency Nursing | `/learn/courses/emergency-nursing-communication` | navigates away |
| HCMUTE Pilot | `/#hcmute-pilot` | scroll to `#hcmute-pilot` |
| Nurse shortcut | `#nursing-course` | scroll to emergency card |

**DOM order:** `#nursing-course` article precedes `#hcmute-pilot` precedes future-courses section — confirmed in `page.tsx`.

---

## Future courses (coming soon)

Exactly **3** cards in order:
1. Workplace English for Freshers / Tiếng Anh Công Sở Cho Fresher
2. English for Internship Interviews / Tiếng Anh Phỏng Vấn Thực Tập
3. English for Technical Reports & Labs / Tiếng Anh Kỹ Thuật & Báo Cáo Lab

Each has title, description paragraph, ≥3 outcome bullets (≥2 required by spec — we have 3).

---

## Viewports

| Viewport | Notes |
|----------|-------|
| Desktop 1440×900 | Layout clean; two-column hero |
| Mobile 390×844 | No horizontal overflow expected; footer stacks single column (`grid` → column on small) |
| Tablet 768×1024 | Hero stacks; cards readable |

---

## Console & network

- **Hydration error** in dev overlay: `LandingNav.tsx` — server/client mismatch (likely `localStorage` lang hydration). Worth monitoring; smoke home test still passes.
- **Failed requests on load:** none for `/` besides optional dev tooling
- **Intentional mocks in tests:** `/api/pilot-spots`, `/api/enrollments`

---

## Fragile / surprising behaviors

1. **Hydration warning** on lang toggle in dev (Next.js overlay)
2. **hpPathsEyebrow** not translated in VI
3. **hpLiveTitle** stays English in VI mode
4. **Pilot spots flash** from placeholder → API-driven text
5. **No focus trap** in enrollment modal
6. **Double-submit:** submit button only disabled while `submitting` — rapid double-click could duplicate POST (Phase 2)
7. **Smoke suite:** `learner-overview` fails when auth session expired (pre-existing, not homepage)

---

## Test plan traceability

| Bug | Source finding |
|-----|----------------|
| bug-138 | Language table above |
| bug-139 | Hero scarcity `<button>` + mock spots |
| bug-140 | Modal validation + happy path |
| bug-141 | SPOTS_FULL + disabled CTA |
| bug-142 | Footer links table |
| bug-143 | Nurse anchor |
| bug-144 | Future courses section |
| bug-145 | Mobile viewport table |
| bug-146+ | API 500, bar colors, a11y, i18n leakage, DOM order, console hygiene |
