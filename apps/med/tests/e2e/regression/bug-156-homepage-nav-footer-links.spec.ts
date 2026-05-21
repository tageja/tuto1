import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { assertNot404, mockPilotSpots } from '../_shared/public-pages';

test.describe('Bug #156 — homepage LandingNav and LandingFooter links resolve', {
  tag: [TAG.regression, TAG.publicPages, TAG.nav, bugTag(156)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('every nav and footer link avoids 404', async ({ page }) => {
    const chrome = page.locator('nav').first().or(page.locator('footer'));
    const links = page.locator('nav a[href], footer a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);

    const seen = new Set<string>();
    for (let i = 0; i < count; i += 1) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href === '#') continue;
      const key = href;
      if (seen.has(key)) continue;
      seen.add(key);

      await link.scrollIntoViewIfNeeded();
      await link.click();
      await page.waitForLoadState('domcontentloaded');
      await assertNot404(page);

      if (href === '/#hcmute-pilot') {
        await expect(page.locator('#hcmute-pilot')).toBeInViewport();
      }

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(chrome.first()).toBeVisible();
    }
  });

  test('footer Emergency Nursing and HCMUTE Pilot hrefs are correct', async ({ page }) => {
    const emergency = page.locator('footer').getByRole('link', { name: /Emergency Nursing|Điều dưỡng Cấp cứu/i });
    const pilot = page.locator('footer').getByRole('link', { name: 'HCMUTE Pilot' });
    await expect(emergency).toHaveAttribute('href', '/learn/courses/emergency-nursing-communication');
    await expect(pilot).toHaveAttribute('href', '/#hcmute-pilot');
  });
});
