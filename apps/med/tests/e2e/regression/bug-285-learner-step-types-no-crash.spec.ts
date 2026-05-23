import { expect, test } from '@playwright/test';
import { EMERGENCY_M2_LESSON_1_PATH } from '../_shared/emergency-m2-l1-flow';
import { dismissLessonTourIfPresent, stubPairsMembershipInGroup } from '../_shared/emergency-m1-l1-flow';
import { learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

const LESSON_PATHS = [
  '/learn/courses/emergency-nursing-communication/lessons/whats-happening-first-words-in-an-emergency',
  EMERGENCY_M2_LESSON_1_PATH,
  '/learn/courses/emergency-nursing-communication/lessons/safety-first-giving-urgent-instructions',
];

test.describe('Bug #285 — Different step types render without crashing', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(285)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('lessons 1–3 each show interactive main content', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    for (const lessonPath of LESSON_PATHS) {
      await page.goto(lessonPath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      if (page.url().includes('/auth/login')) {
        test.skip(true, 'learner auth file expired');
      }

      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 60_000 });
      await dismissLessonTourIfPresent(page);

      const interactive = page
        .locator('main button, main a[href], main input, main textarea, main [role="button"]')
        .first();
      const hasCta = await page
        .getByRole('button', { name: /sẵn sàng|ready|Tôi đã|tiếp|next|continue/i })
        .first()
        .isVisible({ timeout: 20_000 })
        .catch(() => false);

      expect(hasCta || (await interactive.isVisible().catch(() => false))).toBeTruthy();
      await expect(page.locator('main')).not.toContainText(/something went wrong|đã xảy ra lỗi/i);
    }
  });
});
