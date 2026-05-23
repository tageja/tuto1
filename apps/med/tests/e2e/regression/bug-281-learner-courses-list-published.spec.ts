import { expect, test } from '@playwright/test';
import {
  EMERGENCY_COURSE_PATH,
  EMERGENCY_COURSE_TITLE,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #281 — Published course in learner catalogue', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(281)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('Emergency Nursing Communication card shows title and module hint', async ({ page }) => {
    await gotoLearner(page, '/learn/courses');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await page.waitForResponse((r) => /\/api\/courses/.test(r.url()) && r.status() === 200, {
      timeout: 90_000,
    }).catch(() => {});

    const emergencyCard = page
      .locator('[data-testid="course-card"]')
      .filter({ hasText: EMERGENCY_COURSE_TITLE });
    await expect(emergencyCard).toBeVisible({ timeout: 60_000 });
    await expect(emergencyCard.locator(`a[href="${EMERGENCY_COURSE_PATH}"]`)).toBeVisible();

    const cardText = await emergencyCard.innerText();
    expect(cardText.length).toBeGreaterThan(20);
    expect(
      /A1|A2|B1|B2|module|bài|lesson|khóa|nursing|điều dưỡng/i.test(cardText),
    ).toBeTruthy();
  });
});
