import { expect, test } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  stubPairsMembershipInGroup,
  waitForScenarioIntroCta,
} from '../_shared/emergency-m1-l1-flow';
import { learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #188 — lesson step progression smoke', {
  tag: [TAG.regression, TAG.learnerPages, TAG.module1, bugTag(188)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('M1 L1 advances through at least two steps', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await dismissLessonTourIfPresent(page);
    await waitForScenarioIntroCta(page);
    const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });
    await readyBtn.click();

    const nextBtn = page.getByRole('button', { name: /tiếp|next|continue/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 45_000 });
    const stepOneMain = await page.locator('main').innerText();
    await nextBtn.click();
    await page.waitForTimeout(800);
    const stepTwoMain = await page.locator('main').innerText();
    expect(stepTwoMain.length).toBeGreaterThan(0);
    expect(stepTwoMain).not.toEqual(stepOneMain);
  });
});
