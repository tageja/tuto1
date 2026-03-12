# Icon Replacement List — Emoji → Custom Icons

This document lists all emojis used as icons in the project so you can replace them with custom icons from Canva.

---

## Where to Save Your Icons

**Recommended location:** `apps/med/public/icons/`

Create this folder and save your icons there. Use **SVG** format when possible (scalable, small file size). PNG is also fine at 2x or 3x resolution (e.g. 96×96 or 144×144 px for course icons).

Suggested naming: `icon-{name}.svg` or `icon-{name}.png`

---

## 1. Nursing Course Icons (apps/med) — **PRIORITY**

These appear on course cards (landing page, learn catalog, course detail).

| # | Emoji | Current | Course / Context | Suggested filename |
|---|-------|---------|------------------|--------------------|
| 1 | 🩺 | Stethoscope | Foundations of Nursing English | `icon-stethoscope.svg` |
| 2 | 🚨 | Siren / Emergency | Emergency Nursing Communication | `icon-emergency.svg` |
| 3 | 🛏️ | Hospital bed | Ward and Inpatient Communication | `icon-hospital-bed.svg` |
| 4 | 🌍 | Globe / Earth | International Patient Communication | `icon-globe.svg` |
| 5 | 📋 | Clipboard | Clinical Handover and Team Communication | `icon-clipboard.svg` |
| 6 | 💼 | Briefcase | Career English for Nurses | `icon-briefcase.svg` |
| 7 | 📖 | Book | Fallback for unknown courses | `icon-book.svg` |

---

## 2. Lesson Step Type Icons (apps/med)

Used in lesson player headers and step type labels.

