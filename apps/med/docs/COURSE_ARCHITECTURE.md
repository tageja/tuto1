# Nursing English Upskill Program — Course Architecture

## Program Overview

3 flagship courses for Vietnamese nurses (A1–A2 level). Each course has 8 modules. Each module follows an 8-lesson structure: **Heads Up → Heads Down → Heads Together → Assessment**.

## Courses in the Platform

| Course | Level | Status | Modules |
|--------|-------|--------|---------|
| Foundations of Nursing English | A1 | Draft | 8 shells |
| **Emergency Nursing Communication** | A2 | **Published** | 8 (M1-M5 fully authored) |
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

1. **Audio production**: Record all `PLACEHOLDER` audio files for Modules 1-5 (40+ audio files needed across 5 modules)
2. **Module 6**: Advanced escalation & team communication — follow same 8-lesson template
3. **Publish Foundations** course — content shells exist, needs lesson authoring
4. **Publish Ward** course — content shells exist, needs lesson authoring
5. **Auth integration** — connect lessons/progress to real user accounts

---

## Module 5: Communicating Patient Deterioration & Escalation Protocols

**"Critical Communication Under Pressure"** — fully authored with all content.

### Learning Objectives

Nurses learn to:
1. Recognize vital sign deterioration (SpO2, BP, HR, consciousness)
2. Escalate effectively using SBAR framework
3. Communicate with confidence under high-pressure situations
4. Handle anxious family members while being honest
5. Document deteriorating patient cases in English

### Lesson Summary

| # | Title | Stage | Steps | Est. |
|---|-------|-------|-------|------|
| 1 | Vital Signs in Crisis — What the Numbers Mean | heads_up | scenario_intro, audio_shadow, script_read, quiz | 12 min |
| 2 | Key Phrases in Action — Red Flags & Urgency | heads_up | audio_shadow, script_read, cloze, quiz | 12 min |
| 3 | Understanding the Situation — Controlled Practice | heads_down | audio_shadow, cloze, no_script, quiz | 15 min |
| 4 | A Second Scenario — Blood Pressure Crisis | heads_down | scenario_intro, audio_shadow, cloze, recording_submit | 15 min |
| 5 | Your Turn to Speak — Open Deterioration Scenario | heads_down | scenario_intro, cloze, no_script, recording_submit | 18 min |
| 6 | Pair Practice — Round 1: Structured Escalation | heads_together | script_read, cloze, no_script, recording_submit | 20 min |
| 7 | Pair Practice — Round 2: Responding to Family Anxiety | heads_together | script_read, cloze, no_script, recording_submit | 20 min |
| 8 | Module Assessment — Mixed Input & Self-Reflection | assessment | quiz (4Q), cloze, recording_submit, self_reflection | 25 min |

**Total module time: ~2 hours 17 minutes**

### Key Phrases Framework

**Vital Sign Language:**
- "His oxygen saturation is dropping"
- "SpO2 has fallen to 88 percent"
- "Heart rate has jumped to 128"
- "Blood pressure is rising rapidly"
- "He's becoming increasingly confused"

**Red-Flag Language:**
- "I'm concerned about deterioration"
- "This is urgent"
- "We need help NOW"
- "This patient is critically unstable"

**SBAR Framework:**
- **S**ituation: "I'm calling about patient in bed 7"
- **B**ackground: "He was admitted with pneumonia 3 days ago"
- **A**ssessment: "My assessment is that he's deteriorating"
- **R**ecommendation: "I recommend we move him to ICU immediately"

**Family Communication:**
- "Your mother's condition has changed"
- "I want to be honest with you — we're concerned"
- "We're taking steps to keep her safe"
- "We catch these changes early so we can act"

### Content Features

- 8 authentic scenarios (SpO2 drops, BP spikes, multi-system deterioration, family anxiety)
- 5 audio_shadow steps modeling expert escalation language
- 4 pair-practice role-plays (Nurse ↔ Nurse, Nurse ↔ Family)
- Comprehensive SBAR framework teaching and practice
- Rubric-based assessment of escalation calls (150 seconds final recording)
- Metacognitive self-reflection on communication under stress

### Audio Production Needed

| Step | Scenario | Duration | Speaker |
|------|----------|----------|---------|
| L1-S2 | Vital signs language masterclass | 15 sec | Female nurse, Vietnamese accent |
| L2-S1 | Red-flag language & urgency | 20 sec | Male doctor + Female nurse |
| L3-S1 | SpO2 deterioration during sleep | 20 sec | Female nurse, analytical tone |
| L4-S1 | Blood pressure crisis post-op | 15 sec | Female narrator, urgent |
| L5-S1 | Multi-system deterioration scenario | 15 sec | Female narrator, complex case |

**Total: ~85 seconds audio across 5 scenarios**

---
