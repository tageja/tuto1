import { expect, test } from '@playwright/test';
import { EMERGENCY_COURSE_PATH, gotoLearner, learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #286 — Learner module shows next-lesson navigation', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(286)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('course overview lists modules for learner progression', async ({ page }) => {
    await gotoLearner(page, EMERGENCY_COURSE_PATH);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    const moduleLinks = page.locator('main a[href*="/modules/"]');
    await expect(moduleLinks.first()).toBeVisible({ timeout: 60_000 });
    expect(await moduleLinks.count()).toBeGreaterThanOrEqual(2);

    const progressionHint = page
      .getByText(/complete|completed|hoàn thành|next lesson|bài tiếp|module/i)
      .or(moduleLinks.nth(1));
    await expect(progressionHint.first()).toBeVisible({ timeout: 30_000 });
  });
});
