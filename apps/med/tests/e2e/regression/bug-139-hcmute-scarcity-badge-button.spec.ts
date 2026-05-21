import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  heroScarcityBadge,
  mockPilotSpots,
} from '../_shared/hcmute-home';

test.describe('Bug #139 — HCMUTE hero scarcity badge opens enrollment', {
  tag: [TAG.regression, TAG.hcmute, TAG.nav, bugTag(139)],
}, () => {
  test('scarcity badge is a button showing spots left and opens then closes modal', async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const badge = heroScarcityBadge(page);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(/45.*(spots left|suất còn lại)/i);

    const tagName = await badge.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');

    await badge.click();
    await expect(enrollmentModal(page)).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: /Technical Project|Thuyết Trình/i })).toBeVisible();

    await page.getByRole('button', { name: /Close|Đóng/i }).click();
    await expect(enrollmentModal(page)).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
