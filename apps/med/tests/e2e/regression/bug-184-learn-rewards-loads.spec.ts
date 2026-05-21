import { expect, test } from '@playwright/test';
import {
  assertNoNotFound,
  attachLearnerConsoleHygiene,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #184 — /learn/rewards loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(184)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows balance or rewards UI without JS errors', async ({ page }) => {
    const consoleErrors = attachLearnerConsoleHygiene(page);
    await gotoLearner(page, '/learn/rewards');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await page.waitForResponse((r) => /\/api\/rewards\/balance/.test(r.url()), {
      timeout: 90_000,
    }).catch(() => {});

    const rewardsChrome = page.locator('main').getByText(/star|sao|reward|phần thưởng|streak|chuỗi/i);
    await expect(rewardsChrome.first()).toBeVisible({ timeout: 60_000 });
    await assertNoNotFound(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
