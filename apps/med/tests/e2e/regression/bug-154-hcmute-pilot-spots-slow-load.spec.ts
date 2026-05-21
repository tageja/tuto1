import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpotsDelay } from '../_shared/hcmute-home';

test.describe('Bug #154 — HCMUTE slow pilot-spots load', {
  tag: [TAG.regression, TAG.hcmute, TAG.data, bugTag(154)],
}, () => {
  test('hero still renders during 3s pilot-spots delay then updates badge', async ({ page }) => {
    await mockPilotSpotsDelay(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false }, 3000);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /45 spots left|suất còn lại/i })).toBeVisible({ timeout: 10_000 });
  });
});
