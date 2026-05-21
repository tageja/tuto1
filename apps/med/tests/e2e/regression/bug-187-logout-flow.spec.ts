import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import {
  gotoLearner,
  learnerAuthFile,
  openLearnerSidebarIfMobile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #187 — logout returns to public page', {
  tag: [TAG.regression, TAG.learnerPages, TAG.auth, TAG.nav, bugTag(187)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('sidebar sign-out clears session and blocks /learn', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — logout not enforced');

    await gotoLearner(page, '/learn');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    const logoutBtn = page
      .locator('aside')
      .getByRole('button', { name: /log\s*out|sign\s*out|đăng\s*xuất/i })
      .first();
    await openLearnerSidebarIfMobile(page);
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/\/(auth\/login)?$/, { timeout: 15_000 });

    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
