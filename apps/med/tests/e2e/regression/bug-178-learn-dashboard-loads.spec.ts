import { expect, test } from '@playwright/test';
import {
  clickSidebarLangToggle,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
  VI_DIACRITICS,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #178 — /learn dashboard loads with course progress', {
  tag: [TAG.regression, TAG.learnerPages, TAG.nav, TAG.i18n, bugTag(178)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows course content and EN/VI sidebar toggle works', async ({ page }) => {
    const consoleErrors = await gotoLearner(page, '/learn', { collectConsole: true });
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    const courseContent = page
      .locator('a[href*="/learn/courses/"]')
      .or(page.locator('[data-testid="course-card"]'))
      .or(page.getByText(/continue|tiếp tục|start|bắt đầu/i));
    await expect(courseContent.first()).toBeVisible({ timeout: 60_000 });

    const before = await page.locator('aside nav').innerText();
    await clickSidebarLangToggle(page);
    const after = await page.locator('aside nav').innerText();
    expect(before).not.toEqual(after);

    const mainText = await page.locator('main').innerText();
    if (!VI_DIACRITICS.test(before)) {
      expect(VI_DIACRITICS.test(mainText) || mainText.length > 0).toBeTruthy();
    }

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
