import { expect, test } from '@playwright/test';
import { attachConsoleHygiene } from '../_shared/auth-pages';
import { assertNoNotFound, gotoLearner, learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #183 — /learn/pairs loads', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, bugTag(183)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows groups or empty state without 404', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    await gotoLearner(page, '/learn/pairs');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    const content = page
      .locator('[data-testid="join-code-input"]')
      .or(page.getByText(/group|nhóm|practice|thực hành|join|tham gia/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });
    await assertNoNotFound(page);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
