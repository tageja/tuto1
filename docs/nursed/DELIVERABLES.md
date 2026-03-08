# NurseEd — Project Deliverables & Requirements Tracker

**Platform:** med.tuto.asia  
**Branch:** `nursemed`  
**Last Updated:** 2026-03-08  
**Status:** Phase 1 MVP — In Development

---

## 📋 What Is This Document?

This is the living tracker for the NurseEd sub-project within Tuto. It tracks:
1. What **you** need to deliver for development to proceed
2. Questions that need **your answers** before we can build
3. Requirements as they evolve
4. Open decisions

Update this document after each session or decision.

---

## 🔴 YOUR DELIVERABLES — Blocking Development

These are items only you can provide. Without them, certain features cannot be completed.

### Content Deliverables

| # | Item | For Which Feature | Status | Notes |
|---|------|-------------------|--------|-------|
| C1 | Course outline confirmed (Module 1: First Contact & Vital Signs) | Course builder seed data | ⏳ Pending | Based on brainstorm: 6–8 lessons |
| C2 | Audio recordings per lesson (slow speed + normal speed) | AudioShadow step | ⏳ Pending | Format: MP3 or WAV. Provide with script text. |
| C3 | Script text for each lesson (nurse + patient lines, EN + VN) | Script/Cloze/NoScript steps | ⏳ Pending | Can be provided as Google Doc or paste |
| C4 | Quiz questions per lesson (5–8 per lesson, MCQ format) | Quiz step | ⏳ Pending | Format: question + 4 options + correct answer + VN translation |
| C5 | Video intro clips per module (optional for Phase 1) | Video step | 🔵 Optional | YouTube links OK, or upload MP4 |
| C6 | Vietnamese UI translations (review auto-drafted VN text in app) | All UI | ⏳ Pending | Review and correct any translation issues |
| C7 | Role-play mission text per lesson | Mission step | ⏳ Pending | Simple real-world tasks e.g. "Use this phrase with 1 colleague today" |
| C8 | Pilot hospital name + logo + branding | Hospital profile | ⏳ Pending | Name, city, contact email |
| C9 | Nurse enrollment list for pilot cohort | Learner accounts | ⏳ Pending | Email addresses when auth is activated |
| C10 | Cover image for each course (or approve AI-generated gradient) | Course catalog | ⏳ Pending | Currently using emoji + gradient placeholder |

### Technical Deliverables

| # | Item | For Which Feature | Status | Notes |
|---|------|-------------------|--------|-------|
| T1 | Supabase migration run confirmation | All DB | ✅ Done | 16 nursed_* tables + RLS + indexes + rewards seed live in production |
| T2 | Supabase Storage bucket created: `nursed-assets` (public) | Audio/video upload | ✅ Done | Bucket created: public, 50MB limit, audio/video/image/pdf MIME types allowed |
| T3 | OpenAI API key (for Whisper STT in Phase 2) | Voice scoring | 🔵 Phase 2 | Only needed when activating keyword scoring |
| T4 | Domain setup: med.tuto.asia → Vercel deployment | Production | ⏳ Pending | DNS CNAME to Vercel + add custom domain in Vercel project |
| T5 | Vercel project for apps/med/ (separate from dashboard) | Production | ⏳ Pending | New Vercel project pointing to `/apps/med/` in the monorepo |

---

## 🟡 OPEN QUESTIONS — Need Your Answers

| # | Question | Decision Needed For | Your Answer |
|---|----------|---------------------|-------------|
| Q1 | Should nurses use their **existing Supabase accounts** (same as school parents/teachers) OR a **completely separate login flow**? | Auth implementation | |
| Q2 | Who are the **admin users** for NurseEd? You only? Or hospital managers also get admin access? | Role-based access | |
| Q3 | For the free pilot: do nurses need to register, or is it **completely open/anonymous** initially? | Auth decision | |
| Q4 | Do you want the partner (hospital contact) to have their own **hospital admin dashboard** view? | Hospital admin scope | |
| Q5 | For audio content: will you record the audio yourself, hire a voice actor, or use **AI TTS** (e.g. ElevenLabs)? | Content production pipeline | |
| Q6 | For Vietnamese translations: is the current **auto-drafted Vietnamese** in the UI acceptable, or do you want a professional review? | i18n quality | |
| Q7 | Should the app support **dark mode**? Currently light-only. | Theme | |
| Q8 | For the **pair practice** feature: is Zalo/WhatsApp + upload acceptable for Phase 1, or do you need something in-app? | Pair system scope | |
| Q9 | What is the **target launch date** for the free hospital pilot? | Timeline | |
| Q10 | Will you use a **separate OpenAI key** for STT/scoring, or share with other Tuto features? | Cost & billing | |

