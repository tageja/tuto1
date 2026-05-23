import { expect, test } from '@playwright/test';
import {
  EMERGENCY_COURSE_PATH,
  EMERGENCY_COURSE_TITLE,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #282 — Learner course detail shows modules', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(282)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('Emergency Nursing course shows title and module links', async ({ page }) => {
    await gotoLearner(page, EMERGENCY_COURSE_PATH);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await expect(page.locator('main h1').first()).toHaveText(EMERGENCY_COURSE_TITLE, {
      timeout: 60_000,
    });
    await expect(page.locator('main a[href*="/modules/"]').first()).toBeVisible();
  });
});
