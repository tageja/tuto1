# Public pages — Batch 1 exploration findings (2026-05-21)

**Environment:** `http://localhost:3001` · branch `agent-x-integration`  
**Browser:** Cursor IDE browser MCP + Playwright (chromium-desktop)  
**Scope:** P1 `/`, P2 `/about`, P3 `/pitchdeck`, P4 `/survey-hcmute`, P5 `/survey-nurses`

---

## Summary

| Page | Status | Notes |
|------|--------|-------|
| P1 `/` | OK with minor dev noise | Hero, scarcity badge, enrollment modal, footer sub-links work. Hydration mismatch warning in dev console (LandingNav). |
| P2 `/about` | OK | Headings + paragraphs; EN/VI toggle works. |
| P3 `/pitchdeck` | OK | 200, non-blank (PDF viewer desktop / mobile fallback). No JS errors beyond React DevTools hint. |
| P4 `/survey-hcmute` | Bug found | Splash bullet list ignored language toggle (`text('vi')` hardcoded) — fixed in code; spec **bug-162**. |
| P5 `/survey-nurses` | OK | Splash uses `t.*` keys; bullets respect i18n. |

---

## P1 — HCMUTE homepage (`/`)

### Layout & content
- Default locale VI: hero H1, pilot CTA, live nursing path, future courses, how-it-works, footer.
- Scarcity badge (`🔥 Chỉ 50 suất` / EN spots copy) is a **button** — opens enrollment modal.
- Hero CTAs: pilot register, live courses link, nurse shortcut (`🩺 Điều dưỡng? → …`).
- Note: PM copy uses **“Đăng ký pilot HCMUTE”** / “Register for HCMUTE Pilot”, not literal “Đăng ký ngay”; scarcity line includes “đăng ký ngay” in VI (`hpSpotsLeft`).

### Nav (`LandingNav`)
- Links: logo `/`, Courses `/learn/courses`, Dashboard `/learn`, About `/about`, Admin `/admin`, Start Learning `/learn`.
- **No Profile link in landing nav** — profile lives in **learner sidebar** (`/learn/profile`) after auth. Direct `/learn/profile` while logged out → `/auth/login?next=%2Flearn%2Fprofile` (not 404).

### Footer (`LandingFooter`)
- Platform: Courses, **Emergency Nursing** → `/learn/courses/emergency-nursing-communication`, **HCMUTE Pilot** → `/#hcmute-pilot`, Dashboard, Pair Practice.
- Admin links → `/admin`.

### EN ↔ VI
- Toggle switches hero, footer “Platform/Nền tảng”, nav labels, footer course sub-link labels.
- Known gap (documented in HCMUTE batch): some hero strings still partially VI in EN mode — covered by existing `@hcmute` specs, not re-opened here.

### Mobile 390×844
- Not fully re-walked in MCP this session; existing `bug-145-hcmute-mobile-viewport-smoke` covers homepage overflow.

### Console / network
- Dev-only React hydration warning on `/` (attribute mismatch on nav links).
- `GET /api/pilot-spots` — 200 when server up.

---

## P2 — About (`/about`)

- HTTP 200; H1 “Về tuto. Pro” / “About tuto. Pro”, subtitle, three sections (Mission, Who, CHIR) each with H2 + paragraph.
- EN toggle: “About tuto. Pro”, “Our Mission”, footer “Platform”.
- No broken links clicked beyond shared landing chrome.

---

## P3 — Pitch deck (`/pitchdeck`)

- HTTP 200; title “tuto. Pro - Pitch Deck”.
- Desktop: PDF iframe (`/pitchdeck.pdf`). Mobile viewport in MCP showed fallback card with Open/Download PDF — expected.
- No application errors in console.

---

## P4 — HCMUTE survey (`/survey-hcmute`)

### Splash
- Voucher banner, 3 bullets, Start Survey CTA.
- **Bug:** With EN selected, bullets still showed VI (“Chỉ mất khoảng 5 phút”, etc.) — `SurveyLanding.tsx` used `text('vi')` instead of `lang`. **Fixed** + **bug-162** spec.

### Form validation (empty personal step)
- “Next” / “Tiếp theo” **disabled** until name, email (@), age, gender filled.
- Required fields marked with `*` in labels — no separate inline error paragraphs.
- Empty submit does **not** call `POST /api/surveys/hcmute` (cannot proceed).

### Valid submit
- Not exercised against real DB in automation (POST intercepted in specs).

---

## P5 — Nurse survey (`/survey-nurses`)

- Splash: EN/VI via translation keys; structure similar to HCMUTE.
- Form step 0: same disabled-Next pattern; POST `/api/surveys/nurses` not fired when empty.

---

## Profile / auth (bug-155 context)

| Action | Result |
|--------|--------|
| `GET /learn/profile` logged out | Redirect ` /auth/login?next=/learn/profile` — **not 404** |
| Profile in learner sidebar logged in | Loads `/learn/profile` (Playwright + existing learner auth file) |

---

## Specs codified from this pass

| Bug | File | Topic |
|-----|------|-------|
| 155 | `bug-155-public-profile-route-auth.spec.ts` | Profile route auth redirect + logged-in sidebar |
| 156 | `bug-156-homepage-nav-footer-links.spec.ts` | All LandingNav/Footer links non-404 |
| 157 | `bug-157-about-page-content.spec.ts` | About 200 + content + i18n |
| 158 | `bug-158-pitchdeck-page-loads.spec.ts` | Pitchdeck 200 + non-blank |
| 159 | `bug-159-survey-hcmute-validation.spec.ts` | HCMUTE empty submit blocked + no POST |
| 160 | `bug-160-survey-nurses-validation.spec.ts` | Nurses empty submit blocked + no POST |
| 161 | `bug-161-language-persists-navigation.spec.ts` | `nursed_lang` persists EN across `/` → `/about` |
| 162 | `bug-162-survey-hcmute-splash-i18n-bullets.spec.ts` | HCMUTE splash bullets follow EN/VI |

---

## Re-run command

```powershell
cd C:\Users\ASUS\tuto-nursemed-practice-pilot\apps\med
npx playwright test --grep "@public-pages" --project=chromium-desktop
```
