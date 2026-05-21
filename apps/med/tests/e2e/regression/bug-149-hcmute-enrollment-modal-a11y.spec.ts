import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';
import {
  enrollmentModal,
  mockPilotSpots,
  openEnrollmentViaHeroCta,
} from '../_shared/hcmute-home';

test.describe('Bug #149 — HCMUTE enrollment modal a11y', {
  tag: [TAG.regression, TAG.hcmute, TAG.a11y, bugTag(149)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await mockPilotSpots(page, { taken: 5, total: 50, spotsLeft: 45, isFull: false });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openEnrollmentViaHeroCta(page);
    await page.getByRole('button', { name: 'Close' }).waitFor({ state: 'visible' });
  });

  test('close button is keyboard reachable with accessible label', async ({ page }) => {
    const close = page.getByRole('button', { name: /Close|Đóng/i });
    await expect(close).toHaveAttribute('aria-label', /Close|Đóng/i);
    await close.focus();
    await expect(close).toBeFocused();
  });

  test.fixme('focus trap keeps Tab inside modal — known gap', async ({ page }) => {
    await page.getByLabel(/Full name|Họ và tên/i).focus();
    for (let i = 0; i < 8; i += 1) await page.keyboard.press('Tab');
    const modal = enrollmentModal(page);
    const activeInModal = await modal.evaluate((root) => root.contains(document.activeElement));
    expect(activeInModal).toBe(true);
  });
});
