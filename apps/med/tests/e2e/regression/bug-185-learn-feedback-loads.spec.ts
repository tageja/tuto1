import { expect, test } from '@playwright/test';
import { attachConsoleHygiene } from '../_shared/auth-pages';
import { assertNoNotFound, gotoLearner, learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #185 — /learn/feedback loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(185)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows feedback history or empty state', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    await gotoLearner(page, '/learn/feedback');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await page.waitForResponse((r) => /\/api\/feedback/.test(r.url()), {
      timeout: 90_000,
    }).catch(() => {});

    const feedbackUi = page.locator('main').getByText(/feedback|phản hồi|bug|góp ý|no feedback|chưa có/i);
    await expect(feedbackUi.first()).toBeVisible({ timeout: 60_000 });
    await assertNoNotFound(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
