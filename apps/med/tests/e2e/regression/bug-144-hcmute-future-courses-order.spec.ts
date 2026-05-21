import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import { mockPilotSpots, setLanguage } from '../_shared/hcmute-home';

test.describe('Bug #144 — HCMUTE future courses order and content', {
  tag: [TAG.regression, TAG.hcmute, TAG.content, bugTag(144)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 0, total: 50, spotsLeft: 50, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('three future course cards in correct order with content (EN)', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.getByRole('heading', { name: /Vote by registering your interest/i }).scrollIntoViewIfNeeded();

    const section = page.locator('section').filter({
      has: page.getByRole('heading', { name: /Vote by registering your interest/i }),
    });
    const cards = section.locator('article');
    await expect(cards).toHaveCount(3);

    const titles = await cards.locator('h3').allTextContents();
    expect(titles[0]).toMatch(/Workplace English/i);
    expect(titles[1]).toMatch(/Internship Interviews/i);
    expect(titles[2]).toMatch(/Technical Reports/i);

    for (const card of await cards.all()) {
      await expect(card.locator('p').first()).not.toBeEmpty();
      const outcomeRows = card.locator('.border-y .flex.items-center.gap-2');
      const count = await outcomeRows.count();
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('future course titles switch to Vietnamese', async ({ page }) => {
    await setLanguage(page, 'vi');
    await page.getByRole('heading', { name: /Bình chọn bằng cách đăng ký/i }).scrollIntoViewIfNeeded();

    await expect(page.getByRole('heading', { name: /Tiếng Anh Công Sở Cho Fresher/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tiếng Anh Phỏng Vấn Thực Tập/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tiếng Anh Kỹ Thuật/i })).toBeVisible();
  });
});
