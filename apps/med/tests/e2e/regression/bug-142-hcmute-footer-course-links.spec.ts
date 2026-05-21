import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots, setLanguage } from '../_shared/hcmute-home';

test.describe('Bug #142 — HCMUTE footer course sub-links', {
  tag: [TAG.regression, TAG.hcmute, TAG.nav, bugTag(142)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Emergency Nursing and HCMUTE Pilot links exist with correct hrefs', async ({ page }) => {
    const emergency = page.getByRole('link', { name: /Emergency Nursing|Điều dưỡng Cấp cứu/i });
    const pilot = page.getByRole('link', { name: 'HCMUTE Pilot' });

    await emergency.scrollIntoViewIfNeeded();
    await expect(emergency).toHaveAttribute('href', '/learn/courses/emergency-nursing-communication');
    await expect(pilot).toHaveAttribute('href', '/#hcmute-pilot');
  });

  test('HCMUTE Pilot link scrolls #hcmute-pilot into view', async ({ page }) => {
    await page.getByRole('link', { name: 'HCMUTE Pilot' }).click();
    const target = page.locator('#hcmute-pilot');
    await expect(target).toBeInViewport();
  });

  test('footer course labels switch in VI mode', async ({ page }) => {
    await setLanguage(page, 'vi');
    await expect(page.getByRole('link', { name: /Điều dưỡng Cấp cứu/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HCMUTE Pilot' })).toBeVisible();
  });
});
