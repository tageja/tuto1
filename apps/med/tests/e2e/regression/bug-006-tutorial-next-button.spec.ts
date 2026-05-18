import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #6 — "When entering a lesson from the Practice Group, a tutorial
 * walkthrough popup appears. In the lesson tutorial walkthrough popup, the 'Next'
 * button is completely unresponsive, preventing users from proceeding to the next
 * onboarding steps, causing them to get stuck on this screen. However, the Skip
 * button still functions normally to close the popup"
 * Location: Practice Group / My Course → lesson player → react-joyride tour
 *
 * Acceptance: when the tour appears, clicking 'Next' advances tour step index.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #6 — lesson tour Next button advances steps', {
  tag: [TAG.regression, TAG.nav, TAG.module1, bugTag(6)],
}, () => {
  test.fixme('clicking tour Next advances to step 2', async ({ page }) => {
    await page.goto('/learn/courses');
    await page.getByRole('link', { name: /emergency|cấp cứu/i }).first().click();
    const firstLesson = page.getByRole('link', { name: /lesson|bài/i }).first();
    if (await firstLesson.isVisible()) await firstLesson.click();

    const tourPanel = page.locator('.react-joyride__tooltip, [data-testid="tour-tooltip"]');
    await expect(tourPanel).toBeVisible({ timeout: 5_000 });

    const stepCounter = page.locator('[data-tour-step]').first();
    const stepBefore = await stepCounter.getAttribute('data-tour-step').catch(() => null);

    const nextBtn = tourPanel.getByRole('button', { name: /next|tiếp|continue/i });
    await nextBtn.click();
    await page.waitForTimeout(400);

    const stepAfter = await stepCounter.getAttribute('data-tour-step').catch(() => null);
    expect(stepAfter, 'Next button must change the tour step').not.toBe(stepBefore);
  });
});
