import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  heroPilotCta,
  heroScarcityBadge,
  mockPilotSpots,
  openEnrollmentViaHeroCta,
} from '../_shared/hcmute-home';

test.describe('Bug #145 — HCMUTE mobile viewport smoke', {
  tag: [TAG.regression, TAG.hcmute, TAG.visual, bugTag(145)],
}, () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile layout: no horizontal scroll, CTA and badge visible, footer stacks, modal usable', async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    const cta = heroPilotCta(page);
    await expect(cta).toBeVisible();
    await expect(cta).toBeInViewport();
    await expect(heroScarcityBadge(page)).toBeVisible();

    const footerGrid = page.locator('footer .grid');
    await footerGrid.scrollIntoViewIfNeeded();
    const footerBox = await footerGrid.boundingBox();
    expect(footerBox?.width).toBeLessThanOrEqual(390 + 8);

    await openEnrollmentViaHeroCta(page);
    const modal = enrollmentModal(page);
    await expect(modal).toBeVisible();
    await expect(page.getByLabel(/Full name|Họ và tên/i)).toBeInViewport();
    await expect(page.getByLabel(/^Email$/i)).toBeInViewport();
  });
});
