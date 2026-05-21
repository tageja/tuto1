import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  heroPilotCta,
  mockPilotSpots,
  openEnrollmentViaHeroCta,
} from '../_shared/hcmute-home';

test.describe('Bug #140 — HCMUTE enrollment modal validation and happy path', {
  tag: [TAG.regression, TAG.hcmute, TAG.state, bugTag(140)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('empty submit shows validation errors without POST', async ({ page }) => {
    let posted = false;
    await page.route('**/api/enrollments', async (route) => {
      posted = true;
      await route.continue();
    });

    await openEnrollmentViaHeroCta(page);
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();

    const modal = enrollmentModal(page);
    await expect(modal.getByText(/Please enter your full name|Vui lòng nhập họ và tên/i)).toBeVisible();
    await expect(modal.getByText(/Please enter your email|Vui lòng nhập email/i)).toBeVisible();
    expect(posted).toBe(false);
  });

  test('invalid email shows email error', async ({ page }) => {
    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Test User');
    await page.getByLabel(/^Email$/i).fill('not-an-email');
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();

    await expect(
      enrollmentModal(page).getByText(/valid email|Email không hợp lệ/i),
    ).toBeVisible();
  });

  test('valid submit shows success then modal dismisses on close', async ({ page }) => {
    await page.route('**/api/enrollments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Nguyen Van A');
    await page.getByLabel(/^Email$/i).fill('student@example.com');
    await page.getByLabel(/Phone|Zalo/i).fill('0901234567');
    await page.getByLabel(/Major|Ngành/i).fill('IT');

    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();

    await expect(
      page.locator('#hcmute-pilot').getByRole('button', { name: /Registration noted|Đã ghi nhận đăng ký/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(enrollmentModal(page)).toBeHidden();
  });
});
