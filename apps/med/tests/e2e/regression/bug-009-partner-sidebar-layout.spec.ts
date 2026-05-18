import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #9 — "The partner layout in the sidebar is visually broken. The
 * vertical dividers create three sections, but two of them are empty, making
 * the layout look incomplete or missing data. Additionally, the 'chir' logo
 * is way too small, making the sub-text underneath completely unreadable."
 * Location: "IN PARTNERSHIP WITH" section in sidebar
 *
 * Acceptance:
 *   - Either remove the empty divider sections, OR fill them with content.
 *   - The partner logo image rendered height must be >= 32px (readable subtext).
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #9 — partner sidebar layout is not broken', {
  tag: [TAG.regression, TAG.visual, TAG.crossCutting, bugTag(9)],
}, () => {
  test('partner logo renders at least 32px tall', async ({ page }) => {
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    const partnerSection = page.getByText(/partnership|đối tác/i).locator('..');
    await expect(partnerSection).toBeVisible();
    const logo = partnerSection.locator('img, svg').first();
    const box = await logo.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
  });
});