---

## ✅ DECISIONS MADE

| Date | Decision | By |
|------|----------|----|
| 2026-03-08 | Platform URL: med.tuto.asia | You |
| 2026-03-08 | Branch: nursemed | You |
| 2026-03-08 | Web-first, mobile later | You |
| 2026-03-08 | Same Supabase project as main Tuto | You |
| 2026-03-08 | No auth in Phase 1 (MVP for testing) | You |
| 2026-03-08 | STT/scoring deferred to Phase 2 | Architecture |
| 2026-03-08 | Pair practice: code-based groups + recording upload (no live video) | You |
| 2026-03-08 | Vietnamese-first UI | You |
| 2026-03-08 | Free pilot: Module 1 — First Contact & Vital Signs | You |

---

## 🚀 PHASE TRACKER

### Phase 1 — MVP (Current)
**Goal:** Working platform for free hospital pilot  
**Status:** 🔄 In Development

- [x] Project scaffold (apps/med/)
- [x] Supabase migration written (041_nursed_schema.sql)
- [x] Admin dashboard (courses, modules, lessons, hospitals)
- [x] Lesson builder (all 8 step types)
- [x] Learner portal (catalog, lesson player, all step components)
- [x] Recording upload (MediaRecorder API)
- [x] Pair groups system
- [x] Analytics page
- [ ] **Supabase migration run in production** ← YOU
- [ ] **Supabase Storage bucket created** ← YOU
- [ ] **First course content added via admin** ← YOU
- [ ] Auth activation (after pilot feedback)

### Phase 2 — Engagement
- [ ] STT keyword scoring (OpenAI Whisper via Supabase Edge Function)
- [ ] Rewards / badges / streaks (DB already designed)
- [ ] Certificates on module completion
- [ ] Hospital admin role (separate from super-admin)
- [ ] Email notifications

### Phase 3 — Scale
- [ ] Mobile app (React Native screens)
- [ ] Accent packs (US/UK audio content)
- [ ] Branching "choose-your-response" clips
- [ ] In-app live practice (Agora WebRTC)

---

## 🏗️ TECHNICAL ARCHITECTURE SUMMARY

```
med.tuto.asia (Vercel)
      │
   apps/med/ (Next.js 15)
      │
      ├── /admin/*    Admin panel (no auth in Phase 1)
      ├── /learn/*    Learner portal (no auth in Phase 1)
      └── /api/*      API routes → Supabase (service role)
                              │
                     Same Supabase project as Tuto
                     New tables: nursed_*
                     New bucket: nursed-assets
```

**Key Libraries:**
- Next.js 15 (App Router)
- Supabase (@supabase/supabase-js, @supabase/ssr)
- Tailwind CSS
- Lucide React (icons)
- MediaRecorder API (browser audio recording)

**Port in development:** 3001 (run `npm run dev` in apps/med/)

---

## 📂 CODEBASE STRUCTURE

```
apps/med/
├── app/
│   ├── admin/           Admin panel (courses, hospitals, analytics)
│   ├── learn/           Learner portal (courses, lessons, pairs)
│   ├── api/             REST endpoints (courses, modules, lessons, steps, etc.)
│   └── page.tsx         Landing page
├── components/
│   ├── admin/           Admin UI (sidebar, step editor)
│   ├── learn/           Learner UI (player, step components)
│   └── ui/              Shared utilities (cn, Toast)
├── lib/
│   ├── supabase.ts      Supabase clients + TypeScript types
│   ├── storage.ts       File upload helpers
│   └── db/              Database query helpers
└── supabase/migrations/
    └── 041_nursed_schema.sql   ← Run this!
```

---

## 💰 COST ESTIMATE (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Vercel (apps/med/) | Hobby/Pro plan | $0–$20/mo |
| Supabase (same project) | Extra storage ~5GB | ~$0.10/mo |
| OpenAI Whisper STT (Phase 2) | 50 nurses × 30 days × 30s avg | ~$4.50/mo |
| Total Phase 1 | | **~$0–$20/mo** |

---

## 📞 HOW TO REACH DEVELOPMENT PROGRESS

- **Branch:** `nursemed`
- **Local dev:** `cd apps/med && npm run dev` → http://localhost:3001
- **Admin panel:** http://localhost:3001/admin
- **Learner portal:** http://localhost:3001/learn
- **Landing page:** http://localhost:3001
