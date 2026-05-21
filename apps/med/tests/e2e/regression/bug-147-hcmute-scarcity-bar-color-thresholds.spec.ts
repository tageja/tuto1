import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots, type PilotSpotsPayload } from '../_shared/hcmute-home';

async function barColor(page: import('@playwright/test').Page) {
  return page.locator('#hcmute-pilot .h-full.rounded-full').evaluate((el) => {
    const node = el as HTMLElement;
    return node.style.backgroundColor || getComputedStyle(node).backgroundColor;
  });
}

test.describe('Bug #147 — HCMUTE featured pilot progress bar colors', {
  tag: [TAG.regression, TAG.hcmute, TAG.visual, bugTag(147)],
}, () => {
  const cases: { name: string; data: PilotSpotsPayload; expected: string; pulse?: boolean }[] = [
    { name: '10% filled (green)', data: { taken: 5, total: 50, spotsLeft: 45, isFull: false }, expected: 'rgb(52, 211, 153)' },
    { name: '70% filled (orange)', data: { taken: 35, total: 50, spotsLeft: 15, isFull: false }, expected: 'rgb(249, 115, 22)' },
    { name: '92% filled (red + pulse)', data: { taken: 46, total: 50, spotsLeft: 4, isFull: false }, expected: 'rgb(239, 68, 68)', pulse: true },
  ];

  for (const { name, data, expected, pulse } of cases) {
    test(name, async ({ page }) => {
      await mockPilotSpots(page, data);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('#hcmute-pilot').scrollIntoViewIfNeeded();

      await expect.poll(() => barColor(page)).toBe(expected);

      if (pulse) {
        const badge = page.locator('#hcmute-pilot').getByText(/Almost full|Sắp hết|left/i).first();
        await expect(badge).toHaveClass(/animate-pulse/);
      }
    });
  }
});
