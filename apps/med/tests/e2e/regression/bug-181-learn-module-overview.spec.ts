import { expect, test } from '@playwright/test';
import { attachConsoleHygiene } from '../_shared/auth-pages';
import {
  EMERGENCY_MODULE_1_PATH,
  assertNoNotFound,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #181 — module overview loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(181)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('module 1 lists lessons without 404', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    await gotoLearner(page, EMERGENCY_MODULE_1_PATH);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('main a[href*="/lessons/"]').first()).toBeVisible({ timeout: 60_000 });
    await assertNoNotFound(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
