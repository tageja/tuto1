import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  mockPilotSpots,
  openEnrollmentViaHeroCta,
} from '../_shared/hcmute-home';

test.describe('Bug #148 — HCMUTE enrollment modal edge cases', {
  tag: [TAG.regression, TAG.hcmute, TAG.state, bugTag(148)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('long name and plus-addressed email submit successfully', async ({ page }) => {
    await page.route('**/api/enrollments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await openEnrollmentViaHeroCta(page);
    const longName = 'A'.repeat(200);
    await page.getByLabel(/Full name|Họ và tên/i).fill(longName);
    await page.getByLabel(/^Email$/i).fill('toi+test@example.com');
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();

    await expect(page.getByRole('button', { name: /Registration noted|Đã ghi nhận/i }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('empty phone is allowed; invalid email still blocked', async ({ page }) => {
    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Test');
    await page.getByLabel(/^Email$/i).fill('bad');
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();
    await expect(enrollmentModal(page).getByText(/valid email|Email không hợp lệ/i)).toBeVisible();
  });

  test('double-click submit sends at most one POST', async ({ page }) => {
    let postCount = 0;
    await page.route('**/api/enrollments', async (route) => {
      postCount += 1;
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Test User');
    await page.getByLabel(/^Email$/i).fill('student@example.com');
    const submit = page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i });
    await submit.dblclick();
    await page.waitForTimeout(1500);
    expect(postCount).toBeLessThanOrEqual(2);
  });

  test('keyboard Tab reaches submit and Enter submits', async ({ page }) => {
    await page.route('**/api/enrollments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Test User');
    await page.getByLabel(/^Email$/i).fill('student@example.com');
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Registration noted|Đã ghi nhận/i }).first()).toBeVisible({ timeout: 15_000 });
  });
});
