## MODULE 7: Red Flags & Escalation
**Lessons audited:** 8
**Total steps audited:** 66

### Lesson 1 — Calling a Code Blue (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | scenario_intro | ✅ PASS | None |
| Step 2 | flash_card | ✅ PASS | [INFO] Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ |
| Step 3 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 4 | video | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | script_read | ✅ PASS | None |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (flash_card): Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ
- Step 3 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 2 — Recognising Stroke Symptoms — FAST (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ❌ FAIL | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file); [CRITICAL] FAST positive mistranslated in transcriptSegments |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | script_read | ✅ PASS | None |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 2 (audio_shadow): FAST positive mistranslated in transcriptSegments
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 3 — Anaphylaxis After Medication (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ❌ FAIL | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file); [CRITICAL] Segment wrong VI for "What is happening?": "- Chờ bên ngoài." |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | script_read | ✅ PASS | None |
| Step 8 | matching | ⚠️ WARN | [WARNING] EN equals VI: "adrenaline"; [INFO] adrenaline not translated to Vietnamese (may be intentional) |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 2 (audio_shadow): Segment wrong VI for "What is happening?": "- Chờ bên ngoài."
- Step 6 (cloze): No separate script field; clozeText is self-contained
- Step 8 (matching): EN equals VI: "adrenaline"
- Step 8 (matching): adrenaline not translated to Vietnamese (may be intentional)

### Lesson 4 — Sepsis Screening Communication (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 1 | scenario_intro | ✅ PASS | None |
| Step 2 | audio_shadow | ❌ FAIL | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file); [CRITICAL] Corrupted Unicode/spacing in Vietnamese segment; [WARNING] Segment splits "Mrs. Park" incorrectly across segments; [CRITICAL] Segment mistranslation: "Park meets sepsis criteria." → "Công viên đáp ứng các tiêu chí nhiễm trùng huyết."; [CRITICAL] blood cultures → "nuôi cấy" in transcriptSegments |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ❌ FAIL | [CRITICAL] line_0_vi: bad Vietnamese translation in video subtitle |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | script_read | ✅ PASS | None |
| Step 7 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 2 (audio_shadow): Corrupted Unicode/spacing in Vietnamese segment
- Step 2 (audio_shadow): Segment splits "Mrs. Park" incorrectly across segments
- Step 2 (audio_shadow): Segment mistranslation: "Park meets sepsis criteria." → "Công viên đáp ứng các tiêu chí nhiễm trùng huyết."
- Step 2 (audio_shadow): blood cultures → "nuôi cấy" in transcriptSegments
- Step 4 (video): line_0_vi: bad Vietnamese translation in video subtitle
- Step 5 (cloze): No separate script field; clozeText is self-contained

