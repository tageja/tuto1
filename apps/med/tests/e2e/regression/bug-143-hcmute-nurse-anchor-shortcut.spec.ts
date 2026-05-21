import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots, setLanguage } from '../_shared/hcmute-home';

test.describe('Bug #143 — HCMUTE nurse anchor shortcut', {
  tag: [TAG.regression, TAG.hcmute, TAG.nav, bugTag(143)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('nurse link scrolls #nursing-course emergency card into view (EN)', async ({ page }) => {
    await setLanguage(page, 'en');
    const link = page.getByRole('link', { name: /For nurses/i });
    await expect(link).toHaveAttribute('href', '#nursing-course');
    await link.click();

    const card = page.locator('#nursing-course');
    await expect(card).toBeInViewport();
    await expect(card.getByRole('heading', { level: 3 })).toContainText(/Emergency Nursing Communication/i);
  });

  test('nurse link targets emergency card title in VI', async ({ page }) => {
    await setLanguage(page, 'vi');
    await page.getByRole('link', { name: /Điều dưỡng/i }).first().click();
    const card = page.locator('#nursing-course');
    await expect(card).toBeInViewport();
    const heading = await card.getByRole('heading', { level: 3 }).innerText();
    expect(/Giao Tiếp Điều Dưỡng|Cấp cứu/i.test(heading)).toBe(true);
  });
});
