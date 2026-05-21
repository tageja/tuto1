import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  heroPilotCta,
  heroScarcityBadge,
  mockPilotSpots,
} from '../_shared/hcmute-home';

test.describe('Bug #141 — HCMUTE SPOTS_FULL disables enrollment', {
  tag: [TAG.regression, TAG.hcmute, TAG.state, bugTag(141)],
}, () => {
  test('full pilot blocks CTA and scarcity badge does not open modal', async ({ page }) => {
    await mockPilotSpots(page, { taken: 50, total: 50, spotsLeft: 0, isFull: true });
    await page.route('**/api/enrollments', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'SPOTS_FULL', spotsLeft: 0 }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cta = heroPilotCta(page);
    await expect(cta).toBeDisabled();
    await expect(cta).toContainText(/Registration closed|Đã đóng đăng ký/i);

    const badge = heroScarcityBadge(page);
    await expect(badge).toContainText(/All 50 spots taken|Đã hết 50 suất/i);
    await expect(badge).toBeDisabled();

    await badge.click({ force: true });
    await expect(enrollmentModal(page)).toBeHidden();
  });
});