| # | Emoji | Meaning | Context | Suggested filename |
|---|-------|---------|---------|--------------------|
| 8 | 🏥 | Hospital | Scenario Intro | `icon-hospital.svg` |
| 9 | 💭 | Thought bubble | Self Reflection | `icon-reflection.svg` |
| 10 | 🎬 | Video / Clapperboard | Video step | `icon-video.svg` |
| 11 | 🎧 | Headphones | Audio & Shadow step | `icon-headphones.svg` |
| 12 | 📖 | Book | Script Read step | `icon-book.svg` (reuse #7) |
| 13 | ✏️ | Pencil / Edit | Cloze (Fill Blanks) step | `icon-pencil.svg` |
| 14 | 🎯 | Target / Bullseye | Free Speaking, Mission step | `icon-target.svg` |
| 15 | 🎤 | Microphone | Recording step | `icon-microphone.svg` |
| 16 | 🧠 | Brain | Quiz step | `icon-brain.svg` |
| 17 | 👂 | Ear | Listen phase (Audio Shadow) | `icon-ear.svg` |
| 18 | 🗣️ | Speaking | Speak phase (Audio Shadow) | `icon-speak.svg` |
| 19 | 🔊 | Speaker | Audio / Listen button | `icon-speaker.svg` |
| 20 | 🎵 | Music note | Audio placeholder | `icon-music.svg` |

---

## 3. Learn Dashboard & Stats (apps/med)

| # | Emoji | Meaning | Context | Suggested filename |
|---|-------|---------|---------|--------------------|
| 21 | 🔥 | Fire | Streak / Days streak | `icon-streak.svg` |
| 22 | ✓ | Checkmark | Lessons completed | `icon-check.svg` |
| 23 | 📚 | Books | Courses enrolled | `icon-courses.svg` |
| 24 | 🔜 | Soon | Coming soon placeholder | `icon-coming-soon.svg` |
| 25 | 📍 | Location pin | Scenario setting | `icon-location.svg` |
| 26 | 💡 | Lightbulb | Objective / Tip | `icon-tip.svg` |
| 27 | 🎉 | Celebration | Success / Pass | `icon-success.svg` |
| 28 | 💪 | Flexed bicep | Keep trying / Fail | `icon-retry.svg` |
| 29 | 📭 | Empty mailbox | Empty state | `icon-empty.svg` |

---

## 4. Mission / Reflection UI (apps/med)

| # | Emoji | Meaning | Context | Suggested filename |
|---|-------|---------|---------|--------------------|
| 30 | ✅ | Check | Done | `icon-done.svg` |
| 31 | 📅 | Calendar | Later | `icon-calendar.svg` |
| 32 | ❌ | X | Cannot | `icon-cannot.svg` |
| 33 | 😰😕😐🙂😊 | Feeling scale | Self-reflection mood (5 levels) | `icon-mood-1.svg` … `icon-mood-5.svg` (optional) |

---

## 5. Web Dashboard — Find Teacher (apps/dashboard)

Subject filter pills.

| # | Emoji | Subject | Suggested filename |
|---|-------|---------|--------------------|
| 34 | 📐 | Mathematics | `icon-math.svg` |
| 35 | 🇬🇧 | English (UK flag) | `icon-english.svg` |
| 36 | ⚛️ | Physics | `icon-physics.svg` |
| 37 | 🧪 | Chemistry | `icon-chemistry.svg` |
| 38 | 📚 | Literature | `icon-literature.svg` |
| 39 | 🔬 | Biology | `icon-biology.svg` |

---

## 6. Web Dashboard — Modern Dashboard (apps/dashboard)

| # | Emoji | Meaning | Context | Suggested filename |
|---|-------|---------|---------|--------------------|
| 40 | 📊 | Chart | Overview tab | `icon-chart.svg` |
| 41 | 👨‍🏫 | Male teacher | Teacher avatar / tab | `icon-teacher-male.svg` |
| 42 | 👩‍🏫 | Female teacher | Teacher avatar | `icon-teacher-female.svg` |
| 43 | 👨‍🎓 | Male student | Student avatar / tab | `icon-student-male.svg` |
| 44 | 👩‍🎓 | Female student | Student avatar | `icon-student-female.svg` |
| 45 | 👨‍🔬 | Male scientist | Teacher avatar | `icon-scientist-male.svg` |
| 46 | 👩‍🔬 | Female scientist | Student avatar | `icon-scientist-female.svg` |
| 47 | 🎓 | Graduation cap | School logo | `icon-graduation.svg` |
| 48 | 💰 | Money | Revenue stat | `icon-revenue.svg` |
| 49 | ➕ | Plus | Add button | `icon-add.svg` |
| 50 | 📥 | Download | Export CSV | `icon-download.svg` |

---

## 7. Translation / Greeting Emojis (Optional)

These appear in translated strings. Replacing them would require changes in `apps/med/lib/i18n/translations.ts` and possibly a custom text renderer.

| Emoji | Context |
|-------|---------|
| 👋 | Greeting "Hello, Nurse" |
| 🎉 | Welcome back, success messages |
| ✅ | Success toasts |
| 🏠 | Home button |
| 📤 | Submit button |
| 🎬🎧📖✏️🎯🎤🧠 | Step type labels in admin dropdown |

**Note:** These are embedded in translation strings. You can either leave them as emojis or refactor to use icon components with translation keys.

---

## Summary Count

| Category | Count | Priority |
|----------|-------|----------|
| Course icons | 7 | **High** (matches your screenshot) |
| Step type icons | 13 | High |
| Learn dashboard | 9 | Medium |
| Mission/Reflection | 4 | Medium |
| Find Teacher subjects | 6 | Medium |
| Modern Dashboard | 11 | Medium |
| **Total unique icons** | **~35–40** | |

---

## Lock Icon (Coming Soon)

The "Coming Soon" badge uses **Lucide React** `Lock` icon, not an emoji. No replacement needed unless you want a custom lock icon.

---

## Next Steps

1. Create `apps/med/public/icons/` (and optionally `apps/dashboard/public/icons/` if you want to keep them separate).
2. Download/create icons from Canva in SVG or PNG format.
3. Save them with the suggested filenames.
4. Tell me when they’re ready and I’ll update the code to use them instead of emojis.
