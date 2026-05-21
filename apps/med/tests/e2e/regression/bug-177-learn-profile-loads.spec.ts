import { expect, test } from '@playwright/test';
import { attachConsoleHygiene } from '../_shared/auth-pages';
import {
  assertNoNotFound,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #177 — /learn/profile loads without 404', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(177)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('authenticated profile shows stats and no 404', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    const response = await page.goto('/learn/profile', {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    expect(response?.status()).toBe(200);
    await assertNoNotFound(page);
    await expect(page.locator('[data-testid="profile-completed-count"]')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('main').getByText(/learner|điều dưỡng|profile|hồ sơ/i).first()).toBeVisible();
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
