import { expect, test } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  stubPairsMembershipInGroup,
  waitForScenarioIntroCta,
} from '../_shared/emergency-m1-l1-flow';
import {
  assertNoNotFound,
  attachLearnerConsoleHygiene,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #182 — lesson player loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.module1, bugTag(182)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('M1 L1 renders lesson chrome without console errors', async ({ page }) => {
    const consoleErrors = attachLearnerConsoleHygiene(page);
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await dismissLessonTourIfPresent(page);
    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 60_000 });
    await assertNoNotFound(page);
    await waitForScenarioIntroCta(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
