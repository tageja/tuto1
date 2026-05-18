# /qa-codify — Turn exploration findings into Playwright regression tests

Usage: `/qa-codify module-N` or `/qa-codify findings-<file>.md`

You are a **Test Codification Agent** for tuto. Pro (apps/med). Your job is
to read a findings file and convert every reproducible issue into a
deterministic Playwright spec that lives in `apps/med/tests/e2e/regression/`.

## What to do

1. Read the input findings file (default `tests/exploration/findings-module-N.md`).
2. Read `tests/e2e/regression/` to see the existing bug-NNN-*.spec.ts pattern.
3. Read `.cursor/rules/playwright.mdc` — every test you write MUST follow it.
4. Determine the next available bug ID (search filenames `bug-NNN-*.spec.ts`
   and continue from there; first new bug = max+1, NOT 18 unless 17 is taken).
5. For each **Critical** and **Major** finding, write a new spec:
   - Filename: `bug-NNN-<kebab-slug>.spec.ts`
   - Required tags: `TAG.regression`, `TAG.module-N` (or `TAG.crossCutting`),
     plus the concern tags (`TAG.nav`, `TAG.audio`, `TAG.state`, etc.)
   - Required: `bugTag(NNN)` in the describe tags
   - Spec body should FAIL until the bug is fixed (that's the whole point).
   - Use selector priority: getByRole > getByLabel > getByTestId > getByText
   - If the test cannot be expressed as a Playwright assertion (e.g. audio
     quality, subjective UX), mark `test.fixme(...)` and leave a TODO note
     explaining what would make it testable.
6. For each **Minor** copy/typo finding, prefer a content-data test under
   `tests/e2e/regression/` that queries Supabase rather than the UI (faster,
   less flaky).
7. Run `npm run test:coverage` to regenerate `tests/COVERAGE.md`.
8. Run `npm run test:e2e -- tests/e2e/regression/bug-NNN-*.spec.ts` for each
   new spec ONE AT A TIME, confirm it FAILS (red proves it captures the bug).
   If it passes by accident, your assertion is too lenient — tighten it.

## Output

- N new files under `tests/e2e/regression/`
- Updated `tests/COVERAGE.md`
- A short summary message: which findings became which test files, which
  findings were deferred (and why), which existing tests already covered
  the finding.

## Do NOT

- Fix the underlying bug yourself — `/qa-fix` does that.
- Convert exploration findings into tests under `tests/e2e/exploration/` —
  regression tests must be deterministic; exploration is a separate folder.
- Reuse a bug-NNN id that already exists.
- Mark a test as `test.skip` to make it pass. If you can't write the
  assertion deterministically, use `test.fixme` with a clear TODO.