### Lesson 5 — Chest Pain — Possible MI (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | script_read | ✅ PASS | None |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 6 — Pair Practice — Unresponsive Patient (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 2 | video | ⚠️ WARN | [WARNING] line_1_vi: informal/wrong translation for "What is the situation?"; [WARNING] line_3_vi: "Airway clear?" may be mistranslated as "Không có đường thở?" |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | video | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | no_script | ✅ PASS | None |
| Step 8 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (video): line_1_vi: informal/wrong translation for "What is the situation?"
- Step 2 (video): line_3_vi: "Airway clear?" may be mistranslated as "Không có đường thở?"
- Step 6 (cloze): No separate script field; clozeText is self-contained
- Step 8 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 7 — Pair Practice — Paediatric Emergency Escalation (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 0 | flash_card | ✅ PASS | None |
| Step 2 | video | ❌ FAIL | [CRITICAL] line_1_vi: bad Vietnamese translation in video subtitle; [WARNING] line_2_vi: working hard to breathe → awkward VI (làm việc chăm chỉ để thở) |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | mission | ⚠️ WARN | [WARNING] Duplicate mission fields (missionEn vs mission_en) — conflicting content? |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (video): line_1_vi: bad Vietnamese translation in video subtitle
- Step 2 (video): line_2_vi: working hard to breathe → awkward VI (làm việc chăm chỉ để thở)
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text
- Step 8 (mission): Duplicate mission fields (missionEn vs mission_en) — conflicting content?

### Lesson 8 — Module Assessment — Red Flags & Self-Reflection (assessment)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | quiz | ✅ PASS | None |
| Step 2 | spot_the_mistake | ✅ PASS | None |
| Step 3 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 4 | drag_order | ✅ PASS | None |
| Step 5 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 6 | matching | ✅ PASS | None |
| Step 7 | self_reflection | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 3 (cloze): No separate script field; clozeText is self-contained
- Step 5 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Module Summary
| Severity | Count | Description |
|----------|-------|-------------|
| ❌ CRITICAL | 7 | Audio placeholders, wrong answer keys, mistranslations |
| ⚠️ WARNING | 6 | Rubric gaps, thin rubrics, VI quality, cloze/script |
| ℹ️ INFO | 19 | Minor capitalization, lesson-scoped matching |

**Issues found:** 32
---

## MODULE 8: Documentation and Rapid Reporting
**Lessons audited:** 8
**Total steps audited:** 63

### Lesson 1 — End-of-Shift Handover to Incoming Nurse (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | scenario_intro | ✅ PASS | None |
| Step 2 | flash_card | ✅ PASS | None |
| Step 3 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 3 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 2 — On-Call Doctor Night Report (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ❌ FAIL | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file); [CRITICAL] Corrupted Unicode/spacing in Vietnamese segment; [WARNING] Segment splits "Mrs. Park" incorrectly across segments |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | script_read | ✅ PASS | None |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 2 (audio_shadow): Corrupted Unicode/spacing in Vietnamese segment
- Step 2 (audio_shadow): Segment splits "Mrs. Park" incorrectly across segments
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 3 — Rapid Verbal Update at Bedside (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | [INFO] Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ |
| Step 2 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | script_read | ✅ PASS | None |
| Step 8 | matching | ⚠️ WARN | [WARNING] EN equals VI: "ISBAR" |

**Summary of issues for this lesson:**
- Step 1 (flash_card): Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 6 (cloze): No separate script field; clozeText is self-contained
- Step 8 (matching): EN equals VI: "ISBAR"

### Lesson 4 — Handing Over a Deteriorating Patient Mid-Treatment (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | scenario_intro | ✅ PASS | None |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | script_read | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 5 — ISBAR Handover for a Stable Patient (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | video | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | script_read | ✅ PASS | None |
| Step 7 | no_script | ✅ PASS | None |
| Step 8 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 8 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 6 — Pair Practice — Nurse to Nurse Shift Handover (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | video | ✅ PASS | None |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 7 — Pair Practice — Nurse to Doctor Verbal Report (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | video | ✅ PASS | None |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | mission | ⚠️ WARN | [WARNING] Duplicate mission fields (missionEn vs mission_en) — conflicting content? |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text
- Step 8 (mission): Duplicate mission fields (missionEn vs mission_en) — conflicting content?

### Lesson 8 — Module Assessment — Documentation & Self-Reflection (assessment)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | quiz | ✅ PASS | None |
| Step 2 | spot_the_mistake | ✅ PASS | [INFO] Uses correct/incorrect item schema (not mistake/correction); verify UI supports it |
| Step 3 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 4 | drag_order | ✅ PASS | None |
| Step 5 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 6 | matching | ✅ PASS | None |
| Step 7 | self_reflection | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (spot_the_mistake): Uses correct/incorrect item schema (not mistake/correction); verify UI supports it
- Step 3 (cloze): No separate script field; clozeText is self-contained
- Step 5 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Module Summary
| Severity | Count | Description |
|----------|-------|-------------|
| ❌ CRITICAL | 1 | Audio placeholders, wrong answer keys, mistranslations |
| ⚠️ WARNING | 3 | Rubric gaps, thin rubrics, VI quality, cloze/script |
| ℹ️ INFO | 18 | Minor capitalization, lesson-scoped matching |

**Issues found:** 22
---

## MODULE 9: Simulation and Emergency Review
**Lessons audited:** 8
**Total steps audited:** 63

### Lesson 1 — Team Debrief After Resuscitation (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | scenario_intro | ✅ PASS | None |
| Step 2 | flash_card | ✅ PASS | None |
| Step 3 | video | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 7 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 6 (cloze): No separate script field; clozeText is self-contained

### Lesson 2 — Discussing a Near-Miss with a Supervisor (heads_up)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | audio_shadow | ❌ FAIL | [CRITICAL] No playable audio: audioUrl=PLACEHOLDER, audio_url=PLACEHOLDER |
| Step 3 | video | ✅ PASS | None |
| Step 4 | flash_card | ✅ PASS | None |
| Step 5 | script_read | ✅ PASS | None |
| Step 6 | quiz | ✅ PASS | None |
| Step 7 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (audio_shadow): No playable audio: audioUrl=PLACEHOLDER, audio_url=PLACEHOLDER
- Step 7 (cloze): No separate script field; clozeText is self-contained

### Lesson 3 — Presenting a Case to the Ward Team (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | [INFO] Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ |
| Step 2 | audio_shadow | ❌ FAIL | [CRITICAL] No playable audio: audioUrl=PLACEHOLDER, audio_url=PLACEHOLDER |
| Step 3 | video | ✅ PASS | None |
| Step 4 | flash_card | ✅ PASS | None |
| Step 5 | script_read | ✅ PASS | None |
| Step 6 | quiz | ✅ PASS | None |
| Step 7 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 1 (flash_card): Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ
- Step 2 (audio_shadow): No playable audio: audioUrl=PLACEHOLDER, audio_url=PLACEHOLDER
- Step 7 (cloze): No separate script field; clozeText is self-contained

### Lesson 4 — Asking a Senior Colleague for Feedback (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | video | ✅ PASS | None |
| Step 3 | audio_shadow | ✅ PASS | [INFO] Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file) |
| Step 4 | flash_card | ✅ PASS | None |
| Step 5 | quiz | ✅ PASS | None |
| Step 6 | script_read | ✅ PASS | None |
| Step 7 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 3 (audio_shadow): Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)
- Step 7 (cloze): No separate script field; clozeText is self-contained

### Lesson 5 — Reflecting on a Difficult Handover (heads_down)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | video | ✅ PASS | None |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 6 — Pair Practice — Nurse to Supervisor Debrief (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | video | ✅ PASS | None |
| Step 3 | flash_card | ✅ PASS | None |
| Step 4 | script_read | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Lesson 7 — Pair Practice — Nurse to Nurse Case Presentation (heads_together)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | flash_card | ✅ PASS | None |
| Step 2 | script_read | ✅ PASS | None |
| Step 3 | video | ✅ PASS | None |
| Step 4 | flash_card | ✅ PASS | None |
| Step 5 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 6 | no_script | ✅ PASS | None |
| Step 7 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 8 | mission | ⚠️ WARN | [WARNING] Duplicate mission fields (missionEn vs mission_en) — conflicting content? |
| Step 9 | matching | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 5 (cloze): No separate script field; clozeText is self-contained
- Step 7 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text
- Step 8 (mission): Duplicate mission fields (missionEn vs mission_en) — conflicting content?

### Lesson 8 — Module Assessment — Debrief & Self-Reflection (assessment)
| Step | Type | Status | Issues |
|------|------|--------|--------|
| Step 1 | quiz | ✅ PASS | None |
| Step 2 | spot_the_mistake | ✅ PASS | [INFO] Uses original/corrected item schema (not mistake/correction); verify UI supports it |
| Step 3 | cloze | ✅ PASS | [INFO] No separate script field; clozeText is self-contained |
| Step 4 | drag_order | ✅ PASS | None |
| Step 5 | recording_submit | ✅ PASS | [INFO] Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text |
| Step 6 | matching | ✅ PASS | None |
| Step 7 | self_reflection | ✅ PASS | None |

**Summary of issues for this lesson:**
- Step 2 (spot_the_mistake): Uses original/corrected item schema (not mistake/correction); verify UI supports it
- Step 3 (cloze): No separate script field; clozeText is self-contained
- Step 5 (recording_submit): Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text

### Module Summary
| Severity | Count | Description |
|----------|-------|-------------|
| ❌ CRITICAL | 2 | Audio placeholders, wrong answer keys, mistranslations |
| ⚠️ WARNING | 1 | Rubric gaps, thin rubrics, VI quality, cloze/script |
| ℹ️ INFO | 15 | Minor capitalization, lesson-scoped matching |

**Issues found:** 18
---

## BATCH 3 CROSS-MODULE SUMMARY

Total across batch: 72 issues in 192 steps
CRITICAL: 10, WARNING: 10, INFO: 52
