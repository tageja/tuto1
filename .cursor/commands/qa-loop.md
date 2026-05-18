# /qa-loop — Full explore → codify → triage → fix → re-test cycle

Usage: `/qa-loop module-N` (e.g. `/qa-loop module-2`)

You are the **QA Loop Orchestrator** for tuto. Pro (apps/med). Your job is
to drive the four sub-commands in order until module N is fully green or
you hit a blocker that requires human input.

## The loop

1. **EXPLORE** — `/qa-explore module-N`
   → writes `tests/exploration/findings-module-N.md`

2. **CODIFY** — `/qa-codify module-N`
   → writes new `tests/e2e/regression/bug-NNN-*.spec.ts` files
   → updates `tests/COVERAGE.md`

3. **RUN** — execute the full suite for the module:
   ```bash
   cd apps/med && npm run test:e2e -- --grep @module-N
   ```

4. **TRIAGE** — `/qa-triage`
   → writes `tests/reports/triage-YYYY-MM-DD.md`

5. **FIX** — for each REAL_BUG in the triage report (in id order):
   - `/qa-fix bug-N`
   - Stop immediately if a fix takes >30 min or requires a product decision
     (e.g. bug #15 needs VAD; bug #5 needs A1→A2 unlock rule confirmation)

6. **REGRESSION SWEEP** — re-run the FULL suite (all modules, not just N):
   ```bash
   npm run test:e2e
   ```
   Any new failures → loop back to TRIAGE.

7. **CLOSE OUT** — when the suite is green for module N:
   - Update the agent table in `apps/med/docs/dev-agent-reviews/HANDOVER_NurseEd_ORCHESTRATOR_AGENT.md`
   - Append one line to the orchestrator log:
     `| YYYY-MM-DD | (qa-loop) | Module N closed: K bugs found, J fixed, L deferred (reason). |`

## Stop conditions

Stop and report to the user when ANY of these happen:

- A fix requires a product decision (e.g. course unlock rule)
- A fix requires adding a new npm dependency
- A fix would touch `src/` or `functions/`
- The regression sweep reveals a failure in a module OTHER than N (potential
  shared-code regression — don't proceed without human triage)
- 3 fix attempts in a row don't turn the spec green

## Default behaviour

- Run `--grep @module-N` first, NOT the full suite, to keep iteration fast.
- Use parallel workers (`--workers=2`) — the smoke + regression suite is
  parallel-safe.
- Push to `agent-x-integration` ONLY when the module-N suite + the full
  smoke suite are both green; never push red.

## Do NOT

- Skip the regression sweep step.
- Bypass the orchestrator handover update.
- Promote a build to production — that's manual (`vercel promote` after the
  user signs off).
