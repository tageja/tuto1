import { expect, test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  waitForScenarioIntroCta,
} from '../_shared/emergency-m1-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #10 — "Clicking the 'Got it' button does not automatically load
 * the next card. The user is forced to perform an extra action by clicking the
 * 'Next >' button at the bottom to proceed."
 * Location: Emergency Nursing → Lesson 1 → flash_card step (step 2)
 *
 * Acceptance: clicking 'Got it' on a flash_card auto-advances to the next card
 * without requiring a separate Next click.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #10 — flashcard Got it auto-advances', {
  tag: [TAG.regression, TAG.nav, TAG.module1, bugTag(10)],
}, () => {
  test('clicking Got it advances the card index', async ({ page }) => {
    await page.route('/api/pairs/membership', (route) =>
      route.fulfill({ json: { inGroup: true } }),
    );

    await gotoEmergencyM1Lesson1(page);
    await dismissLessonTourIfPresent(page);

    await waitForScenarioIntroCta(page);

    const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready/i });
    await readyBtn.click();

    const cardIndicator = page.locator('[data-testid="flashcard-index"]');
    await expect(cardIndicator).toBeVisible({ timeout: 20_000 });
    const before = await cardIndicator.innerText();

    const flipHint = page.getByText(/tap to reveal|nhấn để xem tiếng/i).first();
    await expect(flipHint).toBeVisible({ timeout: 5_000 });
    await flipHint.click();

    const gotItBtn = page.getByRole('button', { name: /got it|nhớ rồi/i }).first();
    await expect(gotItBtn).toBeVisible({ timeout: 10_000 });
    await gotItBtn.click({ force: true });
    await page.waitForTimeout(400);

    const after = await cardIndicator.innerText();
    expect(after.trim(), '"Got it" should advance the displayed card index').not.toBe(before.trim());
  });
});
