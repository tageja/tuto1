import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  mockPilotSpots,
  openEnrollmentViaHeroCta,
} from '../_shared/hcmute-home';

test.describe('Bug #153 — HCMUTE enrollment network error surfaced', {
  tag: [TAG.regression, TAG.hcmute, TAG.state, bugTag(153)],
}, () => {
  test('aborted enrollments POST shows user-facing error', async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.route('**/api/enrollments', async (route) => route.abort('failed'));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openEnrollmentViaHeroCta(page);
    await page.getByLabel(/Full name|Họ và tên/i).fill('Test User');
    await page.getByLabel(/^Email$/i).fill('student@example.com');
    await page.getByRole('button', { name: /Submit registration|Gửi đăng ký/i }).click();

    await expect(
      enrollmentModal(page).getByText(/Could not save|Không thể lưu|try again|thử lại/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
