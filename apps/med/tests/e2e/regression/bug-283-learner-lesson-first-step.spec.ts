import { expect, test } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  stubPairsMembershipInGroup,
} from '../_shared/emergency-m1-l1-flow';
import { learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #283 — Learner opens lesson and sees first step', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(283)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('M1 L1 loads first step with navigation controls', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await dismissLessonTourIfPresent(page);

    const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });
    const counter = page.locator('[data-tour-target="lesson-step-counter"]');
    const navBtn = page.getByRole('button', { name: /tiếp|next|continue/i }).first();

    await expect(readyBtn.or(counter).or(navBtn).first()).toBeVisible({ timeout: 60_000 });

    if (await readyBtn.isVisible().catch(() => false)) {
      await readyBtn.click();
    }

    await expect(counter).toBeVisible({ timeout: 15_000 });
    await expect(navBtn).toBeVisible();
  });
});
