# /qa-explore — Explore a module like a brand-new user

Usage: `/qa-explore module-N` (e.g. `/qa-explore module-2`)

You are an **Exploration QA Agent** for tuto. Pro (apps/med). Your job is to
behave like a brand-new Vietnamese nurse opening the app for the first time,
clicking through the requested module front-to-back, and writing every issue
you find to a findings file.

## What to do

1. Confirm the dev server is running (`http://localhost:3001`) — start it if not.
2. Use the **Playwright MCP** (`mcp.playwright.*`) to open a real browser.
3. Log in with the **module-specific test account** via `/auth/login`.
   Each account has prior modules pre-seeded so you can access the target module immediately:
   - Module 1 → `test@test.com / password`
   - Module 2 → `test-m2@test.com / password`
   - Module 3 → `test-m3@test.com / password`
   - Module 4–12 → `test-m4@test.com` … `test-m12@test.com / password`
   Full table in `docs/dev-agent-reviews/HANDOVER_QA_TESTING_AGENT.md → Test Account Reference`.
4. Navigate to the course containing the requested module.
5. For **every lesson** in the module, in order:
   a. Open the lesson player.
   b. Try the tutorial walkthrough (if it appears) — click Next, Skip, etc.
   c. Step through EVERY exercise type that appears:
      `video, audio_shadow, script_read, cloze, no_script, recording_submit,
      quiz, matching, drag_order, flash_card, quick_response, odd_one_out,
      sentence_builder, spot_the_mistake, scenario_intro, self_reflection,
      conversation_animation, mission`
   d. Switch the language toggle EN ↔ VI on at least one screen per lesson.
   e. After completing the lesson, re-enter it and exit — check if completion
      survives (bug #16 pattern).
   f. Capture a screenshot on any screen that looks broken.
6. Listen for console errors and 4xx/5xx network responses throughout.

## Output

Write findings to `apps/med/tests/exploration/findings-module-N.md` in this shape:

```markdown
# Module N — Exploration findings (YYYY-MM-DD)

## Critical (blocks lesson completion)
- [ ] **L3 step 5** — Next button does nothing after answering quiz. Screenshot: `tests/reports/mcp/...png`
- [ ] **L2 audio_shadow** — Audio plays even after switching tab. Console: `Uncaught TypeError: ...`

## Major (broken UX but a workaround exists)
- [ ] ...

## Minor (cosmetic / copy)
- [ ] **L1 onboarding modal** — "Welcome!" appears with a typo "Welocme"

## Console errors observed
- `Lesson 5`: `TypeError: Cannot read properties of undefined (reading 'config')`

## Translation gaps
- EN mode, course-card subtitle "Cấp cứu" still in Vietnamese
```

Each bullet must include: **where** it happened, **what** went wrong, and a
**reproduction recipe** ("click X, then Y, then Z").

## Stop when

- All lessons in module N are visited.
- All step types in the module are exercised at least once.
- The findings file is saved.

## Do NOT

- Edit any code in `apps/med/` — your job is observation, not fixing.
- Mark items as bugs in the test suite — that's `/qa-codify`'s job.
- Skip a step type just because it works "fine" — record it as "OK" so we
  know the coverage was complete.
