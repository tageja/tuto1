# Nursing English Upskill Program — Course Architecture

## Program Overview

3 flagship courses for Vietnamese nurses (A1–A2 level). Each course has 8 modules. Each module follows an 8-lesson structure: **Heads Up → Heads Down → Heads Together → Assessment**.

## Courses in the Platform

| Course | Level | Status | Modules |
|--------|-------|--------|---------|
| Foundations of Nursing English | A1 | Draft | 8 shells |
| **Emergency Nursing Communication** | A2 | **Published** | 8 (M1 fully authored) |
| Ward and Inpatient Communication | A2 | Draft | 8 shells |
| International Patient Communication | B1 | Draft | 4 shells |
| Clinical Handover and Team Communication | B1 | Draft | 4 shells |
| Career English for Nurses | B2 | Draft | 4 shells |

## Lesson Stage Framework

| Lesson # | Stage | Focus |
|----------|-------|-------|
| 1–2 | `heads_up` | Language exposure and guided noticing |
| 3–5 | `heads_down` | Controlled practice and supported production |
| 6–7 | `heads_together` | Pair practice (full script → partial → no script) |
| 8 | `assessment` | Mixed-input exam + self-reflection |

## Pilot Module: Emergency Nursing Communication — Module 1

**"First Contact in an Emergency"** — fully authored with all content.

### Lesson Summary

| # | Title | Stage | Steps | Est. |
|---|-------|-------|-------|------|
| 1 | What's happening? First words in an emergency | heads_up | scenario_intro, audio_shadow, script_read, quiz | 12 min |
| 2 | Key phrases in action | heads_up | audio_shadow, script_read, quiz | 12 min |
| 3 | Understanding the situation | heads_down | audio_shadow, cloze, quiz | 15 min |
| 4 | A second scenario — new context, same language | heads_down | scenario_intro, audio_shadow, script_read, cloze | 15 min |
| 5 | Your turn to speak | heads_down | audio_shadow, cloze, no_script, recording_submit | 18 min |
| 6 | Pair practice — round 1 | heads_together | script_read, cloze, no_script, recording_submit | 20 min |
| 7 | Pair practice — open scenario | heads_together | no_script, recording_submit, mission | 20 min |
| 8 | Module assessment | assessment | quiz (4Q), cloze, recording_submit, self_reflection | 25 min |

**Total module time: ~2 hours 17 minutes**

## Step Types

| Type | Description | New? |
|------|-------------|------|
| `scenario_intro` | Context card + key phrases + optional slow audio | ✅ NEW |
| `audio_shadow` | Listen → Read along → Speak together | existing |
| `script_read` | Color-coded Nurse/Patient roleplay | existing |
| `cloze` | Fill-in-the-blank | existing |
| `no_script` | Countdown timer + prompt cues | existing |
| `recording_submit` | Browser recording + self-evaluation rubric | existing |
| `quiz` | MCQ with explanations (EN+VI) | existing |
| `mission` | Real-world task card | existing |
| `self_reflection` | Emoji sliders (1–5) + open text | ✅ NEW |

## Audio/Video Placeholder Policy

All `audio_shadow` and `scenario_intro` steps where audio is not yet available use:
- `config.audio_url = "PLACEHOLDER"`
- `config._instructions` — full production brief for audio producers including:
  - Duration target
  - Speaker descriptions (voice, accent, emotion)
  - Scene/background sounds
  - Speed requirements (0.8x slow / normal)
  - Key phrases that must appear

When real audio files are ready, update `audio_url` in the admin panel or via direct DB update.

## Database Tables Used

- `nursed_courses` — 6 courses
- `nursed_modules` — 38 modules (8 per blueprint course + extra)
- `nursed_lessons` — 8 lessons (pilot module only, others to be added)
- `nursed_lesson_steps` — 29 steps across 8 lessons
- `nursed_quiz_questions` — questions embedded in step configs (quiz type)

## Next Steps (Content Roadmap)

1. **Audio production**: Record all `PLACEHOLDER` audio files for Module 1 (8 audio files needed)
2. **Module 2**: Triage language — follow same 8-lesson template
3. **Publish Foundations** course — content shells exist, needs lesson authoring
4. **Publish Ward** course — content shells exist, needs lesson authoring
5. **Auth integration** — connect lessons/progress to real user accounts
