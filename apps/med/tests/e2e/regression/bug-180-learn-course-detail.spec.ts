import { expect, test } from '@playwright/test';
import { attachConsoleHygiene } from '../_shared/auth-pages';
import {
  EMERGENCY_COURSE_PATH,
  assertNoNotFound,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #180 — course detail loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(180)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('emergency nursing course shows title and modules', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    await gotoLearner(page, EMERGENCY_COURSE_PATH);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 60_000 });
    const moduleLink = page.locator('main a[href*="/modules/"]').first();
    await expect(moduleLink).toBeVisible();
    await expect(moduleLink).toBeEnabled();
    await assertNoNotFound(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
