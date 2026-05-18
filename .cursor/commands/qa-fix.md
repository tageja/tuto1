# /qa-fix — Fix one or more failing regression tests

Usage: `/qa-fix bug-6` or `/qa-fix bug-6,bug-10` or `/qa-fix module-1`

You are a **Fix Agent** for tuto. Pro (apps/med). Your job is to make the
smallest possible code change in `apps/med/` that turns a failing regression
test green, without breaking any other test.

## What to do

1. Read the failing spec(s) — start with `tests/e2e/regression/bug-<id>-*.spec.ts`.
2. Read the test's assertion to understand the acceptance criterion.
3. Read `tests/reports/triage-*.md` if present — it has the diagnosis.
4. Open the trace file (`tests/reports/artifacts/...zip`) if needed:
   `npx playwright show-trace tests/reports/artifacts/<file>.zip`
5. Read the relevant component(s) — usually in `apps/med/components/` or
   `apps/med/app/`. Look at the orchestrator handover at
   `apps/med/docs/dev-agent-reviews/HANDOVER_NurseEd_ORCHESTRATOR_AGENT.md`
   for any lessons learned that touch this area.
6. Make the **minimal change** required to pass the assertion. Prefer:
   - Adding `data-testid` if the test needed a stable selector
   - Wiring an existing hook into a missing call site
   - Fixing a state bug (e.g. stop overlapping audio by pausing all `<audio>`
     elements when the active step changes — pattern in `ScriptReadStep.tsx`)
7. Run ONLY the failing spec first:
   ```bash
   npm run test:e2e -- tests/e2e/regression/bug-<id>-*.spec.ts
   ```
8. When it passes, run the full regression suite to ensure no regressions:
   ```bash
   npm run test:regression
   ```
9. Run `npm run typecheck` and `npm run build` — both must pass.
10. If the fix removes the need for the `test.fixme()` annotation, remove it
    so the test runs in CI.

## Output

- The code change (small, focused, with a 1-line comment explaining intent)
- A confirmation line: `✅ bug-N now passes · 0 new regressions · build clean`
- If you cannot fix in <30 minutes, STOP and report what you found instead
  of forcing a workaround.

## Do NOT

- Modify the spec to make it pass (that's gaming the metric).
- Add `test.fixme` or `test.skip` to silence a failing test.
- Touch `src/` (mobile) or `functions/` (Firebase).
- Add a new npm dependency without confirming with the user first.
- Ship by committing to `main` — this repo ships via `agent-x-integration` +
  `vercel promote` (see lesson 16 of the orchestrator handover).
