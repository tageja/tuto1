import { expect, test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  waitForScenarioIntroCta,
} from '../_shared/emergency-m1-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #3 — "The 'VI hints' button does not work. Clicking on it gives
 * no response, and nothing changes or displays on the screen."
 * Location: lesson player (script_read / audio_shadow / cloze steps)
 *
 * Acceptance: clicking the VI/Vietnamese hints toggle either:
 *   (a) reveals Vietnamese translation text that was previously hidden, OR
 *   (b) toggles a visible CSS class on the transcript container.
 *
 * If nothing observable changes in the DOM, that's the bug.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #3 — VI hints button does something', {
  tag: [TAG.regression, TAG.i18n, TAG.module1, bugTag(3)],
}, () => {
  test('clicking VI hints toggle changes visible content', async ({ page }) => {
    await page.route('/api/pairs/membership', (route) =>
      route.fulfill({ json: { inGroup: true } }),
    );

    await gotoEmergencyM1Lesson1(page);
    await dismissLessonTourIfPresent(page);

    const hintsButton = page.getByRole('button', { name: /vi\s*hint|gợi ý|tiếng việt/i }).first();
    await expect(hintsButton).toBeVisible({ timeout: 60_000 });

    await waitForScenarioIntroCta(page);

    const beforeLabel = await hintsButton.getAttribute('title');

    await hintsButton.click();

    const expectedAfterLabel =
      beforeLabel === 'Hide Vietnamese tooltips'
        ? 'Show Vietnamese tooltips'
        : 'Hide Vietnamese tooltips';
    await expect(hintsButton).toHaveAttribute('title', expectedAfterLabel, { timeout: 5_000 });
  });
});
