import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #158 — /pitchdeck loads without blank page or console errors', {
  tag: [TAG.regression, TAG.publicPages, bugTag(158)],
}, () => {
  test('GET /pitchdeck is non-empty', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto('/pitchdeck', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.getByText(/tuto\.\s*Pro Pitch Deck/i).first()).toBeVisible();
    const hasIframe = await page.locator('iframe[title*="Pitch Deck" i], iframe[src*="pitchdeck.pdf"]').count();
    const hasMobileCard = await page.getByRole('link', { name: /open.*pdf|download pdf/i }).count();
    expect(hasIframe + hasMobileCard).toBeGreaterThan(0);

    expect(errors, `pageerror: ${errors.join('; ')}`).toEqual([]);
  });
});
