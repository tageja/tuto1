import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #8 — "There is an 'Invite a Colleague' section that provides a
 * code to share, but there is no corresponding input field or button for other
 * users to paste/enter that code to join the group"
 * Location: Practice Group (/learn/pairs)
 *
 * Acceptance: /learn/pairs has BOTH an "invite code" share affordance AND a
 * "join with code" input (data-testid="join-code-input").
 *
 * Fix: the join form was implemented in OnboardingSection (shown when the user
 * is not yet in a group). We mock /api/pairs to guarantee the "not in group"
 * state so the join form is always visible in this test.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #8 — pairs page has a join-with-code input', {
  tag: [TAG.regression, TAG.nav, TAG.crossCutting, bugTag(8)],
}, () => {
  test('/learn/pairs shows an input to enter an invite code', async ({ page }) => {
    // Ensure user appears to not be in any group so the OnboardingSection renders
    await page.route('/api/pairs', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/learn/pairs', { waitUntil: 'domcontentloaded', timeout: 120_000 });

    const joinInput = page.locator('[data-testid="join-code-input"]');
    if (!(await joinInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
    }

    await expect(joinInput).toBeVisible({ timeout: 30_000 });
  });
});
