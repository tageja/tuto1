import { expect, test } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  stubPairsMembershipInGroup,
} from '../_shared/emergency-m1-l1-flow';
import { learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

function parseLessonStepNumber(text: string): number {
  const match = text.match(/(?:bước|step)\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

test.describe('Bug #284 — Learner advances through three steps', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.learner, TAG.learnerPages, bugTag(284)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('step counter advances without crash on M1 L1', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await dismissLessonTourIfPresent(page);

    const counter = page.locator('[data-tour-target="lesson-step-counter"]');
    await expect(counter).toBeVisible({ timeout: 30_000 });
    const stepOneNum = parseLessonStepNumber(await counter.innerText());
    const mainBefore = await page.locator('main').innerText();

    const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });
    if (await readyBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await readyBtn.click();
      await page.waitForTimeout(400);
    }

    for (let i = 0; i < 6; i++) {
      const action = page
        .getByRole('button', {
          name: /^next$|tiếp theo|^tiếp$|continue|finish|hoàn thành|đã xem/i,
        })
        .first();
      if (!(await action.isVisible({ timeout: 4_000 }).catch(() => false))) break;
      await action.click();
      await page.waitForTimeout(500);
    }

    const stepAfterNum = parseLessonStepNumber(await counter.innerText());
    const mainAfter = await page.locator('main').innerText();

    expect(stepAfterNum > stepOneNum || mainAfter !== mainBefore).toBeTruthy();
    await expect(page.locator('main')).not.toContainText(/something went wrong|đã xảy ra lỗi/i);
  });
});
